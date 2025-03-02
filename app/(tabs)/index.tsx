import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Linking, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Music as MusicNote } from 'lucide-react-native';
import { MUSIC_PLATFORMS, getPreferredPlatform } from '@/utils/musicPlatforms';

export default function HomeScreen() {
  const [lastLink, setLastLink] = useState<string | null>(null);
  const [preferredPlatform, setPreferredPlatform] = useState<string | null>(null);

  useEffect(() => {
    // Load the preferred platform
    const loadPreferredPlatform = async () => {
      const platform = await getPreferredPlatform();
      setPreferredPlatform(platform);
    };

    loadPreferredPlatform();

    // Set up the initial URL handler
    const getInitialURL = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleDeepLink({ url: initialUrl });
      }
    };

    getInitialURL();

    // Set up the URL listener for when the app is already open
    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, []);

  const handleDeepLink = async ({ url }: { url: string }) => {
    if (isOdesliLink(url)) {
      setLastLink(url);
      
      const platform = await getPreferredPlatform();
      if (platform) {
        // Store the original link before redirecting
        await AsyncStorage.setItem('lastOdesliLink', url);
        
        // In a real implementation, we would fetch the platform-specific link
        // from the Odesli API and redirect to it
        console.log(`Redirecting ${url} to ${platform}`);
        
        // This is a placeholder for the actual redirection logic
        // In a real app, you would:
        // 1. Fetch the platform-specific URL from Odesli API
        // 2. Open that URL with Linking.openURL()
      }
    }
  };

  const isOdesliLink = (url: string): boolean => {
    const odesliDomains = [
      'song.link',
      'album.link',
      'artist.link',
      'playlist.link',
      'music.link',
      'pods.link',
      'mylink.page',
      'odesli.co'
    ];
    
    try {
      const urlObj = new URL(url);
      return odesliDomains.some(domain => urlObj.hostname.includes(domain));
    } catch (e) {
      return false;
    }
  };

  const getPlatformName = (key: string | null): string => {
    if (!key) return 'None';
    const platform = MUSIC_PLATFORMS.find(p => p.key === key);
    return platform ? platform.name : 'Unknown';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <MusicNote size={48} color="#007AFF" />
          <Text style={styles.title}>Music Link Handler</Text>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>How It Works</Text>
          <Text style={styles.infoText}>
            When you click on an Odesli link (song.link, album.link, etc.), 
            this app will automatically redirect you to your preferred music platform.
          </Text>
          
          <Text style={styles.infoSubtitle}>Current Settings</Text>
          <Text style={styles.settingItem}>
            Preferred Platform: <Text style={styles.settingValue}>{getPlatformName(preferredPlatform)}</Text>
          </Text>
          
          {lastLink && (
            <>
              <Text style={styles.infoSubtitle}>Last Intercepted Link</Text>
              <Text style={styles.linkText}>{lastLink}</Text>
            </>
          )}
          
          <Text style={styles.infoSubtitle}>Supported Domains</Text>
          <Text style={styles.infoText}>
            song.link, album.link, artist.link, playlist.link, music.link, pods.link, mylink.page, odesli.co
          </Text>
        </View>
        
        <View style={styles.instructionCard}>
          <Text style={styles.infoTitle}>Setup Instructions</Text>
          <Text style={styles.infoText}>
            1. Go to the Settings tab to select your preferred music platform.
          </Text>
          <Text style={styles.infoText}>
            2. When you click on an Odesli link, it will automatically open in your preferred platform.
          </Text>
          {Platform.OS === 'android' && (
            <Text style={styles.infoText}>
              3. On Android, you may need to set this app as the default handler for Odesli links in your device settings.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#333',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  instructionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  infoSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#555',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  settingItem: {
    fontSize: 14,
    color: '#666',
  },
  settingValue: {
    fontWeight: 'bold',
    color: '#007AFF',
  },
  linkText: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 8,
  },
});