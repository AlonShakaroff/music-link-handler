import AsyncStorage from '@react-native-async-storage/async-storage';

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

export const getPreferredPlatform = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('preferredMusicPlatform');
  } catch (error) {
    console.error('Error getting preferred platform:', error);
    return null;
  }
};

export const setPreferredPlatform = async (platform: string): Promise<void> => {
  try {
    await AsyncStorage.setItem('preferredMusicPlatform', platform);
  } catch (error) {
    console.error('Error setting preferred platform:', error);
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