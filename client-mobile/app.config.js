// app.config.js instead of app.json so the Google Maps Android key can be
// read from the environment (GOOGLE_MAP_API in .env) instead of committed as
// a literal string. Expo's own env loader only exposes EXPO_PUBLIC_*-prefixed
// vars to process.env, not this one, so we load .env ourselves below. On EAS
// Build there's no .env file (it's gitignored); that's fine — GOOGLE_MAP_API
// is expected to be set via EAS's own project environment variables there.
try {
  process.loadEnvFile(require('path').join(__dirname, '.env'));
} catch {
  // no local .env (e.g. EAS Build) or an older Node without loadEnvFile —
  // process.env.GOOGLE_MAP_API is expected to be set some other way then.
}

module.exports = {
  expo: {
    name: 'client-mobile',
    slug: 'client-mobile',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'clientmobile',
    userInterfaceStyle: 'automatic',
    ios: {
      icon: './assets/expo.icon',
    },
    android: {
      package: 'com.odnowalab.clientmobile',
      adaptiveIcon: {
        backgroundColor: '#d6f2e1',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      predictiveBackGestureEnabled: false,
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAP_API,
        },
      },
    },
    web: {
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          // Must match Brand[700] in src/constants/theme.ts and
          // styles.splashOverlay in src/components/animated-icon.tsx.
          backgroundColor: '#106141',
          image: './assets/images/splash-icon.png',
          imageWidth: 76,
        },
      ],
      'expo-build-properties',
      'expo-secure-store',
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      eas: {
        projectId: '2e921c02-b7b9-4634-9f43-ce53e02a8060',
      },
    },
  },
};
