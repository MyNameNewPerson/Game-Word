import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, withTiming, useAnimatedStyle
} from 'react-native-reanimated';
import { COLORS, FONT_SIZES, SPACING, SIZES } from '../../constants';

interface Props {
  coins: number;
  found: number;
  total: number;
  piggyBank: number;
  onLightbulb: () => void;
  onHammer: () => void;
  onPiggyPress: () => void;
}

export const HintsBar: React.FC<Props> = ({
  coins, found, total, piggyBank, onLightbulb, onHammer, onPiggyPress
}) => {
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    const pct = total > 0 ? found / total : 0;
    progressWidth.value = withTiming(pct, { duration: 400 });
  }, [found, total]);

  const progressStyle = useAnimatedStyle(() => ({
    flex: progressWidth.value,
  }));

  return (
    <View style={styles.container}>
      {/* Лампочка */}
      <TouchableOpacity style={styles.hintButton} onPress={onLightbulb} activeOpacity={0.7}>
        <Text style={styles.hintIcon}>💡</Text>
        <Text style={styles.hintCost}>100</Text>
      </TouchableOpacity>

      {/* Прогресс */}
      <View style={styles.progressArea}>
        <View style={styles.progressBg}>
          <Animated.View style={[styles.progressFill, progressStyle]} />
          <View style={{ flex: Math.max(0, 1 - (total > 0 ? found / total : 0)) }} />
        </View>
        <Text style={styles.progressLabel}>{found} из {total}</Text>
      </View>

      {/* Молоток */}
      <TouchableOpacity style={styles.hintButton} onPress={onHammer} activeOpacity={0.7}>
        <Text style={styles.hintIcon}>🔨</Text>
        <Text style={styles.hintCost}>200</Text>
      </TouchableOpacity>

      {/* Копилка */}
      <TouchableOpacity onPress={onPiggyPress} style={styles.piggyButton} activeOpacity={0.7}>
        <Text style={styles.piggyIcon}>🐷</Text>
        {piggyBank > 0 && (
          <View style={styles.piggyBadge}>
            <Text style={styles.piggyBadgeText}>{piggyBank}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    gap: SPACING.SM,
  },
  hintButton: {
    alignItems: 'center',
    padding: SPACING.SM,
    borderRadius: SIZES.BORDER_RADIUS,
    borderWidth: 1,
    borderColor: COLORS.GRID_BORDER,
    minWidth: 52,
  },
  hintIcon: { fontSize: 20 },
  hintCost: {
    fontFamily: 'Cinzel-Bold',
    fontSize: FONT_SIZES.XS,
    color: COLORS.ACCENT_GOLD,
  },
  progressArea: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  progressBg: {
    width: '100%',
    height: 6,
    backgroundColor: COLORS.GRID_EMPTY,
    borderRadius: 3,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: COLORS.ACCENT_GOLD,
    borderRadius: 3,
  },
  progressLabel: {
    fontFamily: 'CrimsonText-Regular',
    fontSize: FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY,
  },
  piggyButton: {
    padding: SPACING.SM,
    position: 'relative',
  },
  piggyIcon: { fontSize: 24 },
  piggyBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.ACCENT_GOLD,
    borderRadius: 8,
    paddingHorizontal: 3,
    minWidth: 16,
    alignItems: 'center',
  },
  piggyBadgeText: {
    fontSize: 8,
    fontFamily: 'Cinzel-Bold',
    color: COLORS.BG_DARK,
  },
});
