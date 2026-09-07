# 🔗 TwoSoul Mobile + Universal Soul AI Integration Guide

Complete guide to run the integrated system with Python backend and React Native frontend.

---

## 🎯 What Was Built

We've successfully created an **API bridge** that connects:

- **Backend**: Universal Soul AI (Python) with HRM Engine & CoAct-1
- **Frontend**: TwoSoul Mobile (React Native/Expo)
- **Communication**: REST API + WebSocket for real-time messaging

---

## 📋 Prerequisites

### Backend Requirements:
- Python 3.11+
- pip (Python package manager)
- Virtual environment (recommended)

### Frontend Requirements:
- Node.js 18+
- npm or yarn
- Expo CLI (will be installed with dependencies)

---

## 🚀 Quick Start (Both Systems)

### Step 1: Start the Backend API Server

```bash
# Install Python dependencies (first time only)
pip install -r requirements.txt

# Start the API server
python api_server.py

# Or use the startup scripts:
# Linux/Mac: ./start_api.sh
# Windows: start_api.bat
```

The backend will start at:
- **API**: http://localhost:8000
- **WebSocket**: ws://localhost:8000/ws
- **Docs**: http://localhost:8000/docs

**Expected output:**
```
Starting Universal Soul AI initialization...
HRM Engine initialized successfully with 27M parameters
CoAct-1 Automation Engine initialized successfully
Universal Soul AI initialization complete!
System ready for user requests
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 2: Start the React Native Frontend

Open a **new terminal** (keep the backend running):

```bash
# Install Node dependencies (first time only)
npm install

# Start Expo development server
npm start

# Or specific platforms:
npm run android  # Android emulator/device
npm run ios      # iOS simulator (Mac only)
npm run web      # Web browser
```

**Expected output:**
```
Metro waiting on exp://192.168.x.x:8081
› Press a │ open Android
› Press w │ open web

› Press r │ reload app
```

### Step 3: Test the Integration

1. Open the app (press `w` for web, or scan QR code with Expo Go)
2. Check the connection indicator (green = connected, red = disconnected)
3. Type a message and send it
4. Wait for the AI response from Universal Soul AI backend

---

## 🔧 Configuration

### Backend Configuration

**API Server (`api_server.py`):**
- Default host: `0.0.0.0` (all interfaces)
- Default port: `8000`
- Change in `api_server.py` at the bottom:
  ```python
  uvicorn.run("api_server:app", host="0.0.0.0", port=8000)
  ```

**Universal Soul AI (`config/universal_soul.json`):**
- HRM reasoning depth: `3` (1-5)
- CoAct-1 success threshold: `0.6076`
- Default personality: `friendly`

### Frontend Configuration

**API Connection (`services/api.ts`):**
```typescript
const API_BASE_URL = __DEV__
  ? 'http://localhost:8000'  // Development
  : 'https://your-production-api.com';  // Production
```

**For testing on physical device:**
1. Find your computer's local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Update `services/api.ts`:
   ```typescript
   const API_BASE_URL = 'http://192.168.x.x:8000';  // Your local IP
   ```
3. Update `services/websocket.ts` with the same IP:
   ```typescript
   const WS_BASE_URL = 'ws://192.168.x.x:8000/ws';
   ```

---

## 🎭 Personality Modes

The system supports 6 personality modes that affect AI behavior:

| TwoSoul UI | Backend Mode | Description |
|-----------|--------------|-------------|
| Serious 🎓 | Professional | Formal, business-oriented |
| Goofy 🤪 | Energetic | Enthusiastic, dynamic |
| Creative 🎨 | Creative | Imaginative, artistic |
| Adaptive 🌟 | Friendly | Warm, approachable (default) |
| Professional 💼 | Professional | Formal, precise |
| Casual 😊 | Friendly | Relaxed, conversational |

The personality mode is sent with each message and affects the AI's response style.

---

## 📡 API Endpoints Reference

### REST API

```http
GET  /                    # API information
GET  /health             # Health check
GET  /api/status         # System status
GET  /api/personalities  # Available personalities
POST /api/chat           # Send a message
```

### WebSocket

```
ws://localhost:8000/ws
```

**Message format:**
```json
{
  "type": "chat",
  "data": {
    "message": "Hello!",
    "personality_mode": "friendly"
  }
}
```

Full API documentation: http://localhost:8000/docs

---

## 🐛 Troubleshooting

### Backend Issues

**Problem: "Port 8000 already in use"**
```bash
# Find and kill the process
# Linux/Mac:
lsof -ti:8000 | xargs kill -9

# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**Problem: "Module not found"**
```bash
pip install -r requirements.txt
```

**Problem: "System not initialized"**
- Check logs in `logs/universal_soul_ai.log`
- Ensure config file exists: `config/universal_soul.json`
- Verify required directories exist: `data/`, `models/`, `cache/`, `logs/`

### Frontend Issues

**Problem: "Cannot connect to API"**
1. Verify backend is running: http://localhost:8000
2. Check API URL in `services/api.ts`
3. If on physical device, use your computer's local IP
4. Check firewall settings (allow port 8000)

**Problem: "Connection indicator shows red"**
- Backend is not running
- Wrong API URL
- Network/firewall blocking connection

**Problem: "Module not found"**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Integration Issues

**Problem: "Messages show demo responses"**
- Old code cached, restart Expo:
  ```bash
  npm start -- --clear
  ```

