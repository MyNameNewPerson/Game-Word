function getMoscowDateString(): string {
  const now = new Date();
  // UTC+3 = добавить 3 часа
  const moscowTime = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  return moscowTime.toISOString().split('T')[0]; // "2025-03-15"
}

function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return function() {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export const DailyPuzzleService = {
  getTodayDateKey(): string {
    return getMoscowDateString();
  },

  isCompletedToday(state: { dailyPuzzleLastDate: string | null }): boolean {
    return state.dailyPuzzleLastDate === this.getTodayDateKey();
  },

  /**
   * Возвращает id уровня для ежедневного паззла.
   * Каждый день — другой уровень из 1–100, случайный но детерминированный.
   */
  getDailyLevelId(): number {
    const dateKey = this.getTodayDateKey();
    const seed = hashString(dateKey);
    const rng = seededRandom(seed);
    // Уровни 20–80 — средняя сложность, подходит для дейли
    return Math.floor(rng() * 60) + 20;
  },

  /**
   * Считает секунды до следующего ежедневного паззла (полночь по Москве).
   */
  getSecondsUntilNextPuzzle(): number {
    const now = new Date();
    const moscowNow = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    const tomorrowMoscow = new Date(moscowNow);
    tomorrowMoscow.setUTCHours(21, 0, 0, 0); // 21 UTC = полночь Moscow UTC+3
    if (tomorrowMoscow <= moscowNow) {
      tomorrowMoscow.setUTCDate(tomorrowMoscow.getUTCDate() + 1);
    }
    return Math.floor((tomorrowMoscow.getTime() - now.getTime()) / 1000);
  },
};
