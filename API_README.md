# Universal Soul AI API Server

REST API and WebSocket server that bridges TwoSoul Mobile (React Native) with Universal Soul AI backend (Python).

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
pip install -r requirements.txt
```

### Start the Server

**Linux/Mac:**
```bash
./start_api.sh
```

**Windows:**
```cmd
start_api.bat
```

**Direct Python:**
```bash
python api_server.py
```

The API server will start at:
- **REST API**: http://localhost:8000
- **WebSocket**: ws://localhost:8000/ws
- **API Docs**: http://localhost:8000/docs (Swagger UI)
- **Alternative Docs**: http://localhost:8000/redoc

---

## 📡 REST API Endpoints

### 1. Root Endpoint
```http
GET /
```

Returns API information and available endpoints.

**Response:**
```json
{
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
```

---

### 2. System Status
```http
GET /api/status
```

Get current system status and metrics.

**Response:**
```json
{
  "status": "operational",
  "system_initialized": true,
  "active_sessions": 5,
  "total_requests": 1247,
  "uptime_seconds": 3600.0
}
```

---

### 3. Available Personalities
```http
GET /api/personalities
```

Get list of available personality modes.

**Response:**
```json
[
  {
    "mode": "professional",
    "description": "Formal, business-oriented communication"
  },
  {
    "mode": "friendly",
    "description": "Warm, approachable, and helpful"
  },
  ...
]
```

---

### 4. Chat (Process Message)
```http
POST /api/chat
```

Send a message to Universal Soul AI and get a response.

**Request Body:**
```json
{
  "message": "Hello, how are you?",
  "user_id": "user123",
  "personality_mode": "friendly",
  "context": {}
}
```

**Response:**
```json
{
  "message": "[Friendly mode] Hey there! I received your message...",
  "user_id": "user123",
  "personality_mode": "friendly",
  "timestamp": "2025-01-26T12:34:56.789Z",
  "processing_time": 0.523
}
```

**Personality Modes:**
- `professional` - Formal, business-oriented
- `friendly` - Warm, approachable
- `energetic` - Enthusiastic, dynamic
- `calm` - Peaceful, reassuring
- `creative` - Imaginative, artistic
- `analytical` - Logical, precise

**TwoSoul Mobile Compatibility:**
- `serious` → maps to `professional`
- `goofy` → maps to `energetic`
- `adaptive` → maps to `friendly`
- `casual` → maps to `friendly`

---

### 5. Health Check
```http
GET /health
```

Simple health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-26T12:34:56.789Z"
}
```

---

## 🔌 WebSocket Connection

### Connect to WebSocket
```javascript
const ws = new WebSocket('ws://localhost:8000/ws');

ws.onopen = () => {
  console.log('Connected to Universal Soul AI');
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Received:', message);
};
```

### WebSocket Message Format

**Client → Server (Send Chat):**
```json
{
  "type": "chat",
  "data": {
    "message": "Hello!",
    "user_id": "user123",
    "personality_mode": "friendly"
  }
}
```

**Server → Client (Chat Response):**
```json
{
  "type": "chat",
  "data": {
    "message": "Hey there! How can I help?",
    "user_id": "user123",
    "personality_mode": "friendly"
  },
  "timestamp": "2025-01-26T12:34:56.789Z"
}
```

**Ping/Pong (Keep-Alive):**
```json
// Client → Server
{
  "type": "ping"
}

// Server → Client
{
  "type": "pong",
  "data": {
    "message": "pong"
  },
  "timestamp": "2025-01-26T12:34:56.789Z"
}
```

**Error Messages:**
```json
{
  "type": "error",
  "data": {
    "error": "Error description",
    "message": "User-friendly error message"
  },
  "timestamp": "2025-01-26T12:34:56.789Z"
}
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# API Server Configuration
API_HOST=0.0.0.0
API_PORT=8000
LOG_LEVEL=INFO

# Universal Soul AI Configuration
HRM_MODEL_PATH=models/hrm_27m.bin
COACT_SUCCESS_THRESHOLD=0.6076
```

### CORS Configuration

By default, the API allows all origins (`*`). For production, update `api_server.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],  # Specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 📱 React Native Integration

### Install Dependencies

```bash
npm install axios
# or
npm install @react-native-community/websocket
```

### Example Usage

```typescript
// API Client
const API_URL = 'http://localhost:8000';

async function sendMessage(message: string, personality: string) {
  const response = await fetch(`${API_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      personality_mode: personality,
      user_id: 'user123'
    })
  });
  
  return await response.json();
}

// WebSocket Client
const ws = new WebSocket('ws://localhost:8000/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'chat') {
    console.log('AI Response:', data.data.message);
  }
};

function sendWebSocketMessage(message: string) {
  ws.send(JSON.stringify({
    type: 'chat',
    data: {
      message,
      personality_mode: 'friendly'
    }
  }));
}
```

---

## 🐛 Debugging

### Enable Debug Logging

```bash
# In api_server.py, change:
logging.basicConfig(level=logging.DEBUG)
```

### Check API Documentation

Visit http://localhost:8000/docs for interactive API documentation (Swagger UI).

### Test Endpoints

```bash
# Test health endpoint
curl http://localhost:8000/health

# Test chat endpoint
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello!",
    "personality_mode": "friendly"
  }'

# Test WebSocket (using websocat)
websocat ws://localhost:8000/ws
```

---

## 🔒 Security Considerations

1. **Production CORS**: Update `allow_origins` to specific domains
2. **Authentication**: Add JWT token authentication (TODO)
3. **Rate Limiting**: Implement rate limiting (TODO)
4. **HTTPS**: Use HTTPS in production with proper SSL certificates
5. **Input Validation**: All inputs are validated via Pydantic models

---

## 📊 Performance

- **HRM Engine**: 27M parameter hierarchical reasoning
- **CoAct-1**: 60.76% success rate on automation tasks
- **Average Response Time**: ~0.5-2 seconds depending on reasoning depth
- **Concurrent Connections**: Supports multiple WebSocket connections

---

## 🚧 Future Enhancements

- [ ] JWT Authentication
- [ ] Rate limiting
- [ ] Message history/persistence
- [ ] Multi-agent orchestration API
- [ ] Voice processing endpoints
- [ ] Vision AI endpoints
- [ ] Streaming responses (SSE)
- [ ] Redis caching
- [ ] PostgreSQL storage

---

## 📞 Support

For issues or questions:
- Check logs in `logs/universal_soul_ai.log`
- Visit http://localhost:8000/docs for API documentation
- Review the main project README.md

---

**Built with Universal Soul AI** 🤖✨
