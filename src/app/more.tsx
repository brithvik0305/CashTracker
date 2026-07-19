/**
 * More tab — money lent and money borrowed, with partial repayments.
 * Investments, search, export, and settings arrive in later milestones.
 */

import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ComingSoon } from '@/components/coming-soon';
import { BackupsModal } from '@/components/data/backups-modal';
import { AddInvestmentModal } from '@/components/investments/add-investment-modal';
import { InvestmentCard } from '@/components/investments/investment-card';
import { InvestmentDetailModal } from '@/components/investments/investment-detail-modal';
import { AddLoanModal } from '@/components/loans/add-loan-modal';
import { LoanCard } from '@/components/loans/loan-card';
import { LoanDetailModal } from '@/components/loans/loan-detail-modal';
import { Screen } from '@/components/screen';
import { StatCard } from '@/components/stat-card';
import { ThemedText } from '@/components/themed-text';
import { ActionTile } from '@/components/ui/action-tile';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { formatMoney } from '@/domain/money';
import { useInvestments } from '@/hooks/use-investments';
import { useLoans } from '@/hooks/use-loans';
import type { InvestmentWithTotals } from '@/schemas/investment';
import type { LoanKind, LoanWithTotals } from '@/schemas/loan';

export default function MoreScreen() {
  const { data: lendings } = useLoans('lending');
  const { data: borrowings } = useLoans('borrowing');
  const { data: investments } = useInvestments();

  const [addKind, setAddKind] = useState<LoanKind | null>(null);
  const [detail, setDetail] = useState<{ loan: LoanWithTotals; kind: LoanKind } | null>(null);
  const [showAddInvestment, setShowAddInvestment] = useState(false);
  const [investmentDetail, setInvestmentDetail] = useState<InvestmentWithTotals | null>(null);
  const [showBackups, setShowBackups] = useState(false);

  const lendingList = lendings ?? [];
  const borrowingList = borrowings ?? [];
  const investmentList = investments ?? [];
  const owedToMe = lendingList.reduce((s, l) => s + Math.max(l.remaining, 0), 0);
  const iOwe = borrowingList.reduce((s, l) => s + Math.max(l.remaining, 0), 0);
  const portfolio = investmentList.reduce((s, i) => s + i.value, 0);

  return (
    <Screen title="More" subtitle="Lending, borrowing & investments">
      <View style={styles.row}>
        <StatCard label="Owed to me" value={formatMoney(owedToMe)} tone="success" />
        <StatCard label="I owe" value={formatMoney(iOwe)} tone="danger" />
      </View>

      <Section
        title="MONEY I LENT"
        actionLabel="Lend"
        onAction={() => setAddKind('lending')}
        empty="Nobody owes you right now."
        loans={lendingList}
        kind="lending"
        onSelect={(loan) => setDetail({ loan, kind: 'lending' })}
      />

      <Section
        title="MONEY I BORROWED"
        actionLabel="Borrow"
        onAction={() => setAddKind('borrowing')}
        empty="You haven't borrowed anything."
        loans={borrowingList}
        kind="borrowing"
        onSelect={(loan) => setDetail({ loan, kind: 'borrowing' })}
      />

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            INVESTMENTS {portfolio > 0 ? `· ${formatMoney(portfolio, { decimals: false })}` : ''}
          </ThemedText>
          <Button title="Invest" variant="ghost" onPress={() => setShowAddInvestment(true)} />
        </View>
        {investmentList.length === 0 ? (
          <ThemedText type="small" themeColor="textTertiary">
            Track mutual funds, stocks, gold, or FDs. Investments raise Net Worth but never Safe to
            Spend.
          </ThemedText>
        ) : (
          investmentList.map((investment) => (
            <InvestmentCard
              key={investment.id}
              investment={investment}
              onPress={() => setInvestmentDetail(investment)}
            />
          ))
        )}
      </View>

      <View style={styles.section}>
        <ThemedText type="smallBold" themeColor="textSecondary">
          DATA
        </ThemedText>
        <ActionTile
          icon="archive-outline"
          tone="brand"
          title="Data & backups"
          subtitle="Export CSV/JSON, back up, and restore"
          onPress={() => setShowBackups(true)}
        />
      </View>

      <ComingSoon
        icon="ellipsis-horizontal"
        milestone="Still to come"
        description="Search and app settings arrive in a later milestone."
      />

      <AddLoanModal
        kind={addKind ?? 'lending'}
        visible={addKind !== null}
        onClose={() => setAddKind(null)}
      />
      <LoanDetailModal
        loan={detail?.loan ?? null}
        kind={detail?.kind ?? 'lending'}
        onClose={() => setDetail(null)}
      />
      <AddInvestmentModal
        visible={showAddInvestment}
        onClose={() => setShowAddInvestment(false)}
      />
      <InvestmentDetailModal
        investment={investmentDetail}
        onClose={() => setInvestmentDetail(null)}
      />
      <BackupsModal visible={showBackups} onClose={() => setShowBackups(false)} />
    </Screen>
  );
}

function Section({
  title,
  actionLabel,
  onAction,
  empty,
  loans,
  kind,
  onSelect,
}: {
  title: string;
  actionLabel: string;
  onAction: () => void;
  empty: string;
  loans: LoanWithTotals[];
  kind: LoanKind;
  onSelect: (loan: LoanWithTotals) => void;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <ThemedText type="smallBold" themeColor="textSecondary">
          {title}
        </ThemedText>
        <Button title={actionLabel} variant="ghost" onPress={onAction} />
      </View>
      {loans.length === 0 ? (
        <ThemedText type="small" themeColor="textTertiary">
          {empty}
        </ThemedText>
      ) : (
        loans.map((loan) => (
          <LoanCard key={loan.id} loan={loan} kind={kind} onPress={() => onSelect(loan)} />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  section: {
    gap: Spacing.two,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
