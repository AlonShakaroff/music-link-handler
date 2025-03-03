import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPreferredPlatform } from '@/utils/musicPlatforms';
import { useRouter } from 'expo-router';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    window.frameworkReady?.();

    // Set up deep link handling at the root level
    const handleDeepLink = async (event: { url: string }) => {
      console.log('Deep link received in root layout:', event.url);

      // Store the link for debugging
      await AsyncStorage.setItem('lastReceivedLink', event.url);

      // Check if we have a preferred platform
      const platform = await getPreferredPlatform();
      if (platform) {
        console.log('Preferred platform found:', platform);

        // Check if this is an Odesli link
        if (isOdesliLink(event.url)) {
          console.log('Odesli link detected, navigating to redirect screen');

          // Store the Odesli link
          await AsyncStorage.setItem('lastOdesliLink', event.url);

          // Clear any previous redirected URL to prevent loop detection issues
          await AsyncStorage.removeItem('lastRedirectedUrl');

          // Navigate to the redirect screen with the URL as a parameter
          router.push({
            pathname: '/redirect',
            params: { url: encodeURIComponent(event.url), t: Date.now() }
          });
        } else {
          console.log('Not an Odesli link, not redirecting');
        }
      } else {
        console.log('No preferred platform set');
      }
    };

    // Helper function to check if a URL is an Odesli link
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

    // Get the initial URL that opened the app
    const getInitialURL = async () => {
      try {
        const url = await Linking.getInitialURL();
        if (url) {
          console.log('App opened with URL:', url);
          await AsyncStorage.setItem('initialOpenURL', url);
          handleDeepLink({ url });
        }
      } catch (e) {
        console.error('Error getting initial URL:', e);
      }
    };

    // Set up the listener for when the app is already open
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check for initial URL
    getInitialURL();

    // Clean up the listener
    return () => {
      subscription.remove();
    };
  }, [router]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="redirect" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}