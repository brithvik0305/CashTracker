/** A horizontal progress bar whose fill animates to its new value. Capped at 100%. */

import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { Radii } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function ProgressBar({ percent, color }: { percent: number; color: string }) {
  const theme = useTheme();
  const target = Math.min(Math.max(percent, 0), 100);
  const progress = useRef(new Animated.Value(target)).current;

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: target,
      duration: 420,
      // Width percentages cannot use the native driver.
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [progress, target]);

  const width = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
      <Animated.View style={[styles.fill, { width, backgroundColor: color }]} />
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
