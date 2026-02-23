import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlayerStore, PlayerProgress } from '../types';

const INITIAL_PLAYER_PROGRESS: PlayerProgress = {
  playerLevel: 1,
  xp: 0,
  xpForNextLevel: 100,
  title: 'Новичок',
};

const PLAYER_TITLES = [
  { minLevel: 1,   title: 'Новичок'        },
  { minLevel: 11,  title: 'Ученик'         },
  { minLevel: 21,  title: 'Знаток'         },
  { minLevel: 31,  title: 'Архивариус'     },
  { minLevel: 51,  title: 'Мастер слова'   },
  { minLevel: 76,  title: 'Легенда'        },
  { minLevel: 101, title: 'Хранитель тайн' },
];

function getTitleForLevel(level: number): string {
  return [...PLAYER_TITLES].reverse().find(t => level >= t.minLevel)?.title ?? 'Новичок';
}

function xpForLevel(level: number): number {
  return Math.floor(100 * level * 1.2);
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      // Начальные значения
      coins: 0,                          // 0 = признак первого запуска
      piggyBank: 0,
      completedLevels: {},
      playerProgress: INITIAL_PLAYER_PROGRESS,
      hasNoAds: false,
      tutorialCompleted: false,
      streakDays: 0,
      lastPlayedDate: null,
      dailyPuzzleLastDate: null,
      dailyPuzzleCompleted: false,

      // Монеты
      addCoins: (n) => set(state => ({ coins: state.coins + n })),
      spendCoins: (n) => set(state => ({ coins: Math.max(0, state.coins - n) })),

      // Копилка
      incrementPiggyBank: (n) => set(state => ({
        piggyBank: Math.min(1000, state.piggyBank + n),
      })),
      resetPiggyBank: () => set({ piggyBank: 0 }),

      // Флаги
      setNoAds: (v) => set({ hasNoAds: v }),
      setTutorialCompleted: () => set({ tutorialCompleted: true }),

      // Стрик — вызывать после каждого пройденного уровня
      updateStreak: () => {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const { lastPlayedDate, streakDays } = get();

        if (lastPlayedDate === today) return; // уже играли сегодня

        set({
          streakDays: lastPlayedDate === yesterday ? streakDays + 1 : 1,
          lastPlayedDate: today,
        });
      },

      // Сохранение результата уровня
      saveLevelResult: (result) => set(state => {
        const existing = state.completedLevels[result.levelId];
        // Сохраняем только если новый результат лучше (больше звёзд)
        if (existing && existing.stars >= result.stars) return state;
        return {
          completedLevels: {
            ...state.completedLevels,
            [result.levelId]: result,
          },
        };
      }),

      // XP с автоматическим повышением уровня
      addXP: (amount) => set(state => {
        let { xp, playerLevel } = state.playerProgress;
        xp += amount;
        while (xp >= xpForLevel(playerLevel)) {
          xp -= xpForLevel(playerLevel);
          playerLevel += 1;
        }
        return {
          playerProgress: {
            playerLevel,
            xp,
            xpForNextLevel: xpForLevel(playerLevel),
            title: getTitleForLevel(playerLevel),
          },
        };
      }),

      // Дейли
      setDailyPuzzleCompleted: (date) => set({
        dailyPuzzleLastDate: date,
        dailyPuzzleCompleted: true,
      }),
    }),
    {
      name: 'player-storage-v1',          // v1 — при изменении схемы менять версию
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
