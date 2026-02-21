import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  ChapterSelect: undefined;
  Game: { levelId: number };
  Shop: undefined;
  Dictionary: undefined;
};

export type AppNavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type AppRouteProp<T extends keyof RootStackParamList> = RouteProp<RootStackParamList, T>;
