# TwoSoul Mobile - Start Development Server
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TwoSoul Mobile - Starting...         " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Set Node.js path
$env:Path = "C:\Users\Richard.Downing\nodejs;$env:Path"

Write-Host "Setting up environment..." -ForegroundColor Yellow
Write-Host ""

# Start Expo
Write-Host "Starting Expo development server..." -ForegroundColor Green
Write-Host ""
Write-Host "Options:" -ForegroundColor Cyan
Write-Host "  - Press 'w' to open in web browser" -ForegroundColor White
Write-Host "  - Scan QR code with Expo Go app on your phone" -ForegroundColor White
Write-Host "  - Press 'Ctrl+C' to stop" -ForegroundColor White
Write-Host ""

& C:\Users\Richard.Downing\nodejs\node.exe node_modules\expo\bin\cli.js start

