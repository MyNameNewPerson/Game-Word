import { LevelData } from '../types';
import levelsJson from '../../assets/levels.json';
import { loadDictionary } from './WordChecker';

class LevelManagerClass {
  private levels: Map<number, LevelData> = new Map();
  private dictionary: string[] = [];
  private loaded = false;

  async preload(): Promise<void> {
    if (this.loaded) return;

    const data = levelsJson as { levels: LevelData[]; dictionary: string[] };

    // Загружаем уровни в Map для O(1) доступа
    data.levels.forEach(lvl => this.levels.set(lvl.id, lvl));
    this.dictionary = data.dictionary;

    // Загружаем словарь в WordChecker
    loadDictionary(this.dictionary);

    this.loaded = true;
  }

  getLevel(id: number): LevelData | undefined {
    return this.levels.get(id);
  }

  getNextLevel(currentId: number): LevelData | undefined {
    return this.levels.get(currentId + 1);
  }

  getLevelsForChapter(chapterId: number): LevelData[] {
    return Array.from(this.levels.values())
      .filter(lvl => lvl.chapter === chapterId)
      .sort((a, b) => a.id - b.id);
  }

  isLastLevel(levelId: number): boolean {
    return !this.levels.has(levelId + 1);
  }
}

export const LevelManager = new LevelManagerClass();
