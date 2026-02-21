import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import MysticBackground from '../components/Background/MysticBackground';
import AnimatedButton from '../components/UI/AnimatedButton';
import CoinCounter from '../components/UI/CoinCounter';
import { COLORS } from '../constants/colors';
import { FONTS, FONT_SIZES } from '../constants/fonts';
import { SPACING } from '../constants/sizes';
import { usePlayerStore } from '../store/playerStore';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const currentLevel = usePlayerStore((state) => state.currentLevel);
  const logoAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoAnim, {
          toValue: 8,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(logoAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <MysticBackground>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.piggyPlaceholder}><Text>🐷</Text></View>
          <CoinCounter />
          <View style={styles.settingsPlaceholder}><Text>⚙️</Text></View>
        </View>

        {/* Logo */}
        <Animated.View style={[styles.logoContainer, { transform: [{ translateY: logoAnim }] }]}>
          <Text style={styles.logoTitle}>WordQuest</Text>
          <Text style={styles.logoSubtitle}>Echoes of Secrets</Text>
        </Animated.View>

        {/* Menu Buttons */}
        <View style={styles.menu}>
          <AnimatedButton
            onPress={() => navigation.navigate('Game', { levelId: currentLevel })}
            style={styles.playButton}
          >
            <Text style={styles.playButtonText}>PLAY</Text>
            <Text style={styles.levelText}>Level {currentLevel}</Text>
          </AnimatedButton>

          <View style={styles.secondaryButtons}>
             <AnimatedButton
              onPress={() => navigation.navigate('Shop')}
              style={styles.secondaryButton}
              title="SHOP"
            />
            <AnimatedButton
              onPress={() => navigation.navigate('Dictionary')}
              style={styles.secondaryButton}
              title="WORDS"
            />
          </View>

           <AnimatedButton
              onPress={() => navigation.navigate('ChapterSelect')}
              style={styles.chapterButton}
              title="CHAPTERS"
            />
        </View>

        {/* Daily Streak Badge (Placeholder) */}
        <View style={styles.streakBadge}>
          <Text style={styles.streakText}>🔥 3 Days Streak</Text>
        </View>
      </View>
    </MysticBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.LG,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
  },
  piggyPlaceholder: {
    width: 40, height: 40, backgroundColor: COLORS.BG_ELEVATED, borderRadius: 20, justifyContent: 'center', alignItems: 'center'
  },
  settingsPlaceholder: {
    width: 40, height: 40, backgroundColor: COLORS.BG_ELEVATED, borderRadius: 20, justifyContent: 'center', alignItems: 'center'
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoTitle: {
    fontFamily: FONTS.TITLE,
    fontSize: 56,
    color: COLORS.TEXT_PRIMARY,
    textShadowColor: COLORS.GLOW_GOLD,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  logoSubtitle: {
    fontFamily: FONTS.BODY,
    fontSize: FONT_SIZES.LG,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.XS,
    letterSpacing: 3,
  },
  menu: {
    marginBottom: SPACING.XXL,
    gap: SPACING.MD,
  },
  playButton: {
    backgroundColor: COLORS.ACCENT_TEAL,
    paddingVertical: 20,
    alignItems: 'center',
    borderRadius: 16,
    shadowColor: COLORS.ACCENT_TEAL,
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  playButtonText: {
    fontFamily: FONTS.HEADING,
    fontSize: FONT_SIZES.XL,
    color: COLORS.BG_DARK,
  },
  levelText: {
    fontFamily: FONTS.BODY_BOLD,
    fontSize: FONT_SIZES.MD,
    color: COLORS.BG_DARK,
    opacity: 0.8,
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: SPACING.MD,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: COLORS.BG_ELEVATED,
    borderColor: COLORS.DIVIDER,
    borderWidth: 1,
  },
  chapterButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: COLORS.TEXT_SECONDARY,
  },
  streakBadge: {
    position: 'absolute',
    bottom: SPACING.MD,
    alignSelf: 'center',
    backgroundColor: COLORS.BG_CARD,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.ACCENT_RED,
  },
  streakText: {
    color: COLORS.ACCENT_RED,
    fontFamily: FONTS.BODY_BOLD,
    fontSize: FONT_SIZES.SM,
  }
});

export default HomeScreen;
