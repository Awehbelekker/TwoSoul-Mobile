# 📱 TwoSoul Mobile - React Native App

A beautiful, personality-driven AI assistant mobile app built with React Native and Expo.

## ✨ Features

- 🎭 **6 Personality Modes**: Serious, Goofy, Creative, Adaptive, Professional, Casual
- 💬 **Chat Interface**: Beautiful message bubbles with timestamps
- 🎨 **Dynamic Theming**: Each personality has its own color scheme
- 📱 **Minimizable Widget**: Collapse to save screen space
- ⚡ **Real-time Updates**: Instant message delivery
- 🔄 **State Management**: Powered by Zustand

## 🚀 Quick Start

### **Option 1: Run the Start Script (Easiest)**

```powershell
.\start.ps1
```

Then:
- Press `w` to open in web browser
- Or scan QR code with Expo Go app on your phone

### **Option 2: Manual Start**

```powershell
# Set PATH
$env:Path = "C:\Users\Richard.Downing\nodejs;$env:Path"

# Start Expo
npm start
```

### **Option 3: Direct Node Execution**

```powershell
C:\Users\Richard.Downing\nodejs\node.exe node_modules\expo\bin\cli.js start
```

## 📲 Testing on Your Phone

1. **Install Expo Go** from Google Play Store
2. **Run** `.\start.ps1` on your computer
3. **Scan** the QR code with Expo Go app
4. **Test** the app on your phone!

## 🏗️ Building APK

### **Method 1: Cloud Build (Recommended - No Android Studio)**

```powershell
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo (create free account at expo.dev)
eas login

# Configure build
eas build:configure

# Build APK (cloud build, takes 10-15 minutes)
eas build --platform android --profile preview

# Download APK from Expo dashboard
```

### **Method 2: Local Build (Requires Android Studio)**

```powershell
# Prebuild native code
npx expo prebuild

# Build APK
cd android
.\gradlew assembleRelease

# APK location: android/app/build/outputs/apk/release/app-release.apk
```

## 📁 Project Structure

```
twosoul-mobile/
├── App.tsx              # Main app component
├── app.json             # Expo configuration
├── package.json         # Dependencies
├── start.ps1            # Start script
├── assets/              # Images and icons
└── README.md            # This file
```

## 🎨 Personality Modes

| Mode | Color | Emoji | Description |
|------|-------|-------|-------------|
| Serious | Blue | 🎓 | Professional and focused |
| Goofy | Orange | 🤪 | Fun and playful |
| Creative | Purple | 🎨 | Artistic and imaginative |
| Adaptive | Green | 🌟 | Balanced and flexible |
| Professional | Gray | 💼 | Business-oriented |
| Casual | Pink | 😊 | Friendly and relaxed |

## 🛠️ Tech Stack

- **React Native** - Mobile framework
- **Expo** - Development platform
- **TypeScript** - Type safety
- **Zustand** - State management (ready to integrate)
- **React Native Reanimated** - Smooth animations

## 📝 Next Steps

1. ✅ Test the app on your phone with Expo Go
2. ⬜ Integrate with TwoSoul backend API
3. ⬜ Add voice input/output
4. ⬜ Add camera integration
5. ⬜ Build and distribute APK

## 🐛 Troubleshooting

### **"node is not recognized"**
Run: `$env:Path = "C:\Users\Richard.Downing\nodejs;$env:Path"`

### **"Cannot find module 'expo'"**
Run: `npm install`

### **Port already in use**
Kill the process using port 8081 or use a different port

### **QR code not scanning**
Make sure your phone and computer are on the same WiFi network

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)

## 🎯 Current Status

✅ **App Created** - Full React Native app with UI  
✅ **Dependencies Installed** - All packages ready  
⏳ **Testing** - Ready to test on phone or web  
⏳ **APK Build** - Ready to build when tested  

---

**Run `.\start.ps1` to begin!** 🚀

