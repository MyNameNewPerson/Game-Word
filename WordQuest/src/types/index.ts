// ─── ДАННЫЕ УРОВНЯ (из levels.json) ───────────────────────────────────────

export interface WordPosition {
  row: number;
  col: number;
  direction: 'horizontal' | 'vertical';
}

export interface LevelData {
  id: number;                              // 1–100
  chapter: number;                         // 1–10
  letters: string[];                       // буквы в круге, например ['С','О','Н','К','Р','А']
  words: string[];                         // основные слова уровня, например ['СОКОЛ','НОС','КОТ']
  grid: (string | null)[][];              // сетка кроссворда, null = пустая клетка
  wordPositions: Record<string, WordPosition>; // позиция каждого слова в сетке
  gridRows: number;
  gridCols: number;
  estimatedTimeSeconds: number;           // ожидаемое время прохождения
  difficultyScore: number;                // 1.0–5.0
  isDailyPuzzle?: boolean;                // признак ежедневного пазла
}

// ─── ПРОГРЕСС ИГРОКА ──────────────────────────────────────────────────────

export interface CompletedLevel {
  levelId: number;
  stars: 1 | 2 | 3;
  bestTimeSeconds: number;
  coinsEarned: number;
  completedAt: number;                    // unix timestamp
}

export interface PlayerProgress {
  playerLevel: number;                    // личный уровень игрока 1–∞
  xp: number;                            // текущий XP
  xpForNextLevel: number;
  title: string;                         // "Новичок", "Знаток слова"...
}

// ─── STORE ИГРОКА ─────────────────────────────────────────────────────────

export interface PlayerStore {
  // Валюта
  coins: number;
  piggyBank: number;                     // накопления в копилке, макс 1000

  // Прогресс
  completedLevels: Record<number, CompletedLevel>;
  playerProgress: PlayerProgress;

  // Настройки и флаги
  hasNoAds: boolean;
  tutorialCompleted: boolean;
  streakDays: number;
  lastPlayedDate: string | null;         // "2025-03-15" — дата последней игры

  // Дейли
  dailyPuzzleLastDate: string | null;
  dailyPuzzleCompleted: boolean;

  // Действия
  addCoins: (n: number) => void;
  spendCoins: (n: number) => void;
  setNoAds: (v: boolean) => void;
  incrementPiggyBank: (n: number) => void;
  resetPiggyBank: () => void;
  setTutorialCompleted: () => void;
  updateStreak: () => void;
  saveLevelResult: (result: CompletedLevel) => void;
  addXP: (amount: number) => void;
  setDailyPuzzleCompleted: (date: string) => void;
}

// ─── STORE ИГРОВОЙ СЕССИИ ─────────────────────────────────────────────────

export interface GameSessionState {
  foundWords: string[];                  // найденные основные слова
  foundBonusWords: string[];            // найденные бонусные слова
  revealedCells: string[];              // ячейки открытые подсказкой ("row,col")
  hintsUsed: number;
  startTime: number;                    // unix timestamp начала уровня
}

export interface GameStore {
  currentLevel: LevelData | null;
  session: GameSessionState;

  setLevel: (level: LevelData) => void;
  resetSession: () => void;
  addFoundWord: (word: string) => void;
  addFoundBonusWord: (word: string) => void;
  addRevealedCell: (cell: string) => void;
  incrementHints: () => void;
}

// ─── ПРОВЕРКА СЛОВА ──────────────────────────────────────────────────────

export type WordCheckResultType =
  | 'correct'
  | 'bonus'
  | 'already_found'
  | 'incorrect'
  | 'too_short';

export interface WordCheckResult {
  type: WordCheckResultType;
  word: string;
}

// ─── ГЛАВА ───────────────────────────────────────────────────────────────

export interface ChapterData {
  id: number;
  name: string;
  emoji: string;
  narrative: string;
  visualTheme: string;                   // ключ для фонового компонента
  colorPrimary: string;                  // основной цвет главы (hex)
  colorBg: string;                       // цвет фона главы (hex)
  levels: number[];                      // id уровней этой главы
}
