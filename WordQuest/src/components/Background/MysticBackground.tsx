import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, Pattern, Rect, Path } from 'react-native-svg';
import { COLORS } from '../../constants/colors';

interface MysticBackgroundProps {
  children?: React.ReactNode;
}

const MysticBackground: React.FC<MysticBackgroundProps> = ({ children }) => {
  return (
    <View style={styles.container}>
      <View style={styles.patternContainer}>
        <Svg width="100%" height="100%">
          <Defs>
            <Pattern
              id="pattern"
              x="0"
              y="0"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <Path
                d="M20 0 L40 20 L20 40 L0 20 Z"
                fill="none"
                stroke={COLORS.GRID_BORDER}
                strokeWidth="1"
                opacity="0.2"
              />
              <Rect
                x="19"
                y="19"
                width="2"
                height="2"
                fill={COLORS.ACCENT_GOLD}
                opacity="0.3"
              />
            </Pattern>
          </Defs>
          <Rect
            width="100%"
            height="100%"
            fill={COLORS.BG_DARK}
          />
          <Rect
            width="100%"
            height="100%"
            fill="url(#pattern)"
            opacity="0.04"
          />
        </Svg>
      </View>
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
  patternContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
});

export default MysticBackground;
