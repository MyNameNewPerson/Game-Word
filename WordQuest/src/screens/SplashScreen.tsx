import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { AppNavigationProp } from '../navigation/types';
import { COLORS } from '../constants/colors';
import { FONTS, FONT_SIZES } from '../constants/fonts';
import { SPACING } from '../constants/sizes';
import { SaveManager } from '../services/SaveManager';
import { LevelManager } from '../services/LevelManager';
import { usePlayerStore } from '../store/playerStore';
import { useGameStore } from '../store/gameStore';

const SplashScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const loadProgress = usePlayerStore(state => state.loadProgress);
  const loadSession = useGameStore(state => state.loadSession);

  // Animation values
  const logoTranslateY = useSharedValue(20);
  const logoOpacity = useSharedValue(0);

  useEffect(() => {
    // Start animations
    logoTranslateY.value = withSpring(0, { damping: 10, stiffness: 100 });
    logoOpacity.value = withTiming(1, { duration: 800 });

    const initApp = async () => {
      // Initialize managers and stores
      await SaveManager.initializeDefaults();
      LevelManager.preload();
      await loadProgress();
      await loadSession();

      // Artificial delay for effect
      await new Promise(resolve => setTimeout(resolve, 2000));

      navigation.replace('Home');
    };

    initApp();
  }, []);

  const animatedLogoStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: logoTranslateY.value }],
      opacity: logoOpacity.value,
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, animatedLogoStyle]}>
        <Text style={styles.title}>WordQuest</Text>
        <Text style={styles.subtitle}>Echoes of Secrets</Text>
      </Animated.View>

      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.ACCENT_TEAL} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG_DARK,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.XL,
  },
  title: {
    fontFamily: FONTS.TITLE,
    fontSize: FONT_SIZES.DISPLAY,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    textShadowColor: COLORS.ACCENT_GOLD,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontFamily: FONTS.BODY,
    fontSize: FONT_SIZES.LG,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.SM,
    letterSpacing: 2,
  },
  loaderContainer: {
    position: 'absolute',
    bottom: SPACING.XXL,
  },
});

export default SplashScreen;
