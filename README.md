![banner](docs/assets/images/banner_mwmbl.svg)

# MWMBL the Open Source Web Search Engine React Native Mobile App

> ⚠️ **NOTE:** This repository is under heavy construction. Features and documentation are actively being developed and may change frequently.

A simple, single-view mobile search interface for [mwmbl.org](https://mwmbl.org) - a non-profit, ad-free search engine.

## Project Structure

### Single-View Architecture

This app uses **Expo Router** with a simplified single-view structure (no tabs):

```
app/
├── _layout.tsx        # Root layout with theme provider
└── index.tsx          # Main search screen

components/
├── SearchBar.tsx      # Search input with loading state
├── SearchResult.tsx   # Individual search result card
├── themed-view.tsx    # Theme-aware view component
└── themed-text.tsx    # Theme-aware text component
```

## Features

- ✅ **Single unified search view** - No tab navigation, just search
- ✅ **Dark mode support** - Automatic theme switching
- ✅ **Haptic feedback** - Touch feedback on iOS
- ✅ **Live search** - Results update as you type
- ✅ **Clean UI** - Modern, minimalist design
- ✅ **External link handling** - Opens results in default browser

## Running the App

### Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator  
npm run android
```

### With Expo Go

1. Install **Expo Go** on your iOS/Android device
2. Run `npm start`
3. Scan the QR code with your device camera (iOS) or Expo Go app (Android)

## Configuration

### Important Settings

- **New Architecture**: Disabled (`newArchEnabled: false` in app.json)
  - Expo Go doesn't fully support Fabric renderer yet
  - For production, consider creating a development build with `eas build`

### API Integration

The search functionality in `app/index.tsx` currently points to:
```typescript
const response = await fetch(`https://mwmbl.org/app/search?q=${encodeURIComponent(query)}`);
```

Update this endpoint based on the actual mwmbl API structure.

## Dependencies

### Core
- `expo` ~54.0.13
- `expo-router` ~6.0.11
- `react-native` 0.81.4

### UI/UX
- `@expo/vector-icons` - Icon library
- `expo-haptics` - Touch feedback
- `expo-image` - Optimized image component
- `react-native-safe-area-context` - Safe area handling

### Navigation
- `@react-navigation/native` - Navigation library (used by Expo Router)

## Troubleshooting

### Crash on Launch in Expo Go

If the app crashes immediately in Expo Go:
1. Ensure `newArchEnabled` is set to `false` in `app.json`
2. Clear Expo cache: `npx expo start --clear`
3. Shake device and reload in Expo Go

### Building for Production

For a production build with New Architecture support:

```bash
# Install EAS CLI
npm install -g eas-cli

# Build for iOS
eas build --profile production --platform ios

# Build for Android
eas build --profile production --platform android
```

## Design Philosophy

This app follows a **single-purpose design** philosophy:
- One screen, one goal: Search
- No distractions or unnecessary navigation
- Fast, responsive, and straightforward

## License

Check the main mwmbl repository for licensing information.

