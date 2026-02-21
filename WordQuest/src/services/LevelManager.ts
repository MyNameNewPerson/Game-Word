import { LevelData } from '../types/LevelTypes';

// Attempt to load levels.json. If it doesn't exist (yet), use a fallback.
let levelsData: any = null;
try {
  levelsData = require('../../assets/levels.json');
} catch (e) {
  console.warn('levels.json not found, please run generator');
  levelsData = { levels: {}, meta: { totalLevels: 0 } };
}

export class LevelManager {
  private static levelsCache: Map<number, LevelData> = new Map();
  private static initialized = false;

  private static initialize() {
    if (this.initialized) return;

    if (levelsData && levelsData.levels) {
        Object.values(levelsData.levels).forEach((level: any) => {
            this.levelsCache.set(level.id, level);
        });
    }
    this.initialized = true;
  }

  static getLevel(id: number): LevelData | null {
    this.initialize();
    return this.levelsCache.get(id) || null;
  }

  static getTotalLevels(): number {
    this.initialize();
    return this.levelsCache.size;
  }

  static getLevelsForChapter(chapter: number): LevelData[] {
    this.initialize();
    return Array.from(this.levelsCache.values())
        .filter(l => l.chapter === chapter)
        .sort((a, b) => a.id - b.id);
  }

  static getChapterForLevel(id: number): number {
    const level = this.getLevel(id);
    return level ? level.chapter : 1;
  }

  static isLevelUnlocked(id: number, completedLevels: number[]): boolean {
    if (id === 1) return true;
    return completedLevels.includes(id - 1);
  }

  static preload() {
      this.initialize();
  }
}
