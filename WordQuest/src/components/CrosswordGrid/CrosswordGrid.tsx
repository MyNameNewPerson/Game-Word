import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, LayoutChangeEvent, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue, withRepeat, withTiming, useAnimatedStyle
} from 'react-native-reanimated';
import { LevelData, WordPosition } from '../../types';
import { COLORS, SIZES, FONT_SIZES } from '../../constants';

// ─── ВЫЧИСЛЕНИЕ СОСТОЯНИЯ ЯЧЕЕК ───────────────────────────────────────────

interface CellState {
  letter: string | null;
  isFound: boolean;
  isRevealed: boolean;
  wordNumber?: number;
}

function computeCellStates(
  grid: (string | null)[][],
  wordPositions: Record<string, WordPosition>,
  foundWords: string[],
  revealedCells: string[],
): CellState[][] {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;

  // Вычисляем номера слов (первая ячейка каждого слова)
  const wordNumbers: Record<string, number> = {};
  Object.keys(wordPositions).forEach((word, idx) => {
    const pos = wordPositions[word];
    wordNumbers[`${pos.row},${pos.col}`] = idx + 1;
  });

  return grid.map((row, r) =>
    row.map((cell, c) => {
      if (cell === null) {
        return { letter: null, isFound: false, isRevealed: false };
      }

      // Принадлежит ли ячейка найденному слову?
      const isFound = foundWords.some(word => {
        const pos = wordPositions[word];
        if (!pos) return false;
        for (let i = 0; i < word.length; i++) {
          const wr = pos.row + (pos.direction === 'vertical' ? i : 0);
          const wc = pos.col + (pos.direction === 'horizontal' ? i : 0);
          if (wr === r && wc === c) return true;
        }
        return false;
      });

      const isRevealed = revealedCells.includes(`${r},${c}`);
      const wordNumber = wordNumbers[`${r},${c}`];

      return { letter: cell, isFound, isRevealed, wordNumber };
    })
  );
}

// ─── ХРАНИЛИЩЕ РАЗМЕРА ────────────────────────────────────────────────────

function useCellSize(rows: number, cols: number) {
  const [container, setContainer] = useState({ width: 0, height: 0 });

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setContainer({
      width: e.nativeEvent.layout.width,
      height: e.nativeEvent.layout.height,
    });
  }, []);

  const cellSize = container.width > 0
    ? Math.max(
        SIZES.CELL_MIN,
        Math.min(
          SIZES.CELL_MAX,
          Math.floor((container.width - 32) / cols),
          Math.floor((container.height - 16) / rows),
        )
      )
    : SIZES.CELL_MIN;

  return { cellSize, onLayout };
}

// ─── ЯЧЕЙКА ───────────────────────────────────────────────────────────────

interface GridCellProps {
  state: CellState;
  size: number;
  hammerMode: boolean;
  onPress?: () => void;
}

const GridCell = React.memo<GridCellProps>(({ state, size, hammerMode, onPress }) => {
  // Анимация пульсации в режиме молотка
  const borderOpacity = useSharedValue(1);
  React.useEffect(() => {
    if (hammerMode && state.letter !== null && !state.isFound) {
      borderOpacity.value = withRepeat(
        withTiming(0.2, { duration: 600 }),
        -1, true
      );
    } else {
      borderOpacity.value = 1;
    }
  }, [hammerMode, state.letter, state.isFound]);

  const pulseStyle = useAnimatedStyle(() => ({
    borderColor: hammerMode && state.letter !== null && !state.isFound
      ? `rgba(255, 215, 0, ${borderOpacity.value})`
      : (state.isRevealed ? COLORS.ACCENT_TEAL : COLORS.GRID_BORDER),
  }));

  if (state.letter === null) {
    // Прозрачная ячейка (не часть кроссворда)
    return <View style={{ width: size, height: size, margin: 1 }} />;
  }

  const cellBg = state.isRevealed
    ? COLORS.GRID_REVEALED
    : state.isFound
      ? COLORS.GRID_FILLED
      : COLORS.GRID_EMPTY;

  const letterColor = state.isRevealed
    ? COLORS.ACCENT_TEAL
    : state.isFound
      ? COLORS.TEXT_PRIMARY
      : 'transparent';      // буква не видна до нахождения

  const content = (
    <Animated.View style={[styles.cell, { width: size, height: size, backgroundColor: cellBg }, pulseStyle]}>
      {/* Номер слова в углу */}
      {state.wordNumber !== undefined && (
        <Text style={styles.wordNumber}>{state.wordNumber}</Text>
      )}
      {/* Буква */}
      <Text style={[styles.cellLetter, { fontSize: size * 0.5, color: letterColor }]}>
        {(state.isFound || state.isRevealed) ? state.letter : ''}
      </Text>
    </Animated.View>
  );

  if (hammerMode && !state.isFound && onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
});

// ─── КРОССВОРД ────────────────────────────────────────────────────────────

interface CrosswordGridProps {
  levelData: LevelData;
  foundWords: string[];
  revealedCells: string[];
  hammerMode: boolean;
  onCellPress: (row: number, col: number) => void;
  style?: any;
}

export const CrosswordGrid: React.FC<CrosswordGridProps> = ({
  levelData,
  foundWords,
  revealedCells,
  hammerMode,
  onCellPress,
  style,
}) => {
  const { cellSize, onLayout } = useCellSize(levelData.gridRows, levelData.gridCols);

  // useMemo — тяжёлое вычисление, не пересчитывать без нужды
  const cellStates = useMemo(
    () => computeCellStates(
      levelData.grid,
      levelData.wordPositions,
      foundWords,
      revealedCells,
    ),
    [levelData, foundWords, revealedCells]
  );

  return (
    <View style={[styles.container, style]} onLayout={onLayout}>
      {cellStates.map((row, r) => (
        <View key={r} style={styles.row}>
          {row.map((cell, c) => (
            <GridCell
              key={`${r}-${c}`}
              state={cell}
              size={cellSize}
              hammerMode={hammerMode}
              onPress={() => onCellPress(r, c)}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    margin: 1,
    borderWidth: 1,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: COLORS.GRID_BORDER,
  },
  wordNumber: {
    position: 'absolute',
    top: 2,
    left: 3,
    fontSize: FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY,
    fontFamily: 'CrimsonText-Regular',
    lineHeight: FONT_SIZES.XS,
  },
  cellLetter: {
    fontFamily: 'Cinzel-Bold',
    textAlign: 'center',
  },
});
