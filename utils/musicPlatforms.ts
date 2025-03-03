import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Linking } from 'react-native';

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

// This function fetches the platform-specific URL from the Odesli API
export const getPlatformSpecificUrl = async (odesliUrl: string, platformKey: string): Promise<string | null> => {
  try {
    console.log(`Fetching platform-specific URL for ${platformKey} from ${odesliUrl}`);

    // Check if we've already processed this exact URL to prevent infinite loops
    const lastProcessedUrl = await AsyncStorage.getItem('lastProcessedOdesliUrl');
    const lastRedirectedUrl = await AsyncStorage.getItem('lastRedirectedUrl');

    if (lastProcessedUrl === odesliUrl && lastRedirectedUrl) {
      console.log('Using cached redirect for this Odesli URL:', lastRedirectedUrl);
      return lastRedirectedUrl;
    }

    // Call the Odesli API to get platform-specific links
    const apiUrl = `https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(odesliUrl)}`;
    console.log('Calling Odesli API:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      throw new Error(`Odesli API returned status ${response.status}`);
    }

    const data = await response.json();
    console.log('Odesli API response received');

    // Store the full response for debugging
    await AsyncStorage.setItem('lastOdesliApiResponse', JSON.stringify(data));

    // Map platform keys to Odesli platform keys
    const platformMapping: Record<string, string[]> = {
      'spotify': ['spotify', 'spotifyWeb'],
      'apple_music': ['appleMusic', 'appleMusicWeb'],
      'youtube_music': ['youtubeMusic', 'youtubeMusicWeb'],
      'deezer': ['deezer', 'deezerWeb'],
      'tidal': ['tidal', 'tidalWeb'],
      'amazon_music': ['amazonMusic', 'amazonMusicWeb'],
      'pandora': ['pandora', 'pandoraWeb'],
      'soundcloud': ['soundcloud', 'soundcloudWeb']
    };

    // Get the list of possible platform keys for the selected platform
    const possiblePlatformKeys = platformMapping[platformKey] || [platformKey];

    // Try each possible platform key
    for (const key of possiblePlatformKeys) {
      if (data.linksByPlatform && data.linksByPlatform[key]) {
        const platformUrl = data.linksByPlatform[key].url;
        console.log(`Found ${key} URL:`, platformUrl);
        return platformUrl;
      }
    }

    // If we couldn't find a match with the mapping, log available platforms
    console.log(`No ${platformKey} URL found in Odesli response`);

    // Log available platforms for debugging
    if (data.linksByPlatform) {
      const availablePlatforms = Object.keys(data.linksByPlatform);
      console.log('Available platforms:', availablePlatforms.join(', '));

      // If the exact platform isn't found, try to find a close match
      for (const availablePlatform of availablePlatforms) {
        if (availablePlatform.toLowerCase().includes(platformKey.toLowerCase())) {
          const alternativeUrl = data.linksByPlatform[availablePlatform].url;
          console.log(`Found alternative ${availablePlatform} URL:`, alternativeUrl);
          return alternativeUrl;
        }
      }
    }

    // If we couldn't get a platform-specific URL, return null
    return null;
  } catch (error) {
    console.error('Error getting platform-specific URL:', error);
    // Store the error for debugging
    await AsyncStorage.setItem('lastOdesliApiError', String(error));
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