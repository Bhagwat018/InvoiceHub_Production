import { MMKV } from 'react-native-mmkv';
import { StorageKeys, StorageKey } from './keys';

export const ENCRYPTION_KEY = 'invoicehub_secure_key_2024';

class MmkvStorage {
  private storage: MMKV;

  constructor() {
    this.storage = new MMKV({
      id: 'invoicehub-storage',
      encryptionKey: ENCRYPTION_KEY,
    });
  }

  getString(key: StorageKey): string | undefined {
    return this.storage.getString(key);
  }

  setString(key: StorageKey, value: string): void {
    this.storage.set(key, value);
  }

  getNumber(key: StorageKey): number | undefined {
    return this.storage.getNumber(key);
  }

  setNumber(key: StorageKey, value: number): void {
    this.storage.set(key, value);
  }

  getBoolean(key: StorageKey): boolean | undefined {
    return this.storage.getBoolean(key);
  }

  setBoolean(key: StorageKey, value: boolean): void {
    this.storage.set(key, value);
  }

  getObject<T>(key: StorageKey): T | undefined {
    const raw = this.storage.getString(key);
    if (!raw) return undefined;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return undefined;
    }
  }

  setObject<T>(key: StorageKey, value: T): void {
    this.storage.set(key, JSON.stringify(value));
  }

  remove(key: StorageKey): void {
    this.storage.delete(key);
  }

  clear(): void {
    this.storage.clearAll();
  }

  contains(key: StorageKey): boolean {
    return this.storage.contains(key);
  }

  getAllKeys(): string[] {
    return this.storage.getAllKeys();
  }

  clearExcept(excludeKeys: StorageKey[]): void {
    const allKeys = this.storage.getAllKeys();
    for (const key of allKeys) {
      if (!excludeKeys.includes(key as StorageKey)) {
        this.storage.delete(key);
      }
    }
  }
}

export const mmkvStorage = new MmkvStorage();
