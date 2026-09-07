"""
FastAPI Server for Universal Soul AI
====================================

REST API and WebSocket server to bridge TwoSoul Mobile (React Native)
with Universal Soul AI backend (Python).
"""

import asyncio
import logging
import json
import uuid
from datetime import datetime
from typing import Dict, Any, Optional, List
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from main import UniversalSoulAI
from core.interfaces.data_structures import PersonalityMode, UserRole

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global Universal Soul AI instance
soul_ai: Optional[UniversalSoulAI] = None

# Active WebSocket connections
active_connections: Dict[str, WebSocket] = {}


# Pydantic models for API
class ChatRequest(BaseModel):
    message: str = Field(..., description="User message")
    user_id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="User ID")
    personality_mode: str = Field(default="friendly", description="Personality mode")
    context: Optional[Dict[str, Any]] = Field(default=None, description="Additional context")


class ChatResponse(BaseModel):
    message: str = Field(..., description="AI response")
    user_id: str = Field(..., description="User ID")
    personality_mode: str = Field(..., description="Personality mode used")
    timestamp: str = Field(..., description="Response timestamp")
    processing_time: float = Field(..., description="Processing time in seconds")


class SystemStatusResponse(BaseModel):
    status: str = Field(..., description="System status")
    system_initialized: bool = Field(..., description="Is system initialized")
    active_sessions: int = Field(..., description="Number of active sessions")
    total_requests: int = Field(..., description="Total requests processed")
    uptime_seconds: float = Field(..., description="System uptime")


class PersonalityInfo(BaseModel):
    mode: str = Field(..., description="Personality mode name")
    description: str = Field(..., description="Personality description")


class WebSocketMessage(BaseModel):
    type: str = Field(..., description="Message type: 'chat', 'status', 'error'")
    data: Dict[str, Any] = Field(..., description="Message data")
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


