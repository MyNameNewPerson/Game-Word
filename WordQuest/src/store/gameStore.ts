import { create } from 'zustand';
import { GameStore, LevelData, GameSessionState } from '../types';

const EMPTY_SESSION: GameSessionState = {
  foundWords: [],
  foundBonusWords: [],
  revealedCells: [],
  hintsUsed: 0,
  startTime: Date.now(),
};

export const useGameStore = create<GameStore>((set) => ({
  currentLevel: null,
  session: EMPTY_SESSION,

  setLevel: (level: LevelData) => set({
    currentLevel: level,
    session: { ...EMPTY_SESSION, startTime: Date.now() },
  }),

  resetSession: () => set({
    session: { ...EMPTY_SESSION, startTime: Date.now() },
  }),

  addFoundWord: (word) => set(state => ({
    session: {
      ...state.session,
      foundWords: [...state.session.foundWords, word],
    },
  })),

  addFoundBonusWord: (word) => set(state => ({
    session: {
      ...state.session,
      foundBonusWords: [...state.session.foundBonusWords, word],
    },
  })),

  addRevealedCell: (cell) => set(state => ({
    session: {
      ...state.session,
      revealedCells: [...state.session.revealedCells, cell],
    },
  })),

  incrementHints: () => set(state => ({
    session: {
      ...state.session,
      hintsUsed: state.session.hintsUsed + 1,
    },
  })),
}));
