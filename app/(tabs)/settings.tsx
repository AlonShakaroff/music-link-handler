import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Check, ExternalLink } from 'lucide-react-native';
import { MUSIC_PLATFORMS, getPreferredPlatform, setPreferredPlatform } from '@/utils/musicPlatforms';
import * as IntentLauncher from 'expo-intent-launcher';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const platform = await getPreferredPlatform();
    setSelectedPlatform(platform);
  };

  const handlePlatformSelect = async (platformKey: string) => {
    setSelectedPlatform(platformKey);
    await setPreferredPlatform(platformKey);

    // Verify the platform was saved correctly
    const savedPlatform = await getPreferredPlatform();

    if (savedPlatform === platformKey) {
      Alert.alert(
        'Preference Saved',
        `All Odesli links will now open in ${MUSIC_PLATFORMS.find(p => p.key === platformKey)?.name}.`
      );
    } else {
      Alert.alert(
        'Error Saving Preference',
        'There was an issue saving your preference. Please try again.'
      );
    }
  };

  const testLinkHandling = async () => {
    if (!selectedPlatform) {
      Alert.alert('Error', 'Please select a preferred platform first.');
      return;
    }

    // Test link for demonstration
    const testLink = 'https://song.link/s/4cOdK2wGLETKBW3PvgPWqT';

    try {
      // Clear any previous redirected URL to ensure we don't trigger the loop prevention
      await AsyncStorage.removeItem('lastRedirectedUrl');

      // Navigate to the redirect screen with the test URL
      router.push({
        pathname: '/redirect',
        params: { url: encodeURIComponent(testLink) }
      });
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

  const openAndroidDefaultAppsSettings = async () => {
    if (Platform.OS === 'android') {
      try {
        // This opens the "Default apps" settings on Android
        await IntentLauncher.startActivityAsync(
          'android.settings.MANAGE_DEFAULT_APPS_SETTINGS'
        );
      } catch (error) {
        console.error('Error opening default apps settings:', error);
        Alert.alert('Error', 'Could not open default apps settings.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferred Music Platform</Text>
          <Text style={styles.sectionDescription}>
            Select your preferred music platform. All Odesli links will automatically open in this platform.
          </Text>

          {MUSIC_PLATFORMS.map((platform) => (
            <TouchableOpacity
              key={platform.key}
              style={[
                styles.platformItem,
                selectedPlatform === platform.key && styles.selectedPlatform
              ]}
              onPress={() => handlePlatformSelect(platform.key)}
            >
              <Text style={[
                styles.platformName,
                selectedPlatform === platform.key && styles.selectedPlatformText
              ]}>
                {platform.name}
              </Text>
              {selectedPlatform === platform.key && (
                <Check size={20} color="#007AFF" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>

          <TouchableOpacity
            style={styles.testButton}
            onPress={testLinkHandling}
          >
            <Text style={styles.testButtonText}>Test Link Handling</Text>
            <ExternalLink size={16} color="#fff" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>

        {Platform.OS === 'android' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Android Setup</Text>
            <Text style={styles.sectionDescription}>
              For Android devices, you need to set this app as the default handler for Odesli links:
            </Text>
            <Text style={styles.instructionText}>
              1. Go to Settings > Apps > Default apps > Opening links
            </Text>
            <Text style={styles.instructionText}>
              2. Find "Music Link Handler" in the list
            </Text>
            <Text style={styles.instructionText}>
              3. Enable "Open supported links"
            </Text>
            <Text style={styles.instructionText}>
              4. Tap on "Supported web addresses" and ensure all domains are enabled
            </Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={openAndroidAppSettings}
              >
                <Text style={styles.settingsButtonText}>Open App Settings</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.settingsButton}
                onPress={openAndroidDefaultAppsSettings}
              >
                <Text style={styles.settingsButtonText}>Open Default Apps</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            Music Link Handler v1.0.0
          </Text>
          <Text style={styles.aboutText}>
            This app intercepts Odesli links (song.link, album.link, etc.) and redirects them to your preferred music platform.
          </Text>
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
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  platformItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f5f5f7',
  },
  selectedPlatform: {
    backgroundColor: '#e6f2ff',
  },
  platformName: {
    fontSize: 16,
    color: '#333',
  },
  selectedPlatformText: {
    fontWeight: 'bold',
    color: '#007AFF',
  },
  testButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  aboutText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  settingsButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  settingsButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});