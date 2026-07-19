/**
 * Add tab — quick actions that open entry sheets: income, expense, credit-card
 * purchase, credit-card payment, and category management.
 */

import { useState } from 'react';
import { View } from 'react-native';

import { Screen } from '@/components/screen';
import { AddCardPaymentModal } from '@/components/cards/add-card-payment-modal';
import { AddCardPurchaseModal } from '@/components/cards/add-card-purchase-modal';
import { AddExpenseModal } from '@/components/transactions/add-expense-modal';
import { AddIncomeModal } from '@/components/transactions/add-income-modal';
import { ManageCategoriesModal } from '@/components/transactions/manage-categories-modal';
import { ActionTile } from '@/components/ui/action-tile';

type Modal = 'income' | 'expense' | 'purchase' | 'payment' | 'categories';

export default function AddScreen() {
  const [modal, setModal] = useState<Modal | null>(null);

  return (
    <Screen title="Add" subtitle="Record a transaction">
      <View style={{ gap: 12 }}>
        <ActionTile
          icon="arrow-down-circle-outline"
          tone="success"
          title="Income"
          subtitle="Money received from a client"
          onPress={() => setModal('income')}
        />
        <ActionTile
          icon="cart-outline"
          tone="danger"
          title="Expense"
          subtitle="Money spent from an account"
          onPress={() => setModal('expense')}
        />
        <ActionTile
          icon="card-outline"
          tone="brand"
          title="Card purchase"
          subtitle="Charge to a credit card (not an expense yet)"
          onPress={() => setModal('purchase')}
        />
        <ActionTile
          icon="cash-outline"
          tone="caution"
          title="Card payment"
          subtitle="Pay a card bill from a bank account"
          onPress={() => setModal('payment')}
        />
        <ActionTile
          icon="pricetags-outline"
          tone="brand"
          title="Manage categories"
          subtitle="Add, rename, or archive categories"
          onPress={() => setModal('categories')}
        />
      </View>

      <AddIncomeModal visible={modal === 'income'} onClose={() => setModal(null)} />
      <AddExpenseModal visible={modal === 'expense'} onClose={() => setModal(null)} />
      <AddCardPurchaseModal visible={modal === 'purchase'} onClose={() => setModal(null)} />
      <AddCardPaymentModal visible={modal === 'payment'} onClose={() => setModal(null)} />
      <ManageCategoriesModal visible={modal === 'categories'} onClose={() => setModal(null)} />
    </Screen>
  );
}
