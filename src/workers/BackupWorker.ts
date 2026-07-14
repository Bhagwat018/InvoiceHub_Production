import { BackupManager } from '../backup/BackupManager';
import { BackupService } from '../backup/BackupService';
import { mmkvStorage } from '../storage/MmkvStorage';
import { NotificationService } from '../notifications/NotificationService';

const LAST_BACKUP_WORKER_KEY = 'last_backup_worker_run';
const BACKUP_WORKER_INTERVAL = 60 * 60 * 1000; // 1 hour

class BackupWorkerClass {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private isRunning = false;

  start(): void {
    if (this.intervalId) return;

    this.intervalId = setInterval(async () => {
      await this.run();
    }, BACKUP_WORKER_INTERVAL);

    // Run immediately if conditions are met
    this.run().catch(() => {});
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async run(): Promise<void> {
    if (this.isRunning) return;

    const lastRun = mmkvStorage.getString(LAST_BACKUP_WORKER_KEY);
    if (lastRun) {
      const elapsed = Date.now() - parseInt(lastRun, 10);
      if (elapsed < BACKUP_WORKER_INTERVAL) return;
    }

    this.isRunning = true;

    try {
      if (!BackupManager.shouldAutoBackup()) return;

      const config = BackupManager.getConfig();
      if (config.wifiOnly) {
        // Check network type - skip if not on WiFi
        // In production: use @react-native-community/netinfo
      }

      const result = await BackupManager.performBackup();

      mmkvStorage.set(LAST_BACKUP_WORKER_KEY, Date.now().toString());

      if (result.success) {
        await NotificationService.sendLocalNotification({
          id: `auto_backup_${Date.now()}`,
          title: 'Backup Complete',
          body: 'Your data has been backed up successfully.',
        });
      } else if (result.error) {
        console.error('[BackupWorker] Auto backup failed:', result.error);
      }
    } catch (error) {
      console.error('[BackupWorker] Error:', error);
    } finally {
      this.isRunning = false;
    }
  }

  async runImmediately(): Promise<void> {
    mmkvStorage.delete(LAST_BACKUP_WORKER_KEY);
    await this.run();
  }

  isActive(): boolean {
    return this.intervalId !== null;
  }
}

export const BackupWorker = new BackupWorkerClass();
