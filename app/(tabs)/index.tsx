import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Linking, Platform, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Music as MusicNote, ExternalLink } from 'lucide-react-native';
import { MUSIC_PLATFORMS, getPreferredPlatform } from '@/utils/musicPlatforms';
import * as IntentLauncher from 'expo-intent-launcher';
import * as WebBrowser from 'expo-web-browser';

export default function HomeScreen() {
  const [lastLink, setLastLink] = useState<string | null>(null);
  const [initialLink, setInitialLink] = useState<string | null>(null);
  const [preferredPlatform, setPreferredPlatform] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  useEffect(() => {
    // Load the preferred platform
    const loadPreferredPlatform = async () => {
      const platform = await getPreferredPlatform();
      console.log('Home screen loaded platform:', platform);
      setPreferredPlatform(platform);
    };

    loadPreferredPlatform();

    // Check for any stored links
    const checkStoredLinks = async () => {
      const storedLastLink = await AsyncStorage.getItem('lastOdesliLink');
      const initialOpenURL = await AsyncStorage.getItem('initialOpenURL');
      const lastReceivedLink = await AsyncStorage.getItem('lastReceivedLink');

      if (storedLastLink) setLastLink(storedLastLink);
      if (initialOpenURL) setInitialLink(initialOpenURL);

      // Add debug info
      const info = [];
      info.push(`Last stored link: ${storedLastLink || 'None'}`);
      info.push(`Initial URL: ${initialOpenURL || 'None'}`);
      info.push(`Last received link: ${lastReceivedLink || 'None'}`);
      setDebugInfo(info);
    };

    checkStoredLinks();

    // Set up the URL listener for when the app is already open
    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, []);

  // Add a focus listener to refresh the preferred platform when the tab is focused
  useEffect(() => {
    const refreshPreferredPlatform = async () => {
      const platform = await getPreferredPlatform();
      if (platform !== preferredPlatform) {
        console.log('Refreshing preferred platform:', platform);
        setPreferredPlatform(platform);
      }
    };

    // Check for updates every time the component renders
    refreshPreferredPlatform();
  });

  const handleDeepLink = async ({ url }: { url: string }) => {
    console.log('Deep link received in home screen:', url);

    if (isOdesliLink(url)) {
      setLastLink(url);
      await AsyncStorage.setItem('lastOdesliLink', url);

      const platform = await getPreferredPlatform();
      if (platform) {
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

  const testDeepLink = async () => {
    // Test link for demonstration
    const testLink = 'https://song.link/s/4cOdK2wGLETKBW3PvgPWqT';

    try {
      if (Platform.OS === 'android') {
        // On Android, try to open the link with the app's intent filter
        const canOpen = await Linking.canOpenURL(testLink);
        if (canOpen) {
          await Linking.openURL(testLink);
        } else {
          // If can't open directly, try using WebBrowser
          await WebBrowser.openBrowserAsync(testLink);
        }
      } else {
        // On iOS, just use Linking
        await Linking.openURL(testLink);
      }
    } catch (error) {
      console.error('Error opening test link:', error);
      Alert.alert('Error', 'Could not open the test link. Please check your device settings.');
    }
  };

  const openAndroidAppSettings = async () => {
    if (Platform.OS === 'android') {
      try {
        await IntentLauncher.startActivityAsync(
          IntentLauncher.ActivityAction.APPLICATION_DETAILS_SETTINGS,
          { data: 'package:com.musiclinkhandler.app' }
        );
      } catch (error) {
        console.error('Error opening app settings:', error);
        Alert.alert('Error', 'Could not open app settings.');
      }
    }
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

          {initialLink && (
            <>
              <Text style={styles.infoSubtitle}>Initial Link</Text>
              <Text style={styles.linkText}>{initialLink}</Text>
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
            <>
              <Text style={styles.infoText}>
                3. On Android, you need to set this app as the default handler for Odesli links in your device settings.
              </Text>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={openAndroidAppSettings}
              >
                <Text style={styles.actionButtonText}>Open App Settings</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={[styles.actionButton, { marginTop: 12 }]}
            onPress={testDeepLink}
          >
            <Text style={styles.actionButtonText}>Test Deep Link</Text>
            <ExternalLink size={16} color="#fff" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>

        {debugInfo.length > 0 && (
          <View style={styles.debugCard}>
            <Text style={styles.infoTitle}>Debug Information</Text>
            {debugInfo.map((info, index) => (
              <Text key={index} style={styles.debugText}>{info}</Text>
            ))}
          </View>
        )}
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
  debugCard: {
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
  actionButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 4,
  },
});