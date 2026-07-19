/**
 * Rupee amount input. The user types rupees; the value is surfaced as integer
 * paise via `onChangePaise`. Empty/invalid input reports null.
 */

import { useEffect, useState } from 'react';

import { TextField } from '@/components/ui/text-field';
import { toPaise, toRupees } from '@/domain/money';

interface MoneyInputProps {
  label?: string;
  hint?: string;
  /** Initial value in paise (used to seed the field once). */
  initialPaise?: number | null;
  onChangePaise: (paise: number | null) => void;
  autoFocus?: boolean;
  placeholder?: string;
}

export function MoneyInput({
  label,
  hint,
  initialPaise,
  onChangePaise,
  autoFocus,
  placeholder = '0.00',
}: MoneyInputProps) {
  const [text, setText] = useState(
    initialPaise != null ? String(toRupees(initialPaise)) : '',
  );

  useEffect(() => {
    const trimmed = text.trim();
    if (trimmed === '') {
      onChangePaise(null);
      return;
    }
    const rupees = Number(trimmed);
    onChangePaise(Number.isFinite(rupees) ? toPaise(rupees) : null);
  }, [text, onChangePaise]);

  return (
    <TextField
      label={label}
      hint={hint}
      value={text}
      onChangeText={setText}
      keyboardType="decimal-pad"
      inputMode="decimal"
      autoFocus={autoFocus}
      placeholder={placeholder}
    />
  );
}
