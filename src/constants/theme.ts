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

    // Surfaces — clean white cards lifted by a soft shadow, over a barely
    // tinted canvas. `cardBorder` matches the card fill so cards stay
    // borderless; `border` is still used for dividers and input outlines.
    background: '#F7F8FA',
    card: '#FFFFFF',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#ECEEF2',
    border: '#E6E8EC',
    borderStrong: '#D3D6DC',
    cardBorder: '#FFFFFF',

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

    // Surfaces — same idea inverted: near-black canvas, cards lifted a step.
    background: '#0B0C0E',
    card: '#1A1D22',
    backgroundElement: '#1A1D22',
    backgroundSelected: '#272B32',
    border: '#272B32',
    borderStrong: '#363B43',
    cardBorder: '#1A1D22',

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

/**
 * Elevation.
 *
 * Cards get a gentle lift off the canvas; the Safe To Spend hero sits higher so
 * it stays the focal point. On Android the shadow comes entirely from
 * `elevation` — the shadow* properties only apply on iOS.
 */
export const Shadow = {
  card: {
    shadowColor: '#0B0C0E',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  raised: {
    shadowColor: '#0B0C0E',
    shadowOpacity: 0.14,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
} as const;

/** Distinct colours for categories, so charts and chips are not all one hue. */
export const CategoryPalette = [
  '#3B6EF5',
  '#12A594',
  '#D9691A',
  '#8B5CF6',
  '#E5484D',
  '#0EA5E9',
  '#B07A00',
  '#EC4899',
] as const;

export function categoryColorAt(index: number): string {
  return CategoryPalette[index % CategoryPalette.length];
}

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
