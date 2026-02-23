import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as ExpoSplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import Animated, {
  useSharedValue, withRepeat, withTiming, withDelay, useAnimatedStyle
} from 'react-native-reanimated';
import { MysticBackground } from '../components/Background/MysticBackground';
import { LevelManager } from '../services/LevelManager';
import { SaveManager } from '../services/SaveManager';
import { COLORS, FONT_SIZES } from '../constants';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

// Удерживаем системный сплэш пока не загрузимся
ExpoSplashScreen.preventAutoHideAsync();

// Компонент одной пульсирующей точки
const PulseDot: React.FC<{ delay: number }> = ({ delay }) => {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withDelay(delay, withRepeat(
      withTiming(0.3, { duration: 600 }),
      -1, true
    ));
  }, []);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[styles.dot, style]} />
  );
};

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const logoOpacity = useSharedValue(0);

  useEffect(() => {
    // Плавное появление логотипа
    logoOpacity.value = withTiming(1, { duration: 600 });

    async function load() {
      try {
        await Promise.all([
          Font.loadAsync({
            'CinzelDecorative-Regular': require('../../assets/fonts/CinzelDecorative-Regular.ttf'),
            'Cinzel-Bold':              require('../../assets/fonts/Cinzel-Bold.ttf'),
            'CrimsonText-Regular':      require('../../assets/fonts/CrimsonText-Regular.ttf'),
            'CrimsonText-Italic':       require('../../assets/fonts/CrimsonText-Italic.ttf'),
          }),
          LevelManager.preload(),
          SaveManager.initializeDefaults(),
        ]);
      } catch (e) {
        console.error('Ошибка загрузки:', e);
      } finally {
        await ExpoSplashScreen.hideAsync();
        navigation.replace('Home');
      }
    }

    load();
  }, []);

  const logoStyle = useAnimatedStyle(() => ({ opacity: logoOpacity.value }));

  return (
    <MysticBackground>
      <View style={styles.container}>
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <Text style={styles.title}>✦ WordQuest ✦</Text>
          <Text style={styles.subtitle}>Echoes of Secrets</Text>
        </Animated.View>

        <View style={styles.dotsContainer}>
          <PulseDot delay={0} />
          <PulseDot delay={300} />
          <PulseDot delay={600} />
        </View>
      </View>
    </MysticBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  title: {
    fontFamily: 'CinzelDecorative-Regular',
    fontSize: FONT_SIZES.DISPLAY,
    color: COLORS.TEXT_PRIMARY,
    textShadowColor: COLORS.ACCENT_GOLD,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'CrimsonText-Italic',
    fontSize: FONT_SIZES.LG,
    color: COLORS.TEXT_SECONDARY,
    fontStyle: 'italic',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 60,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.ACCENT_GOLD,
  },
});
