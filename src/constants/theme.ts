/**
 * Design tokens for CashTracker.
 *
 * Colors are a FLAT map of `token -> hex string` for both light and dark schemes so
 * that `useTheme()[token]` always resolves to a color. Non-color tokens (radii,
 * spacing, typography) are exported separately.
 *
 * Semantic status tokens (success / warning / caution / danger) back the 4-tier
 * weekly-spending indicator: green < 50%, yellow 50-80%, orange 80-<100%, red >= 100%.
 *
 * NativeWind can be layered on later without touching screens — styling stays isolated here.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    // Text
    text: '#0B0C0E',
    textSecondary: '#565A63',
    textTertiary: '#8A8F98',
    textInverse: '#FFFFFF',

    // Surfaces
    background: '#F6F7F9',
    card: '#FFFFFF',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#ECEDF1',
    border: '#E6E8EC',
    borderStrong: '#D3D6DC',

    // Brand / accent
    brand: '#3B6EF5',
    brandSubtle: '#E7EEFF',

    // Status (indicator + money direction)
    success: '#128A50',
    successSubtle: '#DFF3E6',
    warning: '#B07A00',
    warningSubtle: '#FBF0D0',
    caution: '#D9691A',
    cautionSubtle: '#FBE6D5',
    danger: '#D5342B',
    dangerSubtle: '#FBE0DE',
    positive: '#128A50',
    negative: '#D5342B',
  },
  dark: {
    // Text
    text: '#F4F5F7',
    textSecondary: '#A4A9B3',
    textTertiary: '#6E747E',
    textInverse: '#0B0C0E',

    // Surfaces
    background: '#0B0C0E',
    card: '#16181C',
    backgroundElement: '#16181C',
    backgroundSelected: '#23262C',
    border: '#23262C',
    borderStrong: '#31353C',

    // Brand / accent
    brand: '#5B87FF',
    brandSubtle: '#1A2540',

    // Status (indicator + money direction)
    success: '#35C77E',
    successSubtle: '#10301F',
    warning: '#E7B740',
    warningSubtle: '#322913',
    caution: '#F0894A',
    cautionSubtle: '#33210F',
    danger: '#F26257',
    dangerSubtle: '#35191A',
    positive: '#35C77E',
    negative: '#F26257',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

/** Base spacing scale (multiples of 4). */
export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

/** Corner radii for cards, chips, and pills. */
export const Radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  pill: 999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
