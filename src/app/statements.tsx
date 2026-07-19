import { ComingSoon } from '@/components/coming-soon';
import { Screen } from '@/components/screen';

export default function StatementsScreen() {
  return (
    <Screen title="Statements" subtitle="Weekly & monthly reports">
      <ComingSoon
        icon="bar-chart-outline"
        milestone="Arrives in Milestone 8"
        description="Monthly summaries and charts — spending by category, weekly income vs. spending, and savings trends. Savings appears here, not on the dashboard."
      />
    </Screen>
  );
}
