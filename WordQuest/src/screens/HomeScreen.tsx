import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { AppNavigationProp } from '../navigation/types';
import { MysticBackground } from '../components/Background/MysticBackground';
import { AnimatedButton } from '../components/UI/AnimatedButton';
import { CoinCounter } from '../components/UI/CoinCounter';
import { COLORS } from '../constants/colors';
import { FONTS, FONT_SIZES } from '../constants/fonts';
import { SPACING, SIZES } from '../constants/sizes';
import { usePlayerStore } from '../store/playerStore';

const HomeScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const completedLevels = usePlayerStore(state => state.completedLevels);
  const currentLevel = Object.keys(completedLevels).length + 1;

  // Logo Animation
  const logoTranslateY = useSharedValue(0);

  useEffect(() => {
    logoTranslateY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 1500 }),
        withTiming(8, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const animatedLogoStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: logoTranslateY.value }],
    };
  });

  const handlePlay = () => {
    // Navigate directly to the current level
    navigation.navigate('Game', { levelId: currentLevel });
  };

  return (
    <MysticBackground style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.icon}>⚙️</Text>
        </View>
        <CoinCounter />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Animated.View style={[styles.logoContainer, animatedLogoStyle]}>
          <Text style={styles.title}>WordQuest</Text>
          <Text style={styles.subtitle}>Echoes of Secrets</Text>
        </Animated.View>

        <View style={styles.buttonContainer}>
          <AnimatedButton onPress={handlePlay} style={styles.playButton}>
            <Text style={styles.playButtonText}>▶ ИГРАТЬ</Text>
            <Text style={styles.levelText}>Уровень {currentLevel}</Text>
          </AnimatedButton>

          <View style={styles.secondaryButtons}>
            <AnimatedButton onPress={() => navigation.navigate('ChapterSelect')} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>🗺️ Главы</Text>
            </AnimatedButton>

            <AnimatedButton onPress={() => navigation.navigate('Shop')} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>🏪 Магазин</Text>
            </AnimatedButton>

            <AnimatedButton onPress={() => navigation.navigate('Dictionary')} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>📖 Словарь</Text>
            </AnimatedButton>
          </View>
        </View>
      </View>
    </MysticBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.LG,
    paddingTop: SIZES.HEADER_HEIGHT, // Adjust for status bar if needed
    height: SIZES.HEADER_HEIGHT + 40,
  },
  headerLeft: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
    color: COLORS.TEXT_SECONDARY,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: SPACING.XXL * 2,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.XXL,
  },
  title: {
    fontFamily: FONTS.TITLE,
    fontSize: FONT_SIZES.DISPLAY,
    color: COLORS.TEXT_PRIMARY,
    textShadowColor: COLORS.ACCENT_GOLD,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  subtitle: {
    fontFamily: FONTS.BODY,
    fontSize: FONT_SIZES.LG,
    color: COLORS.TEXT_SECONDARY,
    letterSpacing: 4,
    marginTop: SPACING.XS,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: SPACING.XL,
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: COLORS.ACCENT_TEAL,
    paddingVertical: SPACING.LG,
    paddingHorizontal: SPACING.XXL,
    borderRadius: SIZES.BORDER_RADIUS_LG,
    width: '80%',
    alignItems: 'center',
    marginBottom: SPACING.XL,
    shadowColor: COLORS.ACCENT_TEAL,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  playButtonText: {
    fontFamily: FONTS.HEADING,
    fontSize: FONT_SIZES.XL,
    color: COLORS.BG_DARK,
    marginBottom: SPACING.XS,
  },
  levelText: {
    fontFamily: FONTS.BODY_BOLD,
    fontSize: FONT_SIZES.MD,
    color: COLORS.BG_DARK,
    opacity: 0.8,
  },
  secondaryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  secondaryButton: {
    backgroundColor: COLORS.BG_ELEVATED,
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.MD,
    borderRadius: SIZES.BORDER_RADIUS,
    borderWidth: 1,
    borderColor: COLORS.DIVIDER,
    flex: 1,
    marginHorizontal: SPACING.XS,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontFamily: FONTS.BODY_BOLD,
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_PRIMARY,
  },
});

export default HomeScreen;
