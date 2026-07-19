/**
 * Presents a ledger row for lists/timelines: a title, subtitle, signed amount,
 * colour tone, and an icon. Pure and exhaustive over transaction types so the
 * unified timeline (M8) reuses it unchanged.
 */

import type { TransactionListItem } from '@/schemas/transaction';

export type DisplayTone = 'positive' | 'negative' | 'neutral';

export interface TransactionDisplay {
  title: string;
  subtitle: string | null;
  /** Signed paise (as stored: positive raises the account balance). */
  amount: number;
  tone: DisplayTone;
  icon: string; // Ionicons name
}

export function describeTransaction(t: TransactionListItem): TransactionDisplay {
  const base = { subtitle: t.account_name, amount: t.amount };

  switch (t.type) {
    case 'income':
      return { ...base, title: t.counterparty || 'Income', tone: 'positive', icon: 'arrow-down-circle-outline' };
    case 'expense':
      return { ...base, title: t.category_name || 'Expense', tone: 'negative', icon: 'cart-outline' };
    case 'cc_purchase':
      return { subtitle: t.card_name, amount: t.amount, title: t.category_name || 'Card purchase', tone: 'neutral', icon: 'card-outline' };
    case 'cc_payment':
      return { subtitle: t.card_name, amount: t.amount, title: 'Card payment', tone: 'negative', icon: 'card-outline' };
    case 'lend':
      return { ...base, title: `Lent to ${t.counterparty ?? '—'}`, tone: 'negative', icon: 'arrow-up-circle-outline' };
    case 'lend_return':
      return { ...base, title: `Repaid by ${t.counterparty ?? '—'}`, tone: 'positive', icon: 'arrow-down-circle-outline' };
    case 'borrow':
      return { ...base, title: `Borrowed from ${t.counterparty ?? '—'}`, tone: 'positive', icon: 'arrow-down-circle-outline' };
    case 'borrow_repay':
      return { ...base, title: `Repaid ${t.counterparty ?? '—'}`, tone: 'negative', icon: 'arrow-up-circle-outline' };
    case 'invest_add':
      return { ...base, title: t.investment_name || 'Investment', tone: 'neutral', icon: 'trending-up-outline' };
    case 'invest_withdraw':
      return {
        ...base,
        title: t.investment_name ? `${t.investment_name} withdrawal` : 'Investment withdrawal',
        tone: 'positive',
        icon: 'trending-down-outline',
      };
    case 'transfer':
      return { ...base, title: 'Transfer', tone: 'neutral', icon: 'swap-horizontal-outline' };
    case 'adjustment':
      // A card correction carries no bank account, so name the card instead.
      return {
        amount: t.amount,
        subtitle: t.account_name ?? t.card_name,
        title: t.card_name ? 'Card adjustment' : 'Balance adjustment',
        tone: 'neutral',
        icon: 'options-outline',
      };
    default:
      return { ...base, title: 'Transaction', tone: 'neutral', icon: 'ellipse-outline' };
  }
}
