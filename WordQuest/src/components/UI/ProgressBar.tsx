import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../../constants/colors';

interface ProgressBarProps {
  progress: number; // 0 to 1
  style?: ViewStyle;
  color?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, style, color = COLORS.ACCENT_GOLD }) => {
  return (
    <View style={[styles.container, style]}>
      <View style={[styles.fill, { width: `${Math.min(100, Math.max(0, progress * 100))}%`, backgroundColor: color }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 6,
    backgroundColor: COLORS.BG_DARK,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});

export default ProgressBar;
