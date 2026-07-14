import { Platform } from 'react-native';

const ADMOB_APP_ID = Platform.OS === 'ios' ? 'ca-app-pub-xxxxx~xxxx' : 'ca-app-pub-xxxxx~xxxx';
const BANNER_AD_UNIT_ID = Platform.OS === 'ios' ? 'ca-app-pub-xxxxx/yyyy' : 'ca-app-pub-xxxxx/yyyy';
const INTERSTITIAL_AD_UNIT_ID = Platform.OS === 'ios' ? 'ca-app-pub-xxxxx/yyyy' : 'ca-app-pub-xxxxx/yyyy';
const REWARDED_AD_UNIT_ID = Platform.OS === 'ios' ? 'ca-app-pub-xxxxx/yyyy' : 'ca-app-pub-xxxxx/yyyy';

export type AdType = 'banner' | 'interstitial' | 'rewarded';

export interface AdConfig {
  bannerEnabled: boolean;
  interstitialEnabled: boolean;
  rewardedEnabled: boolean;
  testMode: boolean;
}

class AdServiceClass {
  private config: AdConfig = {
    bannerEnabled: true,
    interstitialEnabled: true,
    rewardedEnabled: true,
    testMode: __DEV__,
  };

  private interstitialLoaded = false;
  private rewardedLoaded = false;
  private adViewCount = 0;
  private readonly INTERSTITIAL_EVERY_N_VIEWS = 3;

  async initialize(): Promise<void> {
    try {
      // In production: use react-native-google-mobile-ads
      // import { mobileAds } from 'react-native-google-mobile-ads';
      // await mobileAds().initialize();
      console.log('[AdService] Initialized');
    } catch (error) {
      console.error('[AdService] Initialization failed:', error);
    }
  }

  getBannerAdUnitId(): string {
    return this.config.testMode ? 'ca-app-pub-3940256099942544/6300978111' : BANNER_AD_UNIT_ID;
  }

  getInterstitialAdUnitId(): string {
    return this.config.testMode ? 'ca-app-pub-3940256099942544/1033173712' : INTERSTITIAL_AD_UNIT_ID;
  }

  getRewardedAdUnitId(): string {
    return this.config.testMode ? 'ca-app-pub-3940256099942544/5224354917' : REWARDED_AD_UNIT_ID;
  }

  updateConfig(updates: Partial<AdConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  isBannerEnabled(): boolean {
    return this.config.bannerEnabled;
  }

  shouldShowInterstitial(): boolean {
    if (!this.config.interstitialEnabled) return false;
    this.adViewCount++;
    return this.adViewCount % this.INTERSTITIAL_EVERY_N_VIEWS === 0;
  }

  async loadInterstitial(): Promise<void> {
    try {
      // In production: preload interstitial ad
      this.interstitialLoaded = true;
    } catch (error) {
      console.error('[AdService] Failed to load interstitial:', error);
    }
  }

  async showInterstitial(): Promise<boolean> {
    if (!this.interstitialLoaded) return false;
    try {
      // In production: show interstitial ad
      this.interstitialLoaded = false;
      return true;
    } catch (error) {
      console.error('[AdService] Failed to show interstitial:', error);
      return false;
    }
  }

  async loadRewarded(): Promise<void> {
    try {
      // In production: preload rewarded ad
      this.rewardedLoaded = true;
    } catch (error) {
      console.error('[AdService] Failed to load rewarded:', error);
    }
  }

  async showRewarded(): Promise<{ earned: boolean }> {
    if (!this.rewardedLoaded) return { earned: false };
    try {
      // In production: show rewarded ad
      this.rewardedLoaded = false;
      return { earned: true };
    } catch (error) {
      console.error('[AdService] Failed to show rewarded:', error);
      return { earned: false };
    }
  }

  async hideBanner(): Promise<void> {
    // In production: hide banner ad
  }

  resetViewCount(): void {
    this.adViewCount = 0;
  }

  onAppStateChanged(state: 'active' | 'background'): void {
    if (state === 'active') {
      this.loadInterstitial();
    }
  }
}

export const AdService = new AdServiceClass();
