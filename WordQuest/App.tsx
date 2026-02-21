import 'react-native-gesture-handler';
import React, { useEffect, useCallback } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { AppNavigator } from './src/navigation/AppNavigator';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = React.useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        await Font.loadAsync({
          // Using Google Fonts via expo-font
          'CinzelDecorative-Regular': 'https://github.com/google/fonts/raw/main/ofl/cinzeldecorative/CinzelDecorative-Regular.ttf',
          'Cinzel-Bold': 'https://github.com/google/fonts/raw/main/ofl/cinzel/Cinzel-Bold.ttf',
          'CrimsonText-Regular': 'https://github.com/google/fonts/raw/main/ofl/crimsontext/CrimsonText-Regular.ttf',
          'CrimsonText-Bold': 'https://github.com/google/fonts/raw/main/ofl/crimsontext/CrimsonText-Bold.ttf',
          'Oswald-Regular': 'https://github.com/google/fonts/raw/main/ofl/oswald/Oswald-Regular.ttf',
          'Oswald-Bold': 'https://github.com/google/fonts/raw/main/ofl/oswald/Oswald-Bold.ttf',
        });

        // Artificial delay for splash screen or other init logic
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately! If we call this after
      // `setAppIsReady`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has already
      // performed layout.
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <AppNavigator />
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
