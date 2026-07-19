/**
 * Resolves the colour scheme actually in use.
 *
 * The user's preference ('system' | 'light' | 'dark') lives in the UI store and
 * is persisted to the settings table. 'system' follows the device; the other two
 * override it.
 */

import { useColorScheme } from 'react-native';

import { useUiStore } from '@/store/ui-store';

export function useResolvedScheme(): 'light' | 'dark' {
  const mode = useUiStore((state) => state.themeMode);
  const system = useColorScheme();

  if (mode === 'light' || mode === 'dark') return mode;
  return system === 'dark' ? 'dark' : 'light';
}
