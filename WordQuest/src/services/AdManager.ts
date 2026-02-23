import mobileAds, {
  InterstitialAd, RewardedAd,
  AdEventType, RewardedAdEventType,
} from 'react-native-google-mobile-ads';
import { AD_IDS } from '../config/adConfig';

class AdManagerClass {
  private interstitial: InterstitialAd | null = null;
  private rewarded: RewardedAd | null = null;
  private isInterstitialReady = false;
  private isRewardedReady = false;
  // На каком уровне последний раз показали интерстишиал
  private lastShownLevel = 0;

  async initialize(): Promise<void> {
    try {
      await mobileAds().initialize();
      this.preloadInterstitial();
      this.preloadRewarded();
    } catch (e) {
      // AdMob недоступен — игра работает без рекламы
      console.log('AdMob: ошибка инициализации', e);
    }
  }

  private preloadInterstitial(): void {
    try {
      this.interstitial = InterstitialAd.createForAdRequest(AD_IDS.INTERSTITIAL);
      this.interstitial.addAdEventListener(AdEventType.LOADED, () => {
        this.isInterstitialReady = true;
      });
      this.interstitial.addAdEventListener(AdEventType.ERROR, () => {
        this.isInterstitialReady = false;
        // Попробовать снова через 30 секунд
        setTimeout(() => this.preloadInterstitial(), 30000);
      });
      this.interstitial.addAdEventListener(AdEventType.CLOSED, () => {
        this.isInterstitialReady = false;
        this.preloadInterstitial();  // Предзагружаем следующую
      });
      this.interstitial.load();
    } catch {}
  }

  private preloadRewarded(): void {
    try {
      this.rewarded = RewardedAd.createForAdRequest(AD_IDS.REWARDED);
      this.rewarded.addAdEventListener(AdEventType.LOADED, () => {
        this.isRewardedReady = true;
      });
      this.rewarded.addAdEventListener(AdEventType.ERROR, () => {
        this.isRewardedReady = false;
        setTimeout(() => this.preloadRewarded(), 30000);
      });
      this.rewarded.addAdEventListener(AdEventType.CLOSED, () => {
        this.isRewardedReady = false;
        this.preloadRewarded();
      });
      this.rewarded.load();
    } catch {}
  }

  /**
   * Показать interstitial если выполнены все условия.
   * Вызывать после LevelCompleteModal (с задержкой 500ms).
   */
  async tryShowInterstitial(currentLevelId: number, hasNoAds: boolean): Promise<void> {
    if (hasNoAds) return;                                    // куплено "без рекламы"
    if (currentLevelId <= 5) return;                        // первые 5 уровней — без рекламы
    if (currentLevelId - this.lastShownLevel < 3) return;  // не чаще раз в 3 уровня
    if (!this.isInterstitialReady) return;

    try {
      this.lastShownLevel = currentLevelId;
      await this.interstitial!.show();
    } catch {}
  }

  /**
   * Показать rewarded видео. Возвращает true если пользователь досмотрел.
   */
  showRewarded(): Promise<boolean> {
    if (!this.isRewardedReady) return Promise.resolve(false);

    return new Promise((resolve) => {
      let earned = false;
      try {
        const rewardListener = this.rewarded!.addAdEventListener(
          RewardedAdEventType.EARNED_REWARD, () => { earned = true; }
        );
        const closeListener = this.rewarded!.addAdEventListener(
          AdEventType.CLOSED, () => {
            rewardListener();  // unsubscribe
            closeListener();
            resolve(earned);
          }
        );
        const errorListener = this.rewarded!.addAdEventListener(
          AdEventType.ERROR, () => {
            errorListener();
            resolve(false);
          }
        );
        this.rewarded!.show();
      } catch {
        resolve(false);
      }
    });
  }

  isRewardedAvailable(): boolean {
    return this.isRewardedReady;
  }
}

export const AdManager = new AdManagerClass();
