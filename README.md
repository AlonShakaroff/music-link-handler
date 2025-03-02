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

### Android

To build for Android:

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
   - Replace `"your-project-id"` in `app.json` with your actual EAS project ID
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