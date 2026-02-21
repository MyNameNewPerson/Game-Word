import { LevelData } from '../types/LevelTypes';
import { GameSessionState, WordCheckResult } from '../types/GameTypes';

export class WordChecker {
  static checkWord(
    word: string,
    levelData: LevelData,
    sessionState: GameSessionState
  ): WordCheckResult {
    const normalizedWord = word.toUpperCase();

    // 1. Check length
    if (normalizedWord.length < 3) {
      return { type: 'too_short' };
    }

    // 2. Check if already found
    if (
      sessionState.foundWords.includes(normalizedWord) ||
      sessionState.foundBonusWords.includes(normalizedWord)
    ) {
      return { type: 'already_found' };
    }

    // 3. Check if it's a main word
    if (levelData.words.includes(normalizedWord)) {
        return { type: 'correct', isBonus: false };
    }

    // 4. Check if it's a bonus word
    if (levelData.bonusWords.includes(normalizedWord)) {
        return { type: 'correct', isBonus: true, coinsEarned: 2 };
    }

    // 5. Incorrect
    return { type: 'incorrect' };
  }

  static canFormWord(word: string, availableLetters: string[]): boolean {
    const letters = [...availableLetters];
    for (const char of word.toUpperCase()) {
      const index = letters.indexOf(char);
      if (index === -1) {
        return false;
      }
      letters.splice(index, 1);
    }
    return true;
  }
}
