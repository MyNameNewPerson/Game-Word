export interface GameSessionState {
  levelId: number;
  foundWords: string[];           // guessed main words
  foundBonusWords: string[];      // guessed bonus words
  revealedCells: string[];        // cells revealed by hints, format: "row,col"
  hintsUsed: number;
  startedAt: number;              // timestamp
  isComplete: boolean;
}

export type WordCheckResult =
  | { type: 'too_short' }
  | { type: 'already_found' }
  | { type: 'incorrect' }
  | { type: 'correct'; isBonus: false }
  | { type: 'correct'; isBonus: true; coinsEarned: number };

export interface DailyQuest {
  id: string;
  type: 'find_words' | 'complete_level' | 'find_bonus' | 'no_hints' | 'long_word';
  description: string;
  target: number;
  progress: number;
  rewardCoins: number;
  completed: boolean;
  claimedAt?: number;
}
