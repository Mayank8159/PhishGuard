import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreenLib from 'expo-splash-screen';
import SplashScreen from '@/components/SplashScreen';
import { AppProvider, useApp } from '@/contexts/AppContext';

// Keep native splash visible until we're ready
SplashScreenLib.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, isLoading } = useApp();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Redirect to login if not authenticated
      console.log('Redirecting to login - user not found');
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 100);
    } else if (user && inAuthGroup) {
      // Redirect to tabs if authenticated
      console.log('Redirecting to tabs - user found');
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 100);
    }
  }, [user, isLoading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Hide native splash immediately to show custom splash
        await SplashScreenLib.hideAsync();
        // Show custom splash for 2.5 seconds
        await new Promise(resolve => setTimeout(resolve, 2500));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppReady(true);
      }
    }

    prepare();
  }, []);

  if (!appReady) {
    return <SplashScreen />;
  }

  return (
    <AppProvider>
      <RootLayoutNav />
    </AppProvider>
  );
}