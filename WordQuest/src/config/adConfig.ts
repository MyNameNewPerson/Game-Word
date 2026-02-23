import { TestIds } from 'react-native-google-mobile-ads';

// ⚠️ IS_PRODUCTION = false в разработке.
// Перед публикацией: IS_PRODUCTION = true + вставить реальные ID из AdMob.
const IS_PRODUCTION = false;

export const AD_IDS = {
  INTERSTITIAL: IS_PRODUCTION
    ? 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX'   // ← вставить перед релизом
    : TestIds.INTERSTITIAL,
  REWARDED: IS_PRODUCTION
    ? 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX'   // ← вставить перед релизом
    : TestIds.REWARDED,
};
