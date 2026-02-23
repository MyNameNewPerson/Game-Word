import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from '../screens/SplashScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ChapterSelectScreen } from '../screens/ChapterSelectScreen';
import { GameScreen } from '../screens/GameScreen';   // создадим в Части D

export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  ChapterSelect: undefined;
  Game: undefined;
  Shop: undefined;
  Settings: undefined;
  PiggyBank: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false, animation: 'fade' }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ChapterSelect" component={ChapterSelectScreen} />
      <Stack.Screen name="Game" component={GameScreen} />
      {/* Shop, Settings, PiggyBank — заглушки, реализуем в Частях E и F */}
    </Stack.Navigator>
  </NavigationContainer>
);
