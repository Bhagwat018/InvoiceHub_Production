import { Platform } from 'react-native';
import { storage } from '../storage';
import type { BackupMetadata } from '../types';

const BACKUP_FOLDER = 'InvoiceHub_Backups';
const DB_NAME = 'invoicehub.db';

export interface BackupProgress {
  stage: 'preparing' | 'uploading' | 'complete' | 'error';
  progress: number;
  message: string;
}

export interface BackupFile {
  id: string;
  name: string;
  size: number;
  modifiedTime: string;
  downloadUrl?: string;
}

class BackupServiceClass {
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    try {
      // Initialize Google Drive API client
      // In production, use @react-native-google-signin/google-signin
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize backup service:', error);
      throw error;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      // Check if user is signed in to Google
      return false;
    } catch {
      return false;
    }
  }

  async signIn(): Promise<boolean> {
    try {
      // Sign in with Google
      // In production, use GoogleSignin.signIn()
      return true;
    } catch (error) {
      console.error('Google sign-in failed:', error);
      return false;
    }
  }

  async signOut(): Promise<void> {
    try {
      // Sign out from Google
    } catch (error) {
      console.error('Google sign-out failed:', error);
    }
  }

  async createBackupFolder(): Promise<string> {
    // Create or find the InvoiceHub_Backups folder in Google Drive
    // Returns folder ID
    return 'backup-folder-id';
  }

  async exportDatabase(): Promise<string> {
    const RNFS = require('react-native-fs');
    const directory = Platform.OS === 'ios' ? RNFS.DocumentDirectoryPath : RNFS.ExternalDirectoryPath;
    const dbPath = `${directory}/${DB_NAME}`;
    const exportPath = `${directory}/backup_${Date.now()}.db`;

    try {
      await RNFS.copyFile(dbPath, exportPath);
      return exportPath;
    } catch (error) {
      // Fallback: export MMKV data as JSON
      const data = storage.export();
      const jsonPath = `${directory}/backup_${Date.now()}.json`;
      await RNFS.writeFile(jsonPath, JSON.stringify(data, null, 2), 'utf8');
      return jsonPath;
    }
  }

  async uploadBackup(
    filePath: string,
    onProgress?: (progress: BackupProgress) => void,
  ): Promise<BackupFile> {
    onProgress?.({ stage: 'preparing', progress: 0, message: 'Preparing backup...' });

    const folderId = await this.createBackupFolder();
    onProgress?.({ stage: 'uploading', progress: 20, message: 'Uploading to Google Drive...' });

    // In production: use Google Drive API to upload file
    const fileName = filePath.split('/').pop() || `backup_${Date.now()}.json`;
    const fileMetadata: BackupFile = {
      id: `file_${Date.now()}`,
      name: fileName,
      size: 0,
      modifiedTime: new Date().toISOString(),
    };

    onProgress?.({ stage: 'uploading', progress: 80, message: 'Finalizing...' });

    // Save backup metadata locally
    this.saveBackupMetadata({
      id: fileMetadata.id,
      filename: fileMetadata.name,
      filepath: filePath,
      size: fileMetadata.size,
      version: '1.0.0',
      isAutomatic: false,
      description: null,
      createdAt: new Date().toISOString(),
    });

    onProgress?.({ stage: 'complete', progress: 100, message: 'Backup complete!' });
    return fileMetadata;
  }

  async downloadBackup(fileId: string, onProgress?: (progress: BackupProgress) => void): Promise<string> {
    onProgress?.({ stage: 'preparing', progress: 0, message: 'Preparing download...' });
    onProgress?.({ stage: 'uploading', progress: 50, message: 'Downloading from Google Drive...' });

    const RNFS = require('react-native-fs');
    const directory = Platform.OS === 'ios' ? RNFS.DocumentDirectoryPath : RNFS.ExternalDirectoryPath;
    const downloadPath = `${directory}/restore_${Date.now()}.json`;

    // In production: use Google Drive API to download file
    onProgress?.({ stage: 'complete', progress: 100, message: 'Download complete!' });
    return downloadPath;
  }

  async restoreFromFile(filePath: string): Promise<boolean> {
    try {
      const RNFS = require('react-native-fs');
      const content = await RNFS.readFile(filePath, 'utf8');
      const data = JSON.parse(content);

      // Restore MMKV data
      if (typeof data === 'object') {
        Object.entries(data).forEach(([key, value]) => {
          if (typeof value === 'string') {
            storage.theme.set(value as any);
          }
        });
      }
      return true;
    } catch (error) {
      console.error('Restore failed:', error);
      return false;
    }
  }

  async listBackups(): Promise<BackupFile[]> {
    try {
      // In production: query Google Drive API for backup files
      return [];
    } catch (error) {
      console.error('Failed to list backups:', error);
      return [];
    }
  }

  async deleteBackup(fileId: string): Promise<boolean> {
    try {
      // In production: delete file from Google Drive
      return true;
    } catch (error) {
      console.error('Failed to delete backup:', error);
      return false;
    }
  }

  async getLastBackupTime(): Promise<string | null> {
    const metadata = this.getBackupMetadata();
    if (metadata.length === 0) return null;
    return metadata.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0].createdAt;
  }

  private saveBackupMetadata(metadata: BackupMetadata): void {
    const existing = this.getBackupMetadata();
    existing.push(metadata);
    // Store in MMKV
    try {
      const { mmkvStorage } = require('../storage/MmkvStorage');
      mmkvStorage.setObject('backup_metadata', existing);
    } catch {}
  }

  private getBackupMetadata(): BackupMetadata[] {
    try {
      const { mmkvStorage } = require('../storage/MmkvStorage');
      return mmkvStorage.getObject('backup_metadata') || [];
    } catch {
      return [];
    }
  }
}

export const BackupService = new BackupServiceClass();
