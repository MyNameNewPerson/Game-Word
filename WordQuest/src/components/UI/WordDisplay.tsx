import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, withSpring, withTiming, withSequence,
  useAnimatedStyle
} from 'react-native-reanimated';
import { COLORS, FONT_SIZES, SPACING } from '../../constants';

// Single animated letter
const AnimatedLetter: React.FC<{ letter: string; index: number; color: string }> = ({
  letter, index, color
}) => {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { mass: 0.5, damping: 10, stiffness: 200 });
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={style}>
      <Text style={[styles.letter, { color }]}>{letter}</Text>
    </Animated.View>
  );
};

interface Props {
  word: string;
  state: 'typing' | 'correct' | 'error' | 'idle';
}

export const WordDisplay: React.FC<Props> = ({ word, state }) => {
  const containerOpacity = useSharedValue(1);

  useEffect(() => {
    if (state === 'error') {
      // On error: blink red and disappear
      containerOpacity.value = withSequence(
        withTiming(0.3, { duration: 150 }),
        withTiming(1, { duration: 150 }),
        withTiming(0, { duration: 250 }),
      );
    } else if (state === 'correct') {
      // On success: fade out (letters fly to crossword in Part D)
      containerOpacity.value = withTiming(0, { duration: 200 });
    } else {
      containerOpacity.value = 1;
    }
  }, [state, word]); // Dependency on word to reset opacity when new word starts?
  // Actually, when state changes back to 'typing' or 'idle', we want opacity 1.
  // The 'typing' state usually happens when user starts swiping again.

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const letterColor = state === 'error'
    ? COLORS.ACCENT_RED
    : state === 'correct'
      ? COLORS.ACCENT_GREEN
      : COLORS.ACCENT_TEAL;

  return (
    // Fixed height so UI doesn't jump on empty word
    <View style={styles.container}>
      <Animated.View style={[styles.lettersRow, containerStyle]}>
        {word.length === 0 ? (
          <Text style={styles.placeholder}>· · ·</Text>
        ) : (
          word.split('').map((letter, i) => (
            <AnimatedLetter
              key={`${i}-${letter}`} // Use index in key to force re-mount if same letter appears? No, standard key is fine, but we want animation on each new letter.
              // If we append a letter, the previous ones stay mounted. New one mounts and animates.
              // If we backspace or clear, they unmount.
              // Using index-letter key is okay but index alone is better for stable list if we were just updating text.
              // But we want entrance animation for new letters.
              letter={letter}
              index={i}
              color={letterColor}
            />
          ))
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 52,                        // fixed height
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.SM,
  },
  lettersRow: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  letter: {
    fontFamily: 'Cinzel-Bold',
    fontSize: FONT_SIZES.XL,
    letterSpacing: 2,
  },
  placeholder: {
    fontSize: FONT_SIZES.MD,
    color: 'rgba(255,255,255,0.15)',
    letterSpacing: 8,
  },
});
