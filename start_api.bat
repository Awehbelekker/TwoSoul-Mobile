@echo off
REM Start Universal Soul AI API Server

echo Starting Universal Soul AI API Server...
echo API will be available at: http://localhost:8000
echo WebSocket will be available at: ws://localhost:8000/ws
echo.
echo Press Ctrl+C to stop the server
echo.

REM Activate virtual environment if it exists
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
)

REM Create necessary directories
if not exist logs mkdir logs
if not exist data mkdir data
if not exist models mkdir models
if not exist cache mkdir cache
if not exist config mkdir config

REM Start the server
python api_server.py
