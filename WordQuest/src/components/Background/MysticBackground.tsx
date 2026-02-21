import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Defs, Pattern, Rect, Path, Circle } from 'react-native-svg';
import { COLORS } from '../../constants/colors';

interface MysticBackgroundProps {
  children?: React.ReactNode;
  style?: ViewStyle;
}

export const MysticBackground: React.FC<MysticBackgroundProps> = ({ children, style }) => {
  return (
    <View style={[styles.container, style]}>
      {/* Base Background */}
      <View style={StyleSheet.absoluteFillObject}>
        <Svg height="100%" width="100%">
          <Defs>
            <Pattern
              id="pattern"
              x="0"
              y="0"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <Rect width="100%" height="100%" fill={COLORS.BG_DARK} />
              <Circle cx="30" cy="30" r="1.5" fill={COLORS.TEXT_SECONDARY} opacity="0.1" />
              <Path
                d="M 10 30 L 50 30 M 30 10 L 30 50"
                stroke={COLORS.GRID_BORDER_DIM}
                strokeWidth="0.5"
                opacity="0.15"
              />
            </Pattern>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#pattern)" />
        </Svg>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG_DARK,
  },
  content: {
    flex: 1,
  },
});
