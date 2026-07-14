import { Platform } from 'react-native';

export type SubscriptionPeriod = 'monthly' | 'yearly' | 'lifetime';

export interface Product {
  id: string;
  period: SubscriptionPeriod;
  price: string;
  currency: string;
  title: string;
  description: string;
}

export interface PurchaseResult {
  success: boolean;
  productId?: string;
  receipt?: string;
  error?: string;
}

const PRODUCT_IDS: Record<SubscriptionPeriod, { ios: string; android: string }> = {
  monthly: {
    ios: 'com.invoicehub.premium.monthly',
    android: 'com.invoicehub.premium.monthly',
  },
  yearly: {
    ios: 'com.invoicehub.premium.yearly',
    android: 'com.invoicehub.premium.yearly',
  },
  lifetime: {
    ios: 'com.invoicehub.premium.lifetime',
    android: 'com.invoicehub.premium.lifetime',
  },
};

class IapServiceClass {
  private isInitialized = false;
  private isPremium = false;
  private products: Product[] = [];

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    try {
      // In production: use react-native-iap
      // import * as RNIap from 'react-native-iap';
      // await RNIap.initConnection();
      // await RNIap.refreshConnectionMetadata();
      this.isInitialized = true;
      console.log('[IapService] Initialized');
    } catch (error) {
      console.error('[IapService] Initialization failed:', error);
    }
  }

  async getProducts(): Promise<Product[]> {
    try {
      const productIds = Object.values(PRODUCT_IDS).map((ids) =>
        Platform.OS === 'ios' ? ids.ios : ids.android,
      );

      // In production:
      // const items = await RNIap.getProducts({ skus: productIds });
      // return items.map(item => ({ ... }));

      this.products = [
        {
          id: PRODUCT_IDS.monthly[Platform.OS === 'ios' ? 'ios' : 'android'],
          period: 'monthly',
          price: '₹199',
          currency: 'INR',
          title: 'Monthly Premium',
          description: 'Access all premium features monthly',
        },
        {
          id: PRODUCT_IDS.yearly[Platform.OS === 'ios' ? 'ios' : 'android'],
          period: 'yearly',
          price: '₹1,499',
          currency: 'INR',
          title: 'Yearly Premium',
          description: 'Access all premium features yearly (save 37%)',
        },
        {
          id: PRODUCT_IDS.lifetime[Platform.OS === 'ios' ? 'ios' : 'android'],
          period: 'lifetime',
          price: '₹4,999',
          currency: 'INR',
          title: 'Lifetime Premium',
          description: 'One-time payment, access forever',
        },
      ];

      return this.products;
    } catch (error) {
      console.error('[IapService] Failed to get products:', error);
      return [];
    }
  }

  async purchaseProduct(productId: string): Promise<PurchaseResult> {
    try {
      // In production:
      // const purchase = await RNIap.requestPurchase({ sku: productId });
      // const receipt = await RNIap.validateReceiptIos({ receipt: purchase.transactionReceipt });

      this.isPremium = true;
      this.savePremiumStatus(true);

      return {
        success: true,
        productId,
        receipt: 'mock-receipt',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Purchase failed';
      return { success: false, error: message };
    }
  }

  async restorePurchases(): Promise<PurchaseResult> {
    try {
      // In production:
      // const purchases = await RNIap.getAvailablePurchases();
      // Check for active subscriptions

      const isPremium = this.checkPremiumStatus();
      if (isPremium) {
        this.isPremium = true;
        return { success: true };
      }

      return { success: false, error: 'No active purchases found' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Restore failed';
      return { success: false, error: message };
    }
  }

  async checkTrialStatus(): Promise<{ inTrial: boolean; daysRemaining: number }> {
    // Check if user is in free trial period
    return { inTrial: false, daysRemaining: 0 };
  }

  isUserPremium(): boolean {
    return this.isPremium;
  }

  private savePremiumStatus(isPremium: boolean): void {
    try {
      const { mmkvStorage } = require('../storage/MmkvStorage');
      mmkvStorage.setBoolean('is_premium', isPremium);
    } catch {}
  }

  private checkPremiumStatus(): boolean {
    try {
      const { mmkvStorage } = require('../storage/MmkvStorage');
      return mmkvStorage.getBoolean('is_premium') ?? false;
    } catch {
      return false;
    }
  }

  async terminate(): Promise<void> {
    try {
      // In production: RNIap.endConnection();
      this.isInitialized = false;
    } catch {}
  }

  getProductId(period: SubscriptionPeriod): string {
    const platform = Platform.OS === 'ios' ? 'ios' : 'android';
    return PRODUCT_IDS[period][platform];
  }
}

export const IapService = new IapServiceClass();
