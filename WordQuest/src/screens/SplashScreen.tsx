import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';
import MysticBackground from '../components/Background/MysticBackground';
import { SaveManager } from '../services/SaveManager';
import { LevelManager } from '../services/LevelManager';
import { usePlayerStore } from '../store/playerStore';

type SplashScreenProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

const SplashScreen = () => {
  const navigation = useNavigation<SplashScreenProp>();
  const loadProgress = usePlayerStore((state) => state.loadProgress);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    const animateDot = (anim: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: 600, delay, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.3, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    };

    animateDot(dot1, 0);
    animateDot(dot2, 200);
    animateDot(dot3, 400);

    const init = async () => {
      await SaveManager.initializeDefaults();
      LevelManager.preload();
      await loadProgress();

      // Minimum 2s splash
      setTimeout(() => {
        navigation.replace('Home');
      }, 2000);
    };

    init();
  }, []);

  return (
    <MysticBackground>
      <View style={styles.container}>
        <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
          <Text style={styles.title}>WordQuest</Text>
          <Text style={styles.subtitle}>Echoes of Secrets</Text>
        </Animated.View>

        <View style={styles.loader}>
          <Animated.View style={[styles.dot, { opacity: dot1, transform: [{ scale: dot1 }] }]} />
          <Animated.View style={[styles.dot, { opacity: dot2, transform: [{ scale: dot2 }] }]} />
          <Animated.View style={[styles.dot, { opacity: dot3, transform: [{ scale: dot3 }] }]} />
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
  title: {
    fontFamily: FONTS.TITLE,
    fontSize: 48,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
    textShadowColor: COLORS.GLOW_GOLD,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontFamily: FONTS.BODY,
    fontSize: 20,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 2,
  },
  loader: {
    flexDirection: 'row',
    marginTop: 60,
    gap: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.ACCENT_TEAL,
  }
});

export default SplashScreen;
