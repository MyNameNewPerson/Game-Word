import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { LevelData } from '../../types';
import { useGridScale } from '../../hooks/useGridScale';
import { isPartOfFoundWord, cellKey } from '../../utils/gridUtils';
import GridCell from './GridCell';

interface CrosswordGridProps {
  levelData: LevelData;
  foundWords: string[];
  revealedCells: string[];
  hammerMode: boolean;
  onCellPress: (row: number, col: number) => void;
}

const CrosswordGrid: React.FC<CrosswordGridProps> = ({
  levelData,
  foundWords,
  revealedCells,
  hammerMode,
  onCellPress,
}) => {
  const { grid, wordPositions } = levelData;
  const rows = grid.length;
  const cols = grid[0]?.length || 0;

  const { cellSize, containerStyle, onLayout } = useGridScale(rows, cols);

  // Precompute found status for all cells to avoid heavy calculation in render
  // Actually, GridCell is memoized, so we pass props.
  // But isPartOfFoundWord calculation is fast enough for 7x7 grid.

  return (
    <View style={containerStyle} onLayout={onLayout}>
      {grid.map((row, r) => (
        <View key={`row-${r}`} style={styles.row}>
          {row.map((letter, c) => {
            const key = cellKey(r, c);
            const isRevealed = revealedCells.includes(key);
            const { isFound } = isPartOfFoundWord(r, c, foundWords, wordPositions);

            return (
              <TouchableOpacity
                key={key}
                activeOpacity={hammerMode && letter ? 0.8 : 1}
                onPress={() => letter && onCellPress(r, c)}
                disabled={!letter}
              >
                <GridCell
                  letter={letter}
                  isRevealed={isRevealed}
                  isPartOfFoundWord={isFound}
                  isHammerTarget={hammerMode && !!letter && !isFound && !isRevealed}
                  cellSize={cellSize}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
});

export default CrosswordGrid;
