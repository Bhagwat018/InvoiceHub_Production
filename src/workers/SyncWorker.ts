import { Platform } from 'react-native';
import { mmkvStorage } from '../storage/MmkvStorage';
import { storage } from '../storage';

const LAST_SYNC_KEY = 'last_sync_timestamp';
const SYNC_INTERVAL = 15 * 60 * 1000; // 15 minutes
const SYNC_WORKER_KEY = 'sync_worker_active';

export interface SyncStatus {
  isActive: boolean;
  lastSync: string | null;
  isSyncing: boolean;
  error: string | null;
}

class SyncWorkerClass {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private isSyncing = false;
  private lastError: string | null = null;

  start(): void {
    if (this.intervalId) return;

    mmkvStorage.set(SYNC_WORKER_KEY, 'true');

    this.intervalId = setInterval(async () => {
      await this.run();
    }, SYNC_INTERVAL);

    this.run().catch(() => {});
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    mmkvStorage.set(SYNC_WORKER_KEY, 'false');
  }

  async run(): Promise<void> {
    if (this.isSyncing) return;

    const lastSync = mmkvStorage.getString(LAST_SYNC_KEY);
    if (lastSync) {
      const elapsed = Date.now() - parseInt(lastSync, 10);
      if (elapsed < SYNC_INTERVAL) return;
    }

    this.isSyncing = true;
    this.lastError = null;

    try {
      // Check network connectivity
      // In production: use @react-native-community/netinfo
      const isConnected = true;
      if (!isConnected) {
        this.lastError = 'No network connection';
        return;
      }

      // Perform sync operations
      await this.syncSettings();
      await this.syncActivityLogs();

      mmkvStorage.set(LAST_SYNC_KEY, Date.now().toString());
    } catch (error) {
      this.lastError = error instanceof Error ? error.message : 'Sync failed';
      console.error('[SyncWorker] Error:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  private async syncSettings(): Promise<void> {
    // In production: sync settings to cloud backend
    const settingsData = {
      theme: storage.theme.get(),
      language: storage.language.get(),
      currency: storage.currency.get(),
      dateFormat: storage.dateFormat.get(),
    };
    // await api.syncSettings(settingsData);
  }

  private async syncActivityLogs(): Promise<void> {
    // In production: sync activity logs to cloud backend
  }

  async forceSync(): Promise<boolean> {
    mmkvStorage.delete(LAST_SYNC_KEY);
    await this.run();
    return !this.lastError;
  }

  getStatus(): SyncStatus {
    return {
      isActive: this.intervalId !== null,
      lastSync: mmkvStorage.getString(LAST_SYNC_KEY) || null,
      isSyncing: this.isSyncing,
      error: this.lastError,
    };
  }

  async onAppForeground(): Promise<void> {
    const lastSync = mmkvStorage.getString(LAST_SYNC_KEY);
    if (!lastSync) return;

    const elapsed = Date.now() - parseInt(lastSync, 10);
    if (elapsed > SYNC_INTERVAL) {
      await this.run();
    }
  }

  async onConnectivityChange(isConnected: boolean): Promise<void> {
    if (isConnected && !this.isSyncing) {
      await this.run();
    }
  }

  isActive(): boolean {
    return this.intervalId !== null;
  }
}

export const SyncWorker = new SyncWorkerClass();
