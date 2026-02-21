import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { RootStackParamList } from './types';
import SplashScreen from '../screens/SplashScreen';
import HomeScreen from '../screens/HomeScreen';
import ChapterSelectScreen from '../screens/ChapterSelectScreen';
import GameScreen from '../screens/GameScreen';
import ShopScreen from '../screens/ShopScreen';
import DictionaryScreen from '../screens/DictionaryScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ChapterSelect" component={ChapterSelectScreen} />
        <Stack.Screen name="Game" component={GameScreen} />
        <Stack.Screen name="Shop" component={ShopScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="Dictionary" component={DictionaryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
