import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPreferredPlatform } from '@/utils/musicPlatforms';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export default function RootLayout() {
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
      } else {
        console.log('No preferred platform set');
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
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}