/**
 * UI-only state (Zustand).
 *
 * Server/derived state lives in TanStack Query + SQLite. This store holds
 * interface state such as the theme preference, which is mirrored to the
 * settings table so it survives a restart.
 */

import { create } from 'zustand';

import { updateTheme } from '@/repositories/settings-repository';
import type { ThemeMode } from '@/schemas/settings';

interface UiState {
  themeMode: ThemeMode;
  /** Applies a preference without writing to the database (used when loading). */
  hydrateThemeMode: (mode: ThemeMode) => void;
  /** Applies a preference and persists it. */
  setThemeMode: (mode: ThemeMode) => void;
}

export const useUiStore = create<UiState>((set) => ({
  themeMode: 'system',
  hydrateThemeMode: (themeMode) => set({ themeMode }),
  setThemeMode: (themeMode) => {
    set({ themeMode });
    // Fire and forget: the UI already reflects the change, and a failed write
    // should not block the interaction.
    updateTheme(themeMode).catch((err) => console.warn('Could not save theme', err));
  },
}));
