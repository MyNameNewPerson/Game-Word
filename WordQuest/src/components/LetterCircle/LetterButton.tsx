import React, { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, withSpring, withTiming, useAnimatedStyle
} from 'react-native-reanimated';
import { COLORS, FONT_SIZES } from '../../constants';
import { SIZES } from '../../constants/sizes';
import type { LetterPosition } from '../../utils/circleLayout';

interface Props {
  letter: string;
  isSelected: boolean;
  position: LetterPosition;
  entryDelay: number;    // delay for entry animation (ms)
}

// React.memo — MANDATORY. LetterButton re-renders on every swipe if not memoized.
const LetterButton = React.memo<Props>(({ letter, isSelected, position, entryDelay }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  // Entry animation (staggered)
  useEffect(() => {
    const timer = setTimeout(() => {
      scale.value = withSpring(1, { mass: 0.8, damping: 12, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 200 });
    }, entryDelay);
    return () => clearTimeout(timer);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const selectedStyle = isSelected ? styles.selected : styles.normal;

  return (
    <Animated.View
      style={[
        styles.button,
        selectedStyle,
        {
          position: 'absolute',
          left: position.x,
          top: position.y,
          width: SIZES.LETTER_BUTTON_SIZE,
          height: SIZES.LETTER_BUTTON_SIZE,
          borderRadius: SIZES.LETTER_BUTTON_SIZE / 2,
        },
        animStyle,
      ]}
    >
      <Text style={[styles.letter, isSelected && styles.letterSelected]}>
        {letter}
      </Text>
    </Animated.View>
  );
});

export default LetterButton;

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    // Shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  normal: {
    backgroundColor: '#2A2A3E',
    borderWidth: 1.5,
    borderColor: '#4A4A5E',
  },
  selected: {
    backgroundColor: 'rgba(78, 205, 196, 0.25)',
    borderWidth: 2,
    borderColor: COLORS.ACCENT_TEAL,
    shadowColor: COLORS.ACCENT_TEAL,
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  letter: {
    fontFamily: 'Cinzel-Bold',
    fontSize: FONT_SIZES.LG,
    color: COLORS.TEXT_PRIMARY,
  },
  letterSelected: {
    color: COLORS.ACCENT_TEAL,
  },
});
