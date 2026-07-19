/**
 * The active colour palette, honouring the user's theme preference.
 * See use-resolved-scheme for how 'system' is resolved.
 */

import { Colors } from '@/constants/theme';
import { useResolvedScheme } from '@/hooks/use-resolved-scheme';

export function useTheme() {
  return Colors[useResolvedScheme()];
}
