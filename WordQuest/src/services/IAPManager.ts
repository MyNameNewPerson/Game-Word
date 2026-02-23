import {
  initConnection, getProducts, requestPurchase,
  finishTransaction, purchaseUpdatedListener, purchaseErrorListener,
  type Purchase,
} from 'react-native-iap';
import { usePlayerStore } from '../store/playerStore';

export const PRODUCT_IDS = {
  REMOVE_ADS:   'wordquest_remove_ads',    // не расходуемая покупка
  PIGGY_BANK:   'wordquest_piggy_bank',   // расходуемая — получить копилку
  COINS_500:    'wordquest_coins_500',
  COINS_1200:   'wordquest_coins_1200',
  COINS_3000:   'wordquest_coins_3000',
  COINS_8000:   'wordquest_coins_8000',
} as const;

type ProductId = typeof PRODUCT_IDS[keyof typeof PRODUCT_IDS];

// Сколько монет даёт каждая покупка
const COINS_MAP: Partial<Record<ProductId, number>> = {
  [PRODUCT_IDS.COINS_500]:  500,
  [PRODUCT_IDS.COINS_1200]: 1200,
  [PRODUCT_IDS.COINS_3000]: 3000,
  [PRODUCT_IDS.COINS_8000]: 8000,
};

class IAPManagerClass {
  private productPrices: Record<string, string> = {};
  private purchaseListener: (() => void) | null = null;
  private errorListener:    (() => void) | null = null;

  async init(): Promise<void> {
    try {
      await initConnection();

      // Подписка на успешные покупки
      this.purchaseListener = purchaseUpdatedListener(async (purchase: Purchase) => {
        await this.handlePurchase(purchase);
        // ВАЖНО: всегда завершать транзакцию
        await finishTransaction({ purchase, isConsumable: true });
      });

      // Подписка на ошибки
      this.errorListener = purchaseErrorListener((error) => {
        if (error.code !== 'E_USER_CANCELLED') {
          console.log('IAP error:', error.code, error.message);
        }
      });

      // Загрузить цены
      const products = await getProducts({ skus: Object.values(PRODUCT_IDS) });
      products.forEach(p => {
        this.productPrices[p.productId] = p.localizedPrice;
      });

    } catch (e) {
      console.log('IAP init error:', e);
    }
  }

  private async handlePurchase(purchase: Purchase): Promise<void> {
    const store = usePlayerStore.getState();
    const { productId } = purchase;

    if (productId === PRODUCT_IDS.REMOVE_ADS) {
      store.setNoAds(true);
    } else if (productId === PRODUCT_IDS.PIGGY_BANK) {
      // Выдать накопленные монеты и сбросить копилку
      const piggyAmount = store.piggyBank;
      store.addCoins(piggyAmount);
      store.resetPiggyBank();
    } else if (COINS_MAP[productId as ProductId]) {
      store.addCoins(COINS_MAP[productId as ProductId]!);
    }
  }

  async purchase(productId: ProductId): Promise<void> {
    try {
      await requestPurchase({ skus: [productId] });
    } catch (e: any) {
      if (e.code !== 'E_USER_CANCELLED') {
        console.log('Purchase error:', e);
      }
    }
  }

  getPrice(productId: ProductId): string {
    return this.productPrices[productId] ?? '—';
  }

  cleanup(): void {
    this.purchaseListener?.();
    this.errorListener?.();
  }
}

export const IAPManager = new IAPManagerClass();