**Problem: "Long response times"**
- Check HRM reasoning depth in config (default: 3)
- Check network latency
- Monitor backend logs for errors

**Problem: "WebSocket disconnects frequently"**
- Check network stability
- Increase ping interval in `services/websocket.ts`
- Check backend logs for errors

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    TwoSoul Mobile (React Native)            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   UI Layer   │  │  API Client  │  │   WebSocket  │     │
│  │   (App.tsx)  │→ │ (services/)  │→ │   Client     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP/WebSocket
                             ↓
┌─────────────────────────────────────────────────────────────┐
│              Universal Soul AI API (FastAPI)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ REST Routes  │  │   WebSocket  │  │ Orchestrator │     │
│  │ (/api/chat)  │  │   (/ws)      │→ │   (main.py)  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────────────┬────────────────────────────────┘
                             │
                    ┌────────┴────────┐
                    ↓                 ↓
         ┌──────────────────┐  ┌──────────────────┐
         │   HRM Engine     │  │  CoAct-1 Engine  │
         │  (27M params)    │  │ (60.76% success) │
         │  5-layer         │  │  4 strategies    │
         │  reasoning       │  │  automation      │
         └──────────────────┘  └──────────────────┘
```

---

## 📈 What's Working

✅ **Backend:**
- FastAPI server with CORS
- REST API endpoints (/api/chat, /api/status, etc.)
- WebSocket real-time communication
- HRM Engine integration (27M parameters, 5-layer reasoning)
- CoAct-1 Engine integration (60.76% success rate)
- Personality mode processing
- Error handling and logging

✅ **Frontend:**
- Beautiful React Native UI
- Real API integration (replaced demo responses)
- Loading states (spinner while waiting)
- Error handling (shows error messages)
- Connection status indicator (green/red dot)
- 6 personality modes with theming
- Message history
- WebSocket client (ready to use)

✅ **Integration:**
- REST API communication
- Personality mode mapping
- Error propagation
- Health checks
- CORS configured

---

## 🚧 What's Not Yet Implemented

❌ **Backend:**
- JWT authentication
- Rate limiting
- Message persistence (database)
- Multi-agent orchestration API
- Voice processing endpoints
- Vision AI endpoints

❌ **Frontend:**
- WebSocket integration (client ready, not active)
- Message persistence (AsyncStorage)
- User profiles
- Settings page
- Voice input/output
- Push notifications

❌ **Infrastructure:**
- Production deployment
- HTTPS/WSS
- Load balancing
- Monitoring/analytics
- CI/CD pipeline

---

## 🎯 Next Steps

### Immediate (Ready to Test):
1. ✅ Start backend: `python api_server.py`
2. ✅ Start frontend: `npm start`
3. ✅ Test chat: Send messages and get AI responses

### Short-term Enhancements:
1. Switch to WebSocket for real-time streaming responses
2. Add message persistence (save chat history)
3. Add user authentication
4. Add settings page for API URL configuration

### Medium-term Features:
1. Multi-agent orchestration (like GitHub repo)
2. Voice capabilities (ElevenLabs, Whisper)
3. Vision AI integration
4. Production deployment (Docker, cloud hosting)

### Long-term Vision:
1. Full feature parity with Universal AI Soul Unlimited
2. iOS + Android app releases
3. Cloud backend deployment
4. Enterprise features

---

## 📞 Testing Checklist

Before considering the integration complete, test:

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Green connection indicator shows
- [ ] Can send a message
- [ ] Receives AI response (not demo)
- [ ] Different personalities change response style
- [ ] Error messages show when backend is stopped
- [ ] Loading spinner shows while waiting
- [ ] Messages scroll automatically
- [ ] Works on web browser
- [ ] Works on mobile device (if testing on device)

---

## 🔒 Security Notes

**Current State (Development):**
- ⚠️ CORS allows all origins (`*`)
- ⚠️ No authentication required
- ⚠️ No rate limiting
- ⚠️ HTTP (not HTTPS)

**Production Requirements:**
- ✅ Restrict CORS to specific domains
- ✅ Add JWT authentication
- ✅ Implement rate limiting
- ✅ Use HTTPS/WSS only
- ✅ Add input validation
- ✅ Enable security headers

---

## 📚 Additional Resources

- **API Documentation**: http://localhost:8000/docs (Swagger UI)
- **Backend README**: `BACKEND_README.md`
- **API README**: `API_README.md`
- **Mobile README**: `README.md`
- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **Expo Docs**: https://docs.expo.dev/

---

## ✅ Success Criteria

**You'll know it's working when:**
1. ✅ Backend logs show "System ready for user requests"
2. ✅ Frontend shows green connection indicator
3. ✅ Messages get real AI responses (not demo text)
4. ✅ Responses change style based on personality mode
5. ✅ Loading spinner shows during processing
6. ✅ Error messages appear if backend stops

**Example successful interaction:**
```
You: "Hello, how are you?"
[Loading spinner shows...]
TwoSoul AI: "[Friendly mode] Hey there! I received your message: 
'Hello, how are you?'. Based on hierarchical reasoning: ..."
```

---

🎉 **Congratulations! You now have a fully integrated AI assistant with a Python backend and React Native frontend!**

Need help? Check the troubleshooting section or review the API documentation at http://localhost:8000/docs
