/**
 * Money value that counts up (or down) to its new amount instead of snapping.
 *
 * Uses a plain requestAnimationFrame loop rather than a native driver because
 * the value being animated is text, which has to be re-rendered each frame.
 * Skips the animation entirely on first paint so the screen loads settled.
 */

import { useEffect, useRef, useState } from 'react';

import { ThemedText, type ThemedTextProps } from '@/components/themed-text';
import { formatMoney, type FormatMoneyOptions } from '@/domain/money';

const DURATION_MS = 550;

/** Ease-out cubic: fast at first, gently settling at the end. */
function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

interface AnimatedMoneyProps extends Omit<ThemedTextProps, 'children'> {
  value: number;
  options?: FormatMoneyOptions;
}

export function AnimatedMoney({ value, options, ...textProps }: AnimatedMoneyProps) {
  const [displayed, setDisplayed] = useState(value);
  const previous = useRef(value);
  const frame = useRef<number | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      previous.current = value;
      setDisplayed(value);
      return;
    }

    const from = previous.current;
    const to = value;
    previous.current = value;

    if (from === to) return;

    const start = Date.now();
    const step = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / DURATION_MS, 1);
      setDisplayed(Math.round(from + (to - from) * easeOut(progress)));
      if (progress < 1) {
        frame.current = requestAnimationFrame(step);
      }
    };
    frame.current = requestAnimationFrame(step);

    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [value]);

  return <ThemedText {...textProps}>{formatMoney(displayed, options)}</ThemedText>;
}
