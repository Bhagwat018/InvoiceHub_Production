import { useCallback, useEffect, useState } from 'react';
import { database, initializeDatabase, getDatabaseSize } from '../database';

export function useDatabase() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const prepare = async () => {
      try {
        await database.adapter.unsafeReset ? undefined : undefined;
        setIsReady(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Database initialization failed');
      }
    };
    prepare();
  }, []);

  const resetDatabase = useCallback(async () => {
    try {
      setError(null);
      await initializeDatabase();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset database');
      throw err;
    }
  }, []);

  const getSize = useCallback(async (): Promise<number> => {
    return getDatabaseSize();
  }, []);

  const write = useCallback(
    async <T>(work: () => Promise<T>): Promise<T> => {
      return database.write(work);
    },
    [],
  );

  return {
    database,
    isReady,
    error,
    resetDatabase,
    getSize,
    write,
  };
}