# Lifecycle management
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle"""
    global soul_ai

    # Startup
    logger.info("Starting Universal Soul AI API Server...")
    soul_ai = UniversalSoulAI()
    await soul_ai.initialize()
    logger.info("Universal Soul AI initialized successfully")

    yield

    # Shutdown
    logger.info("Shutting down Universal Soul AI...")
    if soul_ai:
        await soul_ai.shutdown()
    logger.info("Universal Soul AI shut down complete")


# Create FastAPI app
app = FastAPI(
    title="Universal Soul AI API",
    description="REST API and WebSocket server for TwoSoul Mobile",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for React Native
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Helper function to map personality string to enum
def get_personality_mode(personality_str: str) -> PersonalityMode:
    """Convert personality string to PersonalityMode enum"""
    personality_map = {
        "professional": PersonalityMode.PROFESSIONAL,
        "friendly": PersonalityMode.FRIENDLY,
        "energetic": PersonalityMode.ENERGETIC,
        "calm": PersonalityMode.CALM,
        "creative": PersonalityMode.CREATIVE,
        "analytical": PersonalityMode.ANALYTICAL,
        # TwoSoul Mobile naming compatibility
        "serious": PersonalityMode.PROFESSIONAL,
        "goofy": PersonalityMode.ENERGETIC,
        "adaptive": PersonalityMode.FRIENDLY,
        "casual": PersonalityMode.FRIENDLY,
    }
    return personality_map.get(personality_str.lower(), PersonalityMode.FRIENDLY)


# REST Endpoints

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Universal Soul AI API",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": {
            "chat": "/api/chat",
            "websocket": "/ws",
            "status": "/api/status",
            "personalities": "/api/personalities"
        }
    }


@app.get("/api/status", response_model=SystemStatusResponse)
async def get_status():
    """Get system status"""
    if not soul_ai or not soul_ai.is_initialized:
        raise HTTPException(status_code=503, detail="System not initialized")

    status = await soul_ai.get_system_status()

    return SystemStatusResponse(
        status="operational",
        system_initialized=status["system_initialized"],
        active_sessions=status["active_sessions"],
        total_requests=status["system_metrics"]["total_requests"],
        uptime_seconds=0.0  # TODO: Track actual uptime
    )


@app.get("/api/personalities", response_model=List[PersonalityInfo])
async def get_personalities():
    """Get available personality modes"""
    personalities = [
        PersonalityInfo(
            mode="professional",
            description="Formal, business-oriented communication"
        ),
        PersonalityInfo(
            mode="friendly",
            description="Warm, approachable, and helpful"
        ),
        PersonalityInfo(
            mode="energetic",
            description="Enthusiastic and dynamic responses"
        ),
        PersonalityInfo(
            mode="calm",
            description="Peaceful and reassuring tone"
        ),
        PersonalityInfo(
            mode="creative",
            description="Imaginative and artistic approach"
        ),
        PersonalityInfo(
            mode="analytical",
            description="Logical and precise communication"
        ),
    ]
    return personalities


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Process a chat message"""
    if not soul_ai or not soul_ai.is_initialized:
        raise HTTPException(status_code=503, detail="System not initialized")

    try:
        start_time = asyncio.get_event_loop().time()

        # Get personality mode
        personality_mode = get_personality_mode(request.personality_mode)

        # Create context
        context = request.context or {}
        context["personality_mode"] = personality_mode

        # Process request through Universal Soul AI
        response = await soul_ai.process_user_request(
            user_input=request.message,
            user_id=request.user_id,
            context=context
        )

        processing_time = asyncio.get_event_loop().time() - start_time

        return ChatResponse(
            message=response,
            user_id=request.user_id,
            personality_mode=request.personality_mode,
            timestamp=datetime.utcnow().isoformat(),
            processing_time=processing_time
        )

    except Exception as e:
        logger.error(f"Error processing chat request: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }


# WebSocket Endpoint

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time communication"""
    connection_id = str(uuid.uuid4())
    await websocket.accept()
    active_connections[connection_id] = websocket

    logger.info(f"WebSocket connection established: {connection_id}")

    try:
        # Send welcome message
        welcome_msg = WebSocketMessage(
            type="status",
            data={
                "message": "Connected to Universal Soul AI",
                "connection_id": connection_id,
                "system_initialized": soul_ai.is_initialized if soul_ai else False
            }
        )
        await websocket.send_json(welcome_msg.model_dump())

        # Listen for messages
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message_data = json.loads(data)

            logger.info(f"Received WebSocket message: {message_data}")

            # Process based on message type
            if message_data.get("type") == "chat":
                # Extract chat data
                chat_data = message_data.get("data", {})
                user_message = chat_data.get("message", "")
                user_id = chat_data.get("user_id", connection_id)
                personality_mode_str = chat_data.get("personality_mode", "friendly")

                # Get personality mode
                personality_mode = get_personality_mode(personality_mode_str)

                # Create context
                context = {"personality_mode": personality_mode}

                # Process through Universal Soul AI
                try:
                    response = await soul_ai.process_user_request(
                        user_input=user_message,
                        user_id=user_id,
                        context=context
                    )

                    # Send response back
                    response_msg = WebSocketMessage(
                        type="chat",
                        data={
                            "message": response,
                            "user_id": user_id,
                            "personality_mode": personality_mode_str
                        }
                    )
                    await websocket.send_json(response_msg.model_dump())

                except Exception as e:
                    logger.error(f"Error processing WebSocket chat: {e}")
                    error_msg = WebSocketMessage(
                        type="error",
                        data={
                            "error": str(e),
                            "message": "Failed to process message"
                        }
                    )
                    await websocket.send_json(error_msg.model_dump())

            elif message_data.get("type") == "ping":
                # Respond to ping
                pong_msg = WebSocketMessage(
                    type="pong",
                    data={"message": "pong"}
                )
                await websocket.send_json(pong_msg.model_dump())

            else:
                # Unknown message type
                error_msg = WebSocketMessage(
                    type="error",
                    data={
                        "error": f"Unknown message type: {message_data.get('type')}",
                        "message": "Unsupported message type"
                    }
                )
                await websocket.send_json(error_msg.model_dump())

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: {connection_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        # Clean up connection
        if connection_id in active_connections:
            del active_connections[connection_id]
        logger.info(f"WebSocket connection closed: {connection_id}")


# Run server
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "api_server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
