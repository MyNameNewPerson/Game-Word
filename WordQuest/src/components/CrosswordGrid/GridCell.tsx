import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming, withSequence, withSpring } from 'react-native-reanimated';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/fonts';

interface GridCellProps {
  letter: string | null;
  isRevealed: boolean;
  isPartOfFoundWord: boolean;
  isHammerTarget: boolean;
  cellSize: number;
}

const GridCell: React.FC<GridCellProps> = ({
  letter,
  isRevealed,
  isPartOfFoundWord,
  isHammerTarget,
  cellSize,
}) => {
  // Determine cell state
  const isFilled = isRevealed || isPartOfFoundWord;
  const showLetter = isFilled && letter !== null;

  // Base styles based on state
  const backgroundColor = isPartOfFoundWord
    ? COLORS.GRID_FILLED
    : isRevealed
    ? COLORS.GRID_REVEALED
    : COLORS.GRID_EMPTY;

  const borderColor = isPartOfFoundWord
    ? COLORS.GRID_BORDER
    : isRevealed
    ? COLORS.ACCENT_TEAL
    : COLORS.GRID_BORDER; // Use Golden border for all active cells

  // Animated styles could be added here for reveal/found effects
  // For now, basic state transitions

  if (letter === null) {
    return <View style={{ width: cellSize, height: cellSize }} />;
  }

  return (
    <View
      style={[
        styles.cell,
        {
          width: cellSize,
          height: cellSize,
          backgroundColor,
          borderColor,
          // Slightly smaller than cell size to have gaps
          margin: 1,
        },
      ]}
    >
      {showLetter && (
        <Text
          style={[
            styles.letter,
            {
              fontSize: cellSize * 0.6,
              color: isPartOfFoundWord ? COLORS.TEXT_PRIMARY : COLORS.ACCENT_TEAL,
            },
          ]}
        >
          {letter}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
  },
  letter: {
    fontFamily: FONTS.HEADING,
    fontWeight: 'bold',
  },
});

export default React.memo(GridCell);
