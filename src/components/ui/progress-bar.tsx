/** A simple horizontal progress bar. Fill is capped at 100%. */

import { StyleSheet, View } from 'react-native';

import { Radii } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function ProgressBar({ percent, color }: { percent: number; color: string }) {
  const theme = useTheme();
  const width = Math.min(Math.max(percent, 0), 100);

  return (
    <View style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
      <View style={[styles.fill, { width: `${width}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 10,
    borderRadius: Radii.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radii.pill,
  },
});
