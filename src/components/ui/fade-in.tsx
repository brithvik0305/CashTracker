/**
 * Fades and lifts its children into place on mount. Used to stagger dashboard
 * cards so the screen assembles calmly rather than appearing all at once.
 *
 * Runs on the native driver, so it costs nothing on the JS thread.
 */

import { useEffect, useRef } from 'react';
import { Animated, type ViewProps } from 'react-native';

interface FadeInProps extends ViewProps {
  /** Stagger delay in milliseconds. */
  delay?: number;
}

export function FadeIn({ delay = 0, style, children, ...rest }: FadeInProps) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 320,
      delay,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [progress, delay]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [8, 0],
              }),
            },
          ],
        },
      ]}
      {...rest}>
      {children}
    </Animated.View>
  );
}
