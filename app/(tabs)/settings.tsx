import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Check } from 'lucide-react-native';
import { MUSIC_PLATFORMS, getPreferredPlatform, setPreferredPlatform } from '@/utils/musicPlatforms';

export default function SettingsScreen() {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [isTestMode, setIsTestMode] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const platform = await getPreferredPlatform();
    setSelectedPlatform(platform);
    
    const testMode = await AsyncStorage.getItem('testMode');
    setIsTestMode(testMode === 'true');
  };

  const handlePlatformSelect = async (platformKey: string) => {
    setSelectedPlatform(platformKey);
    await setPreferredPlatform(platformKey);
    Alert.alert(
      'Preference Saved',
      `All Odesli links will now open in ${MUSIC_PLATFORMS.find(p => p.key === platformKey)?.name}.`
    );
  };

  const toggleTestMode = async (value: boolean) => {
    setIsTestMode(value);
    await AsyncStorage.setItem('testMode', value.toString());
  };

  const testLinkHandling = () => {
    if (!selectedPlatform) {
      Alert.alert('Error', 'Please select a preferred platform first.');
      return;
    }
    
    // Test link for demonstration
    const testLink = 'https://song.link/s/4cOdK2wGLETKBW3PvgPWqT';
    
    Alert.alert(
      'Test Link',
      `Opening test link: ${testLink}\n\nThis would redirect to your ${MUSIC_PLATFORMS.find(p => p.key === selectedPlatform)?.name} app.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Open Test Link', 
          onPress: () => {
            // In a real implementation, we would:
            // 1. Fetch the platform-specific URL from Odesli API
            // 2. Open that URL with Linking.openURL()
            console.log(`Test: Redirecting to ${selectedPlatform}`);
          }
        }
      ]
    );
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
          
          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingName}>Test Mode</Text>
              <Text style={styles.settingDescription}>
                Enable to see detailed logs and test link handling
              </Text>
            </View>
            <Switch
              value={isTestMode}
              onValueChange={toggleTestMode}
              trackColor={{ false: '#d1d1d6', true: '#b0d0ff' }}
              thumbColor={isTestMode ? '#007AFF' : '#f4f3f4'}
            />
          </View>
          
          <TouchableOpacity
            style={styles.testButton}
            onPress={testLinkHandling}
          >
            <Text style={styles.testButtonText}>Test Link Handling</Text>
          </TouchableOpacity>
        </View>
        
        {Platform.OS === 'android' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Android Setup</Text>
            <Text style={styles.sectionDescription}>
              For Android devices, you may need to set this app as the default handler for Odesli links:
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    maxWidth: '80%',
  },
  testButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
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
});