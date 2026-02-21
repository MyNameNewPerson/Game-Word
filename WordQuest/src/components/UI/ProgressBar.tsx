import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { COLORS } from '../../constants/colors';

interface ProgressBarProps {
  progress: number; // 0 to 1
  width?: DimensionValue;
  height?: number;
  color?: string;
  trackColor?: string;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  width = '100%',
  height = 8,
  color = COLORS.ACCENT_TEAL,
  trackColor = COLORS.BG_ELEVATED,
  style,
}) => {
  const widthAnim = useSharedValue(0);

  useEffect(() => {
    widthAnim.value = withTiming(Math.max(0, Math.min(1, progress)), { duration: 500 });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${widthAnim.value * 100}%`,
    };
  });

  return (
    <View style={[styles.track, { width, height, backgroundColor: trackColor }, style]}>
      <Animated.View style={[styles.fill, { backgroundColor: color }, animatedStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});
