import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, withSequence, withRepeat } from 'react-native-reanimated';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';

interface GridCellProps {
  letter: string | null;
  isRevealed: boolean;
  isPartOfFoundWord: boolean;
  isHammerTarget: boolean;
  cellSize: number;
  onPress?: () => void;
}

const GridCell: React.FC<GridCellProps> = ({
  letter,
  isRevealed,
  isPartOfFoundWord,
  isHammerTarget,
  cellSize,
  onPress
}) => {
  if (!letter) {
    return <View style={{ width: cellSize, height: cellSize }} />;
  }

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const borderColor = useSharedValue<string>(COLORS.GRID_BORDER);

  useEffect(() => {
    if (isRevealed || isPartOfFoundWord) {
      scale.value = withSpring(1);
      opacity.value = withTiming(1, { duration: 300 });
    }
  }, [isRevealed, isPartOfFoundWord]);

  useEffect(() => {
    if (isHammerTarget) {
        borderColor.value = withRepeat(
            withSequence(
                withTiming(COLORS.ACCENT_GOLD, { duration: 500 }),
                withTiming(COLORS.GRID_BORDER, { duration: 500 })
            ),
            -1,
            true
        );
    } else {
        borderColor.value = withTiming(COLORS.GRID_BORDER);
    }
  }, [isHammerTarget]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const borderStyle = useAnimatedStyle(() => {
      return {
          borderColor: borderColor.value
      };
  });

  const backgroundColor = isPartOfFoundWord
    ? COLORS.GRID_FILLED
    : isRevealed
    ? COLORS.GRID_REVEALED
    : COLORS.GRID_EMPTY;

  return (
    <Animated.View
      onTouchEnd={onPress}
      style={[
        styles.cell,
        borderStyle,
        {
          width: cellSize,
          height: cellSize,
          backgroundColor: isRevealed || isPartOfFoundWord ? backgroundColor : COLORS.GRID_EMPTY,
        },
      ]}
    >
      {(isRevealed || isPartOfFoundWord) && (
        <Animated.Text style={[styles.text, animatedStyle, { fontSize: cellSize * 0.6 }]}>
          {letter}
        </Animated.Text>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
    margin: 1,
  },
  text: {
    fontFamily: FONTS.HEADING,
    color: COLORS.TEXT_PRIMARY,
  },
});

export default React.memo(GridCell);
