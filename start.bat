@echo off
echo ========================================
echo   TwoSoul Mobile - Starting...
echo ========================================
echo.

set PATH=C:\Users\Richard.Downing\nodejs;%PATH%

echo Starting Expo development server...
echo.
echo Options:
echo   - Press 'w' to open in web browser
echo   - Scan QR code with Expo Go app
echo   - Press Ctrl+C to stop
echo.

C:\Users\Richard.Downing\nodejs\node.exe node_modules\expo\bin\cli.js start

