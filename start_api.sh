#!/bin/bash
# Start Universal Soul AI API Server

echo "Starting Universal Soul AI API Server..."
echo "API will be available at: http://localhost:8000"
echo "WebSocket will be available at: ws://localhost:8000/ws"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Create necessary directories
mkdir -p logs data models cache config

# Start the server
python api_server.py
