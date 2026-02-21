export interface PlayerProgress {
  coins: number;                  // current balance
  currentLevel: number;
  completedLevels: number[];
  piggyBankAmount: number;        // 0–1000
  hasNoAds: boolean;
  stats: PlayerStats;
  achievements: string[];         // id of unlocked achievements
  dailyStreak: DailyStreak;
  foundBonusWordsAll: string[];   // all bonus words ever found
  lastAdShownLevel: number;       // ad frequency control
}

export interface PlayerStats {
  totalWordsFound: number;
  totalBonusWords: number;
  totalCoinsEarned: number;
  totalLevelsCompleted: number;
  longestStreak: number;
  totalPlayTimeSeconds: number;
  levelsCompletedNoHints: number;
}

export interface DailyStreak {
  count: number;
  lastPlayDate: string;           // ISO date string "2025-01-15"
  bestStreak: number;
}
