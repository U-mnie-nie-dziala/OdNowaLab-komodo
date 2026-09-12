import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
  Geist_800ExtraBold,
} from '@expo-google-fonts/geist';
import { GeistMono_500Medium } from '@expo-google-fonts/geist-mono';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { ConnectionErrorScreen } from '@/components/connection-error-screen';
import { SessionProvider, useSession } from '@/context/session-context';

SplashScreen.preventAutoHideAsync();

function RootNavigator({ fontsReady }: { fontsReady: boolean }) {
  const { isLoading, error, apiBaseUrl, retryBootstrap, isAuthenticated } = useSession();

  if (isLoading || !fontsReady) {
    return null;
  }

  if (error) {
    return <ConnectionErrorScreen message={error} apiBaseUrl={apiBaseUrl} onRetry={retryBootstrap} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
    Geist_800ExtraBold,
    GeistMono_500Medium,
    ...Ionicons.font,
  });

  if (fontError) {
    console.warn('Geist fonts failed to load, falling back to system font:', fontError);
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <AnimatedSplashOverlay />
      <SessionProvider>
        <RootNavigator fontsReady={fontsLoaded || !!fontError} />
      </SessionProvider>
    </ThemeProvider>
  );
}
