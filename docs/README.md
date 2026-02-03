# Simple Attendance App Setup (Expo / React Native)

This guide provides the initialization steps for an Expo-based attendance app.

## 1. Project Initialization

```bash
# Create Expo app
npx create-expo-app@latest mobile-app --template blank-typescript

# Navigate to project
cd mobile-app

# Install essential dependencies
npx expo install expo-location expo-camera expo-image-picker axios
npm install @react-navigation/native @react-navigation/stack
npx expo install react-native-screens react-native-safe-area-context
```

## 2. Directory Structure

Recommended structure:

```text
mobile-app/
├── src/
│   ├── components/       # Shared UI components
│   ├── screens/          # Main screens (Login, Home, etc.)
│   ├── services/         # API client
│   ├── context/          # Auth state management
│   └── styles/           # Global styles or themes
├── App.tsx               # Main entry point
└── app.json              # Expo configuration
```

## 3. Running the App

```bash
# Start the development server
npx expo start

# Open on your phone
# Download "Expo Go" on iOS/Android and scan the QR code.
```
