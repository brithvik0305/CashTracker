/**
 * Add tab — quick actions that open entry sheets. Income and expenses land here
 * in M2; credit-card, lending, borrowing, and investment actions join later.
 */

import { useState } from 'react';
import { View } from 'react-native';

import { Screen } from '@/components/screen';
import { AddExpenseModal } from '@/components/transactions/add-expense-modal';
import { AddIncomeModal } from '@/components/transactions/add-income-modal';
import { ManageCategoriesModal } from '@/components/transactions/manage-categories-modal';
import { ActionTile } from '@/components/ui/action-tile';

export default function AddScreen() {
  const [modal, setModal] = useState<null | 'income' | 'expense' | 'categories'>(null);

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
          icon="pricetags-outline"
          tone="brand"
          title="Manage categories"
          subtitle="Add, rename, or archive categories"
          onPress={() => setModal('categories')}
        />
      </View>

      <AddIncomeModal visible={modal === 'income'} onClose={() => setModal(null)} />
      <AddExpenseModal visible={modal === 'expense'} onClose={() => setModal(null)} />
      <ManageCategoriesModal visible={modal === 'categories'} onClose={() => setModal(null)} />
    </Screen>
  );
}
