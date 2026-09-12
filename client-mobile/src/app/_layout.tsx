import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { ConnectionErrorScreen } from '@/components/connection-error-screen';
import { SessionProvider, useSession } from '@/context/session-context';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { isLoading, error, apiBaseUrl, retryBootstrap } = useSession();

  if (isLoading) {
    return null;
  }

  if (error) {
    return <ConnectionErrorScreen message={error} apiBaseUrl={apiBaseUrl} onRetry={retryBootstrap} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <SessionProvider>
        <RootNavigator />
      </SessionProvider>
    </ThemeProvider>
  );
}
