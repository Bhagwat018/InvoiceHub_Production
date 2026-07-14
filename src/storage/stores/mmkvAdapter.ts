import { mmkvStorage } from '../MmkvStorage';
import type { StorageKey } from '../keys';

export function createMmkvStorage(key: StorageKey) {
  return {
    getItem: (name: string): string | null => {
      const value = mmkvStorage.getString(`${key}:${name}` as StorageKey);
      return value ?? null;
    },
    setItem: (name: string, value: string): void => {
      mmkvStorage.setString(`${key}:${name}` as StorageKey, value);
    },
    removeItem: (name: string): void => {
      mmkvStorage.remove(`${key}:${name}` as StorageKey);
    },
  };
}
