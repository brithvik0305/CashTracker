/**
 * DatabaseProvider — opens SQLite and runs migrations before the app renders.
 *
 * While migrations run, a calm themed loader is shown; on failure, a readable
 * error is surfaced instead of a blank screen. Children (and thus all repository
 * calls) only mount once the schema is guaranteed to be up to date.
 */

import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { initDatabase } from '@/db';
import { maybeAutoBackup } from '@/services/backup-service';
import { useTheme } from '@/hooks/use-theme';

type Status = { state: 'loading' } | { state: 'ready' } | { state: 'error'; message: string };

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const [status, setStatus] = useState<Status>({ state: 'loading' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await initDatabase();
        if (!cancelled) setStatus({ state: 'ready' });
        // Daily automatic backup, in the background. Never blocks startup, and a
        // failure here must not stop the app from opening.
        maybeAutoBackup().catch((err) =>
          console.warn('Automatic backup failed', err),
        );
      } catch (err) {
        if (!cancelled) {
          // Web is a preview-only target where SQLite may be unavailable. Degrade to a
          // usable UI there, but keep strict gating on device where the DB is required.
          if (Platform.OS === 'web') {
            console.warn('Database unavailable on web preview; continuing without it.', err);
            setStatus({ state: 'ready' });
          } else {
            setStatus({ state: 'error', message: err instanceof Error ? err.message : String(err) });
          }
        }
      } finally {
        SplashScreen.hideAsync().catch(() => {});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status.state === 'loading') {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.brand} />
      </View>
    );
  }

  if (status.state === 'error') {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ThemedText type="subtitle">Something went wrong</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.errorText}>
          {status.message}
        </ThemedText>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  errorText: {
    textAlign: 'center',
  },
});
