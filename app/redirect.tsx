import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Music } from 'lucide-react-native';
import { getPreferredPlatform, getPlatformSpecificUrl, MUSIC_PLATFORMS } from '@/utils/musicPlatforms';
import * as Linking from 'expo-linking';

export default function RedirectScreen() {
  const router = useRouter();
  const { url } = useLocalSearchParams<{ url: string }>();
  const [status, setStatus] = useState<'loading' | 'redirecting' | 'error'>('loading');
  const [platformName, setPlatformName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const redirectToHome = () => {
      // If there's an error, start a countdown to go back to home
      if (status === 'error') {
        timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              router.replace('/(tabs)');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    };

    const handleRedirect = async () => {
      if (!url) {
        setStatus('error');
        setErrorMessage('No URL provided');
        redirectToHome();
        return;
      }

      try {
        // Decode the URL if it's encoded
        const decodedUrl = decodeURIComponent(url);

        // Skip if we've already processed this exact URL in this component instance
        if (processedUrl === decodedUrl) {
          console.log('Already processed this URL, skipping:', decodedUrl);
          return;
        }

        // Mark this URL as being processed
        setProcessedUrl(decodedUrl);
        console.log('Processing URL:', decodedUrl);

        // Get the preferred platform
        const platformKey = await getPreferredPlatform();
        if (!platformKey) {
          setStatus('error');
          setErrorMessage('No preferred music platform set. Please go to Settings to set one.');
          redirectToHome();
          return;
        }

        // Get the platform name for display
        const platform = MUSIC_PLATFORMS.find(p => p.key === platformKey);
        setPlatformName(platform?.name || platformKey);

        // Get the platform-specific URL
        setStatus('redirecting');

        // Clear any previous redirected URL to prevent loop detection issues
        await AsyncStorage.removeItem('lastRedirectedUrl');

        const platformUrl = await getPlatformSpecificUrl(decodedUrl, platformKey);

        if (platformUrl) {
          console.log('Redirecting to platform URL:', platformUrl);

          // Store the URL we're redirecting to
          await AsyncStorage.setItem('lastRedirectedUrl', platformUrl);
          await AsyncStorage.setItem('lastProcessedOdesliUrl', decodedUrl);

          // Open the platform-specific URL
          await Linking.openURL(platformUrl);

          // Navigate back to home after a short delay
          setTimeout(() => {
            router.replace('/(tabs)');
          }, 1500);
        } else {
          setStatus('error');
          setErrorMessage(`Could not find a ${platform?.name || platformKey} link for this content`);
          redirectToHome();
        }
      } catch (error) {
        console.error('Error in redirect:', error);
        setStatus('error');
        setErrorMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
        redirectToHome();
      }
    };

    handleRedirect();

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [url, router, status, processedUrl]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Music size={48} color="#007AFF" style={styles.icon} />

        <Text style={styles.title}>
          {status === 'loading' ? 'Processing Link' :
           status === 'redirecting' ? 'Redirecting' :
           'Redirect Error'}
        </Text>

        {status === 'loading' && (
          <>
            <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
            <Text style={styles.message}>Analyzing music link...</Text>
          </>
        )}

        {status === 'redirecting' && (
          <>
            <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
            <Text style={styles.message}>
              Opening in {platformName}...
            </Text>
          </>
        )}

        {status === 'error' && (
          <>
            <Text style={styles.errorMessage}>{errorMessage}</Text>
            <Text style={styles.countdown}>
              Returning to home in {countdown} seconds...
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  loader: {
    marginVertical: 16,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  countdown: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});