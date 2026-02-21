import 'react-native-gesture-handler';
import React, { useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { AppNavigator } from './src/navigation/AppNavigator';
import { FONTS } from './src/constants/fonts';

// Prevent auto-hiding the splash screen
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    [FONTS.TITLE]: require('./assets/fonts/CinzelDecorative-Regular.ttf'),
    [FONTS.HEADING]: require('./assets/fonts/Cinzel-Bold.ttf'),
    [FONTS.BODY]: require('./assets/fonts/CrimsonText-Regular.ttf'),
    [FONTS.BODY_BOLD]: require('./assets/fonts/CrimsonText-Bold.ttf'),
    [FONTS.NUMBERS]: require('./assets/fonts/Oswald-Regular.ttf'),
    [FONTS.NUMBERS_BOLD]: require('./assets/fonts/Oswald-Bold.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <AppNavigator />
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
