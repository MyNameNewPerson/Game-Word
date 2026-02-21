export interface WordPosition {
  row: number;
  col: number;
  direction: 'horizontal' | 'vertical';
}

export interface LevelData {
  id: number;
  chapter: number;
  chapterName: string;
  chapterTheme: ChapterTheme;
  letters: string[];              // letters in the circle, order matters
  words: string[];                // main crossword words (uppercase)
  bonusWords: string[];           // bonus words (exist in dictionary, not in grid)
  grid: (string | null)[][];      // 2D matrix: string=letter, null=empty cell
  wordPositions: Record<string, WordPosition>;
  difficulty: 1 | 2 | 3;
  estimatedTimeSeconds: number;   // estimated completion time
}

export interface ChapterTheme {
  background: string;  // theme name for background
  accentColor: string; // chapter accent color
  storyEntry: StoryEntry;
}

export interface StoryEntry {
  chapter: number;
  title: string;
  text: string;
  unlockCondition: 'complete_chapter'; // extensible
}
