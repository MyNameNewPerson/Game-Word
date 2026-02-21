import { WordPosition } from '../types/LevelTypes';

export const cellKey = (row: number, col: number): string => `${row},${col}`;

export const getCellsForWord = (word: string, position: WordPosition): string[] => {
  const cells: string[] = [];
  const { row, col, direction } = position;

  for (let i = 0; i < word.length; i++) {
    const r = row + (direction === 'vertical' ? i : 0);
    const c = col + (direction === 'horizontal' ? i : 0);
    cells.push(cellKey(r, c));
  }

  return cells;
};

export const isPartOfFoundWord = (
  row: number,
  col: number,
  foundWords: string[],
  wordPositions: Record<string, WordPosition>
): { letter: string | null; isFound: boolean } => {
  const key = cellKey(row, col);

  for (const word of foundWords) {
    const pos = wordPositions[word];
    if (!pos) continue;

    const cells = getCellsForWord(word, pos);
    const index = cells.indexOf(key);

    if (index !== -1) {
      return { letter: word[index], isFound: true };
    }
  }

  return { letter: null, isFound: false };
};

export const getAllGridCells = (rows: number, cols: number): { row: number; col: number }[] => {
    const cells = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            cells.push({ row: r, col: c });
        }
    }
    return cells;
};
