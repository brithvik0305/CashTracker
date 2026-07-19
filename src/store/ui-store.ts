/**
 * UI-only state (Zustand).
 *
 * Server/derived state lives in TanStack Query + SQLite. This store holds
 * ephemeral interface state such as the user's theme preference. It is
 * intentionally tiny; persistence to the settings table comes with the
 * Settings screen in a later milestone.
 */

import { create } from 'zustand';

import type { ThemeMode } from '@/schemas/settings';

interface UiState {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

export const useUiStore = create<UiState>((set) => ({
  themeMode: 'system',
  setThemeMode: (themeMode) => set({ themeMode }),
}));
