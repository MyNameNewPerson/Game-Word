import { create } from 'zustand';
import { SaveManager } from '../services/SaveManager';
import { STORAGE_KEYS } from '../constants/storageKeys';

interface AdState {
  isAdLoaded: boolean;
  lastRewardedShownAt: number;
  lastInterstitialShownAt: number;

  setAdLoaded: (loaded: boolean) => void;
  recordAdShown: (type: 'interstitial' | 'rewarded') => void;
  loadAdState: () => Promise<void>;
}

export const useAdStore = create<AdState>((set) => ({
  isAdLoaded: false,
  lastRewardedShownAt: 0,
  lastInterstitialShownAt: 0,

  setAdLoaded: (loaded) => set({ isAdLoaded: loaded }),

  recordAdShown: (type) => {
    set((state) => {
      const now = Date.now();
      const changes = type === 'interstitial'
        ? { lastInterstitialShownAt: now }
        : { lastRewardedShownAt: now };

      const newState = { ...state, ...changes };
      // Omit isAdLoaded from persistence as it is runtime state
      const { isAdLoaded, ...persistedState } = newState;

      SaveManager.set(STORAGE_KEYS.AD_STATE, persistedState);
      return changes;
    });
  },

  loadAdState: async () => {
    const state = await SaveManager.get<{ lastRewardedShownAt: number, lastInterstitialShownAt: number }>(STORAGE_KEYS.AD_STATE);
    if (state) {
      set(state);
    }
  }
}));
