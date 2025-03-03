# Music Link Handler

A mobile application that intercepts Odesli links (song.link, album.link, etc.) and automatically redirects them to your preferred music streaming platform.

## Features

- Intercepts Odesli links when clicked on your device
- Automatically redirects to your preferred music platform (Spotify, Apple Music, YouTube Music, etc.)
- One-time configuration - set your preferred platform once and forget
- Works with all Odesli domains: song.link, album.link, artist.link, playlist.link, music.link, pods.link, mylink.page, odesli.co
- Dark mode support
- Test mode for debugging

## Supported Platforms

- Spotify
- Apple Music
- YouTube Music
- Deezer
- Tidal
- Amazon Music
- Pandora
- SoundCloud

## Project Structure

```
app/
├── _layout.tsx                # Root layout
├── +not-found.tsx             # 404 page
├── index.tsx                  # Root redirect
└── (tabs)/                    # Tab navigation
    ├── _layout.tsx            # Tab configuration
    ├── index.tsx              # Home tab
    └── settings.tsx           # Settings tab
utils/
└── musicPlatforms.ts          # Platform utilities
assets/
└── images/                    # App icons and images
```

## Development

### Prerequisites

- Node.js (v16 or newer)
- npm or yarn
- Expo CLI

### Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

### Testing Deep Links

To test deep link handling:

1. Enable test mode in the app settings
2. Use the "Test Link Handling" button
3. For Android, you can test with adb:

```bash
adb shell am start -a android.intent.action.VIEW -d "https://song.link/s/4cOdK2wGLETKBW3PvgPWqT"
```

## Building for Production

### Web

To build for web:

```bash
npm run build:web
```

### Android APK (Direct Method - No EAS Account Required)

To build an APK directly without using EAS Build:

```bash
npm run build:android:local:dev
```

This will:
1. Generate the native Android project
2. Build the APK using Gradle directly
3. Output the APK to `android/app/build/outputs/apk/debug/app-debug.apk`

### Android APK (Local Build - EAS Account Required)

To build an APK locally using EAS:

```bash
npm run build:android:local
```

This will:
1. Create a development build
2. Generate an APK file locally
3. Output the APK location when complete

### Android APK (EAS Build - EAS Account Required)

To build an APK using EAS Build service:
מפצ
```bash
npm run build:android:apk
```

This will:
1. Build your app in the EAS cloud
2. Generate an APK file (rather than an AAB file used for Play Store)
3. Provide a download link when complete

### Android Play Store Build

To build for Google Play Store submission:

```bash
npm run build:android
```

### iOS

For iOS builds, you'll need a Mac with Xcode installed. Follow the Expo documentation for iOS builds.

## Google Play Store Deployment

### Prerequisites

1. Google Play Developer account
2. App listing created in Google Play Console
3. Service account with API access

### Configuration

The app is already configured for Google Play Store in the following files:

- `app.json`: Contains Android-specific configuration
- `eas.json`: Contains build and submit configuration
- `package.json`: Contains build scripts

### Build and Submit Process

1. **Set up an EAS account**:
   ```bash
   npx eas login
   ```

2. **Configure your project**:
   ```bash
   npx eas build:configure
   ```

3. **Update the configuration**:
   - Update the `"projectId"` in `app.json` with your actual EAS project ID
   - Update the `"serviceAccountKeyPath"` in `eas.json` to point to your Google Play service account key file

4. **Build your app for production**:
   ```bash
   npm run build:android
   ```

5. **Submit to Google Play**:
   ```bash
   npm run submit:android
   ```

### Version Management

- Update the `version` in `app.json` for each new release
- The `versionCode` in `app.json` will be automatically incremented with each build when using `"autoIncrement": true` in `eas.json`

## Troubleshooting APK Builds

### SSL Certificate Errors

If you encounter SSL certificate errors with EAS Build:

1. **Use the direct build method**:
   - Run `npm run build:android:local:dev` which bypasses EAS Build entirely
   - This method uses Gradle directly and doesn't require an EAS account

2. **Network issues**:
   - Try using a different network connection
   - Disable any VPNs or proxies that might interfere with SSL certificates

3. **EAS CLI issues**:
   - Update EAS CLI: `npm install -g eas-cli@latest`
   - Clear EAS cache: `rm -rf ~/.eas`

### Other Build Issues

1. **Invalid UUID appId error**:
   - Make sure you've run `npx eas login` first
   - Ensure your project has a valid projectId in app.json
   - Try running `npx eas build:configure` to set up your project

2. **Local build issues**:
   - Ensure you have the Android SDK installed
   - Set ANDROID_HOME environment variable
   - Install required build tools with Android SDK Manager

3. **Build fails with dependency errors**:
   - Run `npm install` to ensure all dependencies are installed
   - Clear the npm cache with `npm cache clean --force`
   - Delete node_modules and reinstall with `rm -rf node_modules && npm install`

## Android Setup Instructions

For Android devices, you may need to set this app as the default handler for Odesli links:

1. Go to Settings > Apps > Default apps > Opening links
2. Find "Music Link Handler" in the list
3. Enable "Open supported links"

## Technical Details

### Deep Link Handling

The app uses the following mechanisms to handle deep links:

- **iOS**: Uses Universal Links via the `associatedDomains` configuration
- **Android**: Uses App Links via the `intentFilters` configuration

### Link Processing

When an Odesli link is intercepted:

1. The app verifies it's a valid Odesli domain
2. Retrieves the user's preferred music platform
3. Calls the Odesli API to get the platform-specific URL
4. Redirects to the appropriate music app

### Data Storage

User preferences are stored using AsyncStorage:

- `preferredMusicPlatform`: Stores the key of the selected music platform
- `lastOdesliLink`: Stores the last intercepted Odesli link
- `testMode`: Stores the test mode setting

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.