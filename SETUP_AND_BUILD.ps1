# TwoSoul Mobile - Complete Setup and Build Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TwoSoul Mobile - Setup & Build APK   " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Set Node.js path
$env:Path = "C:\Users\Richard.Downing\nodejs;$env:Path"

Write-Host "[1/5] Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = & node --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] Node.js: $nodeVersion" -ForegroundColor Green
    } else {
        Write-Host "  [ERROR] Node.js not found!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "  [ERROR] Failed to check Node.js: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[2/5] Installing dependencies..." -ForegroundColor Yellow
Write-Host "  This may take 5-10 minutes..." -ForegroundColor Yellow
& npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "  [ERROR] Failed to install dependencies!" -ForegroundColor Red
    exit 1
}
Write-Host "  [OK] Dependencies installed" -ForegroundColor Green

Write-Host ""
Write-Host "[3/5] Installing EAS CLI (for building APK)..." -ForegroundColor Yellow
& npm install -g eas-cli

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Setup Complete!                      " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Next Steps to Build APK:" -ForegroundColor Cyan
Write-Host ""
Write-Host "OPTION A - Test on Your Phone First (Recommended):" -ForegroundColor Yellow
Write-Host "  1. Install 'Expo Go' app from Google Play Store" -ForegroundColor White
Write-Host "  2. Run: npm start" -ForegroundColor White
Write-Host "  3. Scan the QR code with your phone" -ForegroundColor White
Write-Host "  4. Test the app!" -ForegroundColor White
Write-Host ""
Write-Host "OPTION B - Build APK (Cloud Build - No Android Studio Needed):" -ForegroundColor Yellow
Write-Host "  1. Create FREE account at: https://expo.dev/signup" -ForegroundColor White
Write-Host "  2. Run: eas login" -ForegroundColor White
Write-Host "  3. Run: eas build:configure" -ForegroundColor White
Write-Host "  4. Run: eas build --platform android --profile preview" -ForegroundColor White
Write-Host "  5. Wait 10-15 minutes for cloud build" -ForegroundColor White
Write-Host "  6. Download APK from Expo dashboard" -ForegroundColor White
Write-Host ""
Write-Host "OPTION C - Build APK Locally (Requires Android Studio):" -ForegroundColor Yellow
Write-Host "  1. Install Android Studio" -ForegroundColor White
Write-Host "  2. Run: npx expo prebuild" -ForegroundColor White
Write-Host "  3. Run: cd android && ./gradlew assembleRelease" -ForegroundColor White
Write-Host "  4. APK at: android/app/build/outputs/apk/release/" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Recommended: Start with OPTION A to test!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Run 'npm start' now to begin!" -ForegroundColor Green
Write-Host ""

