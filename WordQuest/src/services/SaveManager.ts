import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { PlayerProgress, PlayerStats, DailyStreak } from '../types/PlayerTypes';

export class SaveManager {
  static async get<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error(`Error reading value for key ${key}`, e);
      return null;
    }
  }

  static async set<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
      console.error(`Error saving value for key ${key}`, e);
    }
  }

  static async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error(`Error removing value for key ${key}`, e);
    }
  }

  static async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (e) {
      console.error('Error clearing storage', e);
    }
  }

  static async initializeDefaults(): Promise<void> {
    try {
      const progress = await this.get<PlayerProgress>(STORAGE_KEYS.PLAYER_PROGRESS);
      if (!progress) {
        const initialStats: PlayerStats = {
            totalWordsFound: 0,
            totalBonusWords: 0,
            totalCoinsEarned: 0,
            totalLevelsCompleted: 0,
            longestStreak: 0,
            totalPlayTimeSeconds: 0,
            levelsCompletedNoHints: 0
        };

        const initialStreak: DailyStreak = {
            count: 0,
            lastPlayDate: '',
            bestStreak: 0
        };

        const initialProgress: PlayerProgress = {
          coins: 500,
          currentLevel: 1,
          completedLevels: [],
          piggyBankAmount: 0,
          hasNoAds: false,
          stats: initialStats,
          achievements: [],
          dailyStreak: initialStreak,
          foundBonusWordsAll: [],
          lastAdShownLevel: 0,
        };
        await this.set(STORAGE_KEYS.PLAYER_PROGRESS, initialProgress);
        console.log('Initialized default player progress');
      }
    } catch (e) {
      console.error('Error initializing defaults', e);
    }
  }

  static async migrateIfNeeded(): Promise<void> {
      // Placeholder for future migrations
      // e.g. check version key and update data structure
  }
}
