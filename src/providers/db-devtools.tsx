/**
 * Exposes the SQLite database to the Expo dev tools so its tables can be
 * browsed and queried from a browser while the dev server is running.
 *
 * Development only — rendered behind an `__DEV__` check, and the plugin is a
 * devtools-only module that does nothing without a dev server attached.
 *
 * To open it: with `npm start` running, press `shift + m` in the terminal and
 * choose the SQLite/Drizzle Studio plugin.
 */

import { useEffect, useState } from 'react';
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin';

import { getDb, type Database } from '@/db';

export function DbDevTools() {
  const [db, setDb] = useState<Database | null>(null);

  useEffect(() => {
    let cancelled = false;
    getDb()
      .then((instance) => {
        if (!cancelled) setDb(instance);
      })
      .catch((err) => console.warn('Database devtools unavailable', err));
    return () => {
      cancelled = true;
    };
  }, []);

  useDrizzleStudio(db);

  return null;
}
