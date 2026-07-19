/**
 * Money handling.
 *
 * Amounts are stored and computed as INTEGER minor units (paise) to avoid binary
 * floating-point rounding errors — the cardinal rule for anything touching money.
 * Convert to/from rupees only at the UI boundary.
 */

export type Paise = number; // integer minor units
export type Rupees = number; // human-facing major units

/** Convert rupees (possibly fractional) to integer paise. */
export function toPaise(rupees: Rupees): Paise {
  return Math.round(rupees * 100);
}

/** Convert integer paise back to rupees. */
export function toRupees(paise: Paise): Rupees {
  return paise / 100;
}

/**
 * Group an integer string using the Indian numbering system
 * (last 3 digits, then groups of 2): 1234567 -> "12,34,567".
 */
function groupIndian(digits: string): string {
  if (digits.length <= 3) return digits;
  const head = digits.slice(0, -3);
  const tail = digits.slice(-3);
  return head.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + tail;
}

export interface FormatMoneyOptions {
  /** Show the currency symbol (default true). */
  symbol?: boolean;
  /** Show two decimal places (default true). */
  decimals?: boolean;
  /** Always show a leading + for positive amounts (default false). */
  signed?: boolean;
}

/**
 * Format integer paise as an INR string, e.g. `formatMoney(123456)` -> "₹1,234.56".
 * Indian digit grouping (lakh/crore) is used.
 */
export function formatMoney(paise: Paise, options: FormatMoneyOptions = {}): string {
  const { symbol = true, decimals = true, signed = false } = options;

  const negative = paise < 0;
  const abs = Math.abs(paise);
  const whole = Math.trunc(abs / 100);
  const frac = abs % 100;

  let out = groupIndian(String(whole));
  if (decimals) out += '.' + String(frac).padStart(2, '0');
  if (symbol) out = '₹' + out;

  if (negative) return '-' + out;
  if (signed) return '+' + out;
  return out;
}
