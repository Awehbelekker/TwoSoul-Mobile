# 🏗️ Building Android APK - Step by Step Guide

## 🎯 Recommended Method: EAS Build (Cloud)

This method builds your APK in the cloud - **NO Android Studio required!**

### **Step 1: Create Expo Account**
1. Go to https://expo.dev/signup
2. Create a free account
3. Verify your email

### **Step 2: Install EAS CLI**
```powershell
$env:Path = "C:\Users\Richard.Downing\nodejs;$env:Path"
npm install -g eas-cli
```

### **Step 3: Login**
```powershell
eas login
```
Enter your Expo credentials.

### **Step 4: Configure Build**
```powershell
eas build:configure
```
- Select "Android" when prompted
- Accept default settings

### **Step 5: Build APK**
```powershell
eas build --platform android --profile preview
```

This will:
- Upload your code to Expo servers
- Build the APK in the cloud (takes 10-15 minutes)
- Provide a download link when complete

### **Step 6: Download APK**
1. Wait for build to complete
2. Click the download link in terminal
3. Or go to https://expo.dev and find your build
4. Download the APK file

### **Step 7: Install on Phone**
1. Transfer APK to your phone
2. Enable "Install from Unknown Sources" in Android settings
3. Open the APK file
4. Install the app!

---

## 🔧 Alternative Method: Local Build

**Requirements:**
- Android Studio installed
- Java JDK 11 or higher
- Android SDK configured

### **Steps:**

```powershell
# 1. Prebuild native Android project
npx expo prebuild

# 2. Navigate to android folder
cd android

# 3. Build release APK
.\gradlew assembleRelease

# 4. Find APK at:
# android/app/build/outputs/apk/release/app-release.apk
```

---

## 📊 Build Comparison

| Method | Time | Requirements | Difficulty | Cost |
|--------|------|--------------|------------|------|
| **EAS Cloud** | 15 min | Expo account | ⭐ Easy | Free tier |
| **Local Build** | 1-2 hours | Android Studio | ⭐⭐⭐ Hard | Free |

---

## 🎯 Recommended: Use EAS Cloud Build

**Why?**
- ✅ No Android Studio installation
- ✅ No SDK configuration
- ✅ Builds in the cloud
- ✅ Works on any computer
- ✅ Free tier available
- ✅ Automatic signing

**Just run:**
```powershell
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview
```

Then download your APK! 🎉

---

## 🐛 Troubleshooting

### **"eas: command not found"**
```powershell
$env:Path = "C:\Users\Richard.Downing\nodejs;$env:Path"
npm install -g eas-cli
```

### **"Not logged in"**
```powershell
eas login
```

### **"Build failed"**
Check the build logs at expo.dev for detailed error messages.

### **"APK won't install"**
Enable "Install from Unknown Sources" in Android Settings > Security

---

## 📱 Testing Before Building

**Always test first!**

```powershell
# Start dev server
.\start.ps1

# Test on phone with Expo Go app
# OR press 'w' to test in browser
```

Make sure everything works before building the APK!

---

## 🎉 Quick Start Commands

```powershell
# Set PATH
$env:Path = "C:\Users\Richard.Downing\nodejs;$env:Path"

# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Build APK
eas build --platform android --profile preview
```

That's it! Your APK will be ready in 10-15 minutes! 🚀

