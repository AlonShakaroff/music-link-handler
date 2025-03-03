import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const MUSIC_PLATFORMS = [
  { key: 'spotify', name: 'Spotify' },
  { key: 'apple_music', name: 'Apple Music' },
  { key: 'youtube_music', name: 'YouTube Music' },
  { key: 'deezer', name: 'Deezer' },
  { key: 'tidal', name: 'Tidal' },
  { key: 'amazon_music', name: 'Amazon Music' },
  { key: 'pandora', name: 'Pandora' },
  { key: 'soundcloud', name: 'SoundCloud' }
];

const STORAGE_KEY = 'preferredMusicPlatform';

export const getPreferredPlatform = async (): Promise<string | null> => {
  try {
    const platform = await AsyncStorage.getItem(STORAGE_KEY);
    console.log('Retrieved platform from storage:', platform);
    return platform;
  } catch (error) {
    console.error('Error getting preferred platform:', error);
    return null;
  }
};

export const setPreferredPlatform = async (platform: string): Promise<void> => {
  try {
    console.log('Setting preferred platform to:', platform);
    await AsyncStorage.setItem(STORAGE_KEY, platform);

    // Verify the platform was saved correctly
    const savedPlatform = await AsyncStorage.getItem(STORAGE_KEY);
    console.log('Verified saved platform:', savedPlatform);

    if (savedPlatform !== platform) {
      console.error('Platform verification failed. Expected:', platform, 'Got:', savedPlatform);
      // Force a second attempt if verification failed
      await AsyncStorage.setItem(STORAGE_KEY, platform);
      const secondVerification = await AsyncStorage.getItem(STORAGE_KEY);
      console.log('Second verification attempt:', secondVerification);
    }
  } catch (error) {
    console.error('Error setting preferred platform:', error);
    throw error; // Re-throw to allow handling in the UI
  }
};

// This function would fetch the platform-specific URL from the Odesli API
// In a real implementation, you would call this when intercepting an Odesli link
export const getPlatformSpecificUrl = async (odesliUrl: string, platform: string): Promise<string | null> => {
  try {
    // Extract the song/album ID from the Odesli URL
    // This is a simplified example - actual implementation would depend on Odesli URL structure
    const urlParts = odesliUrl.split('/');
    const id = urlParts[urlParts.length - 1];

    // Call the Odesli API to get platform-specific links
    // Odesli API endpoint: https://api.song.link/v1-alpha.1/links
    const response = await fetch(`https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(odesliUrl)}`);
    const data = await response.json();

    // Extract the platform-specific URL from the response
    // The actual structure of the response would need to be handled properly
    if (data.linksByPlatform && data.linksByPlatform[platform]) {
      return data.linksByPlatform[platform].url;
    }

    return null;
  } catch (error) {
    console.error('Error getting platform-specific URL:', error);
    return null;
  }
};

// Get the platform-specific app package or URL scheme
export const getPlatformAppInfo = (platformKey: string): { android?: string, ios?: string } => {
  switch (platformKey) {
    case 'spotify':
      return {
        android: 'com.spotify.music',
        ios: 'spotify://'
      };
    case 'apple_music':
      return {
        android: 'com.apple.android.music',
        ios: 'music://'
      };
    case 'youtube_music':
      return {
        android: 'com.google.android.apps.youtube.music',
        ios: 'youtubemusic://'
      };
    case 'deezer':
      return {
        android: 'deezer.android.app',
        ios: 'deezer://'
      };
    case 'tidal':
      return {
        android: 'com.aspiro.tidal',
        ios: 'tidal://'
      };
    case 'amazon_music':
      return {
        android: 'com.amazon.mp3',
        ios: 'music://'
      };
    case 'pandora':
      return {
        android: 'com.pandora.android',
        ios: 'pandora://'
      };
    case 'soundcloud':
      return {
        android: 'com.soundcloud.android',
        ios: 'soundcloud://'
      };
    default:
      return {};
  }
};

// Helper function to check if a specific music app is installed
export const isMusicAppInstalled = async (platformKey: string): Promise<boolean> => {
  if (Platform.OS === 'web') return false;

  const appInfo = getPlatformAppInfo(platformKey);
  const urlToCheck = Platform.OS === 'ios' ? appInfo.ios : `package:${appInfo.android}`;

  if (!urlToCheck) return false;

  try {
    return await Linking.canOpenURL(urlToCheck);
  } catch (error) {
    console.error(`Error checking if ${platformKey} is installed:`, error);
    return false;
  }
};