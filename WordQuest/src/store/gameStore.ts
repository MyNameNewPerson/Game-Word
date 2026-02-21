import { create } from 'zustand';
import { GameSessionState } from '../types/GameTypes';
import { LevelData } from '../types/LevelTypes';
import { SaveManager } from '../services/SaveManager';
import { STORAGE_KEYS } from '../constants/storageKeys';

interface GameState extends GameSessionState {
  currentLevelData: LevelData | null;
  hammerMode: boolean;

  startLevel: (levelData: LevelData) => void;
  addFoundWord: (word: string) => void;
  addFoundBonusWord: (word: string) => void;
  revealCell: (cellKey: string) => void;
  incrementHints: () => void;
  completeLevel: () => void;
  setHammerMode: (active: boolean) => void;
  resetSession: () => void;
  loadSession: () => Promise<void>;
}

const initialSession: GameSessionState = {
    levelId: 0,
    foundWords: [],
    foundBonusWords: [],
    revealedCells: [],
    hintsUsed: 0,
    startedAt: 0,
    isComplete: false,
};

export const useGameStore = create<GameState>((set, get) => ({
  ...initialSession,
  currentLevelData: null,
  hammerMode: false,

  startLevel: (levelData) => {
      const newSession: GameSessionState = {
          levelId: levelData.id,
          foundWords: [],
          foundBonusWords: [],
          revealedCells: [],
          hintsUsed: 0,
          startedAt: Date.now(),
          isComplete: false,
      };
      set({ ...newSession, currentLevelData: levelData, hammerMode: false });
      SaveManager.set(STORAGE_KEYS.GAME_SESSION, newSession);
  },

  addFoundWord: (word) => {
      set((state) => {
          const foundWords = [...state.foundWords, word];
          const changes = { foundWords };
          // Persist the updated state including new changes
          SaveManager.set(STORAGE_KEYS.GAME_SESSION, { ...state, ...changes });
          return changes;
      });
  },

  addFoundBonusWord: (word) => {
      set((state) => {
          const foundBonusWords = [...state.foundBonusWords, word];
          const changes = { foundBonusWords };
          SaveManager.set(STORAGE_KEYS.GAME_SESSION, { ...state, ...changes });
          return changes;
      });
  },

  revealCell: (cellKey) => {
      set((state) => {
          if (state.revealedCells.includes(cellKey)) return {};
          const revealedCells = [...state.revealedCells, cellKey];
          const changes = { revealedCells };
          SaveManager.set(STORAGE_KEYS.GAME_SESSION, { ...state, ...changes });
          return changes;
      });
  },

  incrementHints: () => {
      set((state) => {
          const hintsUsed = state.hintsUsed + 1;
          const changes = { hintsUsed };
          SaveManager.set(STORAGE_KEYS.GAME_SESSION, { ...state, ...changes });
          return changes;
      });
  },

  completeLevel: () => {
      set((state) => {
          const changes = { isComplete: true };
          SaveManager.set(STORAGE_KEYS.GAME_SESSION, { ...state, ...changes });
          return changes;
      });
  },

  setHammerMode: (active) => set({ hammerMode: active }),

  resetSession: () => {
      set({ ...initialSession, currentLevelData: null });
      SaveManager.remove(STORAGE_KEYS.GAME_SESSION);
  },

  loadSession: async () => {
      const session = await SaveManager.get<GameSessionState>(STORAGE_KEYS.GAME_SESSION);
      if (session) {
          set((state) => ({ ...state, ...session }));
      }
  }
}));
