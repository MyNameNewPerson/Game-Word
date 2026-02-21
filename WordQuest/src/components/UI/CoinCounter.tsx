import React, { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming, withSpring } from 'react-native-reanimated';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES } from '../../constants/fonts';
import { SPACING } from '../../constants/sizes';
import { usePlayerStore } from '../../store/playerStore';

export const CoinCounter: React.FC = () => {
  const coins = usePlayerStore((state) => state.coins);
  const scale = useSharedValue(1);

  // Trigger animation when coins change
  useEffect(() => {
    scale.value = withSequence(
      withTiming(1.2, { duration: 100 }),
      withSpring(1)
    );
  }, [coins]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Text style={styles.icon}>🪙</Text>
      <Text style={styles.text}>{coins}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BG_ELEVATED,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.XS,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.ACCENT_GOLD,
  },
  icon: {
    fontSize: FONT_SIZES.LG,
    marginRight: SPACING.XS,
  },
  text: {
    fontFamily: FONTS.NUMBERS_BOLD,
    fontSize: FONT_SIZES.MD,
    color: COLORS.ACCENT_GOLD,
  },
});
