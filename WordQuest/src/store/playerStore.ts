import { create } from 'zustand';
import { PlayerProgress, PlayerStats, DailyStreak } from '../types/PlayerTypes';
import { SaveManager } from '../services/SaveManager';
import { STORAGE_KEYS } from '../constants/storageKeys';

interface PlayerState extends PlayerProgress {
  loadProgress: () => Promise<void>;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  incrementPiggyBank: (amount: number) => void;
  resetPiggyBank: () => void;
  setNoAds: (value: boolean) => void;
  completeLevel: (levelId: number) => void;
  updateStats: (partial: Partial<PlayerStats>) => void;
  unlockAchievement: (id: string) => void;
  updateDailyStreak: (streak: DailyStreak) => void;
  setLastAdShownLevel: (levelId: number) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  coins: 500,
  currentLevel: 1,
  completedLevels: [],
  piggyBankAmount: 0,
  hasNoAds: false,
  stats: {
    totalWordsFound: 0,
    totalBonusWords: 0,
    totalCoinsEarned: 0,
    totalLevelsCompleted: 0,
    longestStreak: 0,
    totalPlayTimeSeconds: 0,
    levelsCompletedNoHints: 0,
  },
  achievements: [],
  dailyStreak: {
    count: 0,
    lastPlayDate: '',
    bestStreak: 0,
  },
  foundBonusWordsAll: [],
  lastAdShownLevel: 0,

  loadProgress: async () => {
    const progress = await SaveManager.get<PlayerProgress>(STORAGE_KEYS.PLAYER_PROGRESS);
    if (progress) {
      set(progress);
    } else {
        await SaveManager.initializeDefaults();
        const defaultProgress = await SaveManager.get<PlayerProgress>(STORAGE_KEYS.PLAYER_PROGRESS);
        if(defaultProgress) set(defaultProgress);
    }
  },

  addCoins: (amount) => {
    set((state) => {
      const newCoins = state.coins + amount;
      const newStats = {
          ...state.stats,
          totalCoinsEarned: state.stats.totalCoinsEarned + amount
      };
      const newState = { coins: newCoins, stats: newStats };
      SaveManager.set(STORAGE_KEYS.PLAYER_PROGRESS, { ...state, ...newState });
      return newState;
    });
  },

  spendCoins: (amount) => {
    const { coins } = get();
    if (coins >= amount) {
      set((state) => {
        const newCoins = state.coins - amount;
        const newState = { coins: newCoins };
        SaveManager.set(STORAGE_KEYS.PLAYER_PROGRESS, { ...state, ...newState });
        return newState;
      });
      return true;
    }
    return false;
  },

  incrementPiggyBank: (amount) => {
    set((state) => {
      const newAmount = Math.min(1000, state.piggyBankAmount + amount);
      const newState = { piggyBankAmount: newAmount };
      SaveManager.set(STORAGE_KEYS.PLAYER_PROGRESS, { ...state, ...newState });
      return newState;
    });
  },

  resetPiggyBank: () => {
    set((state) => {
        const newState = { piggyBankAmount: 0 };
        SaveManager.set(STORAGE_KEYS.PLAYER_PROGRESS, { ...state, ...newState });
        return newState;
    });
  },

  setNoAds: (value) => {
    set((state) => {
      const newState = { hasNoAds: value };
      SaveManager.set(STORAGE_KEYS.PLAYER_PROGRESS, { ...state, ...newState });
      return newState;
    });
  },

  completeLevel: (levelId) => {
    set((state) => {
      const completedLevels = state.completedLevels.includes(levelId)
        ? state.completedLevels
        : [...state.completedLevels, levelId];

      const currentLevel = Math.max(state.currentLevel, levelId + 1); // Advance to next level if simpler logic

      const newState = { completedLevels, currentLevel };
      SaveManager.set(STORAGE_KEYS.PLAYER_PROGRESS, { ...state, ...newState });
      return newState;
    });
  },

  updateStats: (partial) => {
    set((state) => {
      const newStats = { ...state.stats, ...partial };
      const newState = { stats: newStats };
      SaveManager.set(STORAGE_KEYS.PLAYER_PROGRESS, { ...state, ...newState });
      return newState;
    });
  },

  unlockAchievement: (id) => {
    set((state) => {
      if (state.achievements.includes(id)) return {};
      const newAchievements = [...state.achievements, id];
      const newState = { achievements: newAchievements };
      SaveManager.set(STORAGE_KEYS.PLAYER_PROGRESS, { ...state, ...newState });
      return newState;
    });
  },

  updateDailyStreak: (streak) => {
      set((state) => {
          const newState = { dailyStreak: streak };
          SaveManager.set(STORAGE_KEYS.PLAYER_PROGRESS, {...state, ...newState});
          return newState;
      });
  },

  setLastAdShownLevel: (levelId) => {
      set((state) => {
          const newState = { lastAdShownLevel: levelId };
          SaveManager.set(STORAGE_KEYS.PLAYER_PROGRESS, {...state, ...newState});
          return newState;
      });
  }
}));
