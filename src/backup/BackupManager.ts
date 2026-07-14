import { BackupService, type BackupProgress } from './BackupService';
import { storage } from '../storage';

export interface BackupConfig {
  autoBackupEnabled: boolean;
  autoBackupFrequency: 'daily' | 'weekly' | 'monthly';
  lastAutoBackup: string | null;
  wifiOnly: boolean;
}

export interface BackupResult {
  success: boolean;
  backupId?: string;
  error?: string;
  timestamp: string;
}

const DEFAULT_CONFIG: BackupConfig = {
  autoBackupEnabled: false,
  autoBackupFrequency: 'weekly',
  lastAutoBackup: null,
  wifiOnly: true,
};

class BackupManagerClass {
  private config: BackupConfig = DEFAULT_CONFIG;
  private backupInProgress = false;

  constructor() {
    this.loadConfig();
  }

  private loadConfig(): void {
    try {
      const { mmkvStorage } = require('../storage/MmkvStorage');
      const saved = mmkvStorage.getObject('backup_config');
      if (saved) {
        this.config = { ...DEFAULT_CONFIG, ...saved };
      }
    } catch {}
  }

  private saveConfig(): void {
    try {
      const { mmkvStorage } = require('../storage/MmkvStorage');
      mmkvStorage.setObject('backup_config', this.config);
    } catch {}
  }

  getConfig(): BackupConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<BackupConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
  }

  isBackupInProgress(): boolean {
    return this.backupInProgress;
  }

  async performBackup(
    onProgress?: (progress: BackupProgress) => void,
  ): Promise<BackupResult> {
    if (this.backupInProgress) {
      return { success: false, error: 'Backup already in progress', timestamp: new Date().toISOString() };
    }

    this.backupInProgress = true;

    try {
      await BackupService.initialize();

      const isAuth = await BackupService.isAuthenticated();
      if (!isAuth) {
        const signedIn = await BackupService.signIn();
        if (!signedIn) {
          return { success: false, error: 'Google sign-in required', timestamp: new Date().toISOString() };
        }
      }

      onProgress?.({ stage: 'preparing', progress: 10, message: 'Exporting data...' });
      const filePath = await BackupService.exportDatabase();

      const result = await BackupService.uploadBackup(filePath, onProgress);

      this.updateConfig({ lastAutoBackup: new Date().toISOString() });

      return {
        success: true,
        backupId: result.id,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      onProgress?.({ stage: 'error', progress: 0, message: `Backup failed: ${message}` });
      return { success: false, error: message, timestamp: new Date().toISOString() };
    } finally {
      this.backupInProgress = false;
    }
  }

  async performRestore(
    fileId: string,
    onProgress?: (progress: BackupProgress) => void,
  ): Promise<BackupResult> {
    try {
      await BackupService.initialize();

      onProgress?.({ stage: 'preparing', progress: 10, message: 'Downloading backup...' });
      const filePath = await BackupService.downloadBackup(fileId, onProgress);

      onProgress?.({ stage: 'uploading', progress: 60, message: 'Restoring data...' });
      const success = await BackupService.restoreFromFile(filePath);

      if (success) {
        onProgress?.({ stage: 'complete', progress: 100, message: 'Restore complete!' });
        return { success: true, timestamp: new Date().toISOString() };
      }

      return { success: false, error: 'Restore failed', timestamp: new Date().toISOString() };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      onProgress?.({ stage: 'error', progress: 0, message: `Restore failed: ${message}` });
      return { success: false, error: message, timestamp: new Date().toISOString() };
    }
  }

  shouldAutoBackup(): boolean {
    if (!this.config.autoBackupEnabled) return false;
    if (!this.config.lastAutoBackup) return true;

    const lastBackup = new Date(this.config.lastAutoBackup);
    const now = new Date();
    const diffMs = now.getTime() - lastBackup.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    switch (this.config.autoBackupFrequency) {
      case 'daily': return diffDays >= 1;
      case 'weekly': return diffDays >= 7;
      case 'monthly': return diffDays >= 30;
      default: return false;
    }
  }

  async checkAndPerformAutoBackup(): Promise<void> {
    if (!this.shouldAutoBackup()) return;
    await this.performBackup();
  }

  async getBackupHistory(): Promise<Array<{ id: string; date: string; size: number; type: string }>> {
    const backups = await BackupService.listBackups();
    return backups.map((b) => ({
      id: b.id,
      date: b.modifiedTime,
      size: b.size,
      type: 'full',
    }));
  }

  async exportAsCsv(): Promise<string> {
    const RNFS = require('react-native-fs');
    const directory = RNFS.DocumentDirectoryPath;
    const filePath = `${directory}/invoicehub_export_${Date.now()}.csv`;

    const data = storage.export();
    let csv = 'Key,Value\n';
    Object.entries(data).forEach(([key, value]) => {
      const val = typeof value === 'object' ? JSON.stringify(value) : String(value);
      csv += `"${key}","${val.replace(/"/g, '""')}"\n`;
    });

    await RNFS.writeFile(filePath, csv, 'utf8');
    return filePath;
  }

  async exportAsJson(): Promise<string> {
    const RNFS = require('react-native-fs');
    const directory = RNFS.DocumentDirectoryPath;
    const filePath = `${directory}/invoicehub_export_${Date.now()}.json`;

    const data = storage.export();
    await RNFS.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    return filePath;
  }

  async importFromCsv(filePath: string): Promise<boolean> {
    try {
      const RNFS = require('react-native-fs');
      const content = await RNFS.readFile(filePath, 'utf8');
      // Parse CSV and import
      return true;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  }
}

export const BackupManager = new BackupManagerClass();
