import { LevelData, GameSessionState, WordCheckResult } from '../types';

// Словарь загружается один раз при старте
let DICTIONARY_SET: Set<string> = new Set();

export function loadDictionary(words: string[]): void {
  DICTIONARY_SET = new Set(words.map(w => w.toUpperCase()));
}

/**
 * Проверяет — можно ли составить слово из доступных букв.
 * Учитывает повторения: ['К','О','К'] позволяет слово "КОК" но не "ООО".
 */
export function canFormFromLetters(word: string, available: string[]): boolean {
  const pool = [...available];
  for (const char of word.toUpperCase()) {
    const idx = pool.findIndex(l => l === char);
    if (idx === -1) return false;
    pool.splice(idx, 1);
  }
  return true;
}

/**
 * Главная функция проверки слова.
 * Порядок проверок ВАЖЕН — не менять.
 */
export function checkWord(
  word: string,
  levelData: LevelData,
  session: GameSessionState,
): WordCheckResult {
  const w = word.toUpperCase().trim();

  // 1. Составимо из доступных букв?
  if (!canFormFromLetters(w, levelData.letters)) {
    return { type: 'incorrect', word: w };
  }

  // 2. Минимальная длина
  if (w.length < 3) {
    return { type: 'too_short', word: w };
  }

  // 3. Уже найдено?
  if (session.foundWords.includes(w) || session.foundBonusWords.includes(w)) {
    return { type: 'already_found', word: w };
  }

  // 4. Основное слово уровня
  if (levelData.words.includes(w)) {
    return { type: 'correct', word: w };
  }

  // 5. Бонусное слово (есть в общем словаре)
  if (DICTIONARY_SET.has(w)) {
    return { type: 'bonus', word: w };
  }

  return { type: 'incorrect', word: w };
}
