import { usePlayerStore } from '../store/playerStore';

export const SaveManager = {
  /**
   * Вызывать ОДИН РАЗ при старте приложения (в SplashScreen).
   * Устанавливает стартовые данные если это первый запуск.
   */
  async initializeDefaults(): Promise<void> {
    const state = usePlayerStore.getState();

    // Признак первого запуска: coins === 0 и нет пройденных уровней
    const isFirstRun =
      state.coins === 0 &&
      Object.keys(state.completedLevels).length === 0;

    if (isFirstRun) {
      state.addCoins(500);              // стартовые монеты
      // tutorialCompleted уже false по умолчанию
    }
  },

  /**
   * Вызывать в конце каждого уровня.
   */
  async saveLevelComplete(params: {
    levelId: number;
    stars: 1 | 2 | 3;
    timeSeconds: number;
    coinsEarned: number;
  }): Promise<void> {
    const store = usePlayerStore.getState();
    store.saveLevelResult({
      levelId: params.levelId,
      stars: params.stars,
      bestTimeSeconds: params.timeSeconds,
      coinsEarned: params.coinsEarned,
      completedAt: Date.now(),
    });
    store.updateStreak();
  },
};
