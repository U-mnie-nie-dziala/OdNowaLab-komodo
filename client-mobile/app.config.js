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
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
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
          backgroundColor: '#208AEF',
          image: './assets/images/splash-icon.png',
          imageWidth: 76,
        },
      ],
      'expo-build-properties',
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
  },
};
