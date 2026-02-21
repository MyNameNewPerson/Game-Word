import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LevelData } from '../../types/LevelTypes';
import { useGridScale } from '../../hooks/useGridScale';
import GridCell from './GridCell';

interface CrosswordGridProps {
  levelData: LevelData;
  foundWords: string[];
  revealedCells: string[]; // "row,col"
  hammerMode: boolean;
  onCellPress: (row: number, col: number) => void;
}

const CrosswordGrid: React.FC<CrosswordGridProps> = ({
  levelData,
  foundWords,
  revealedCells,
  hammerMode,
  onCellPress
}) => {
  const { grid, wordPositions } = levelData;
  const rows = grid.length;
  const cols = grid[0]?.length || 0;

  const { cellSize, containerStyle, onLayout } = useGridScale(rows, cols);

  const isPartOfFoundWord = (row: number, col: number) => {
    for (const word of foundWords) {
        const pos = wordPositions[word];
        if (!pos) continue;
        const { row: startRow, col: startCol, direction } = pos;

        if (direction === 'horizontal') {
            if (row === startRow && col >= startCol && col < startCol + word.length) {
                return true;
            }
        } else {
            if (col === startCol && row >= startRow && row < startRow + word.length) {
                return true;
            }
        }
    }
    return false;
  };

  return (
    <View style={[styles.container, containerStyle]} onLayout={onLayout}>
      {grid.map((rowCells, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.row}>
          {rowCells.map((letter, colIndex) => {
            const cellKey = `${rowIndex},${colIndex}`;
            const revealed = revealedCells.includes(cellKey);
            const found = isPartOfFoundWord(rowIndex, colIndex);

            return (
              <GridCell
                key={cellKey}
                letter={letter}
                isRevealed={revealed}
                isPartOfFoundWord={found}
                isHammerTarget={hammerMode && !!letter && !revealed && !found}
                cellSize={cellSize}
                onPress={() => onCellPress(rowIndex, colIndex)}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
  },
});

export default React.memo(CrosswordGrid);
