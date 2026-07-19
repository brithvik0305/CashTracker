import { ComingSoon } from '@/components/coming-soon';
import { Screen } from '@/components/screen';

export default function MoreScreen() {
  return (
    <Screen title="More" subtitle="Lending, borrowing, investments & settings">
      <ComingSoon
        icon="ellipsis-horizontal"
        milestone="Arrives in Milestones 5, 6 & 10"
        description="Money lent and borrowed with partial repayments, investment tracking, search, export (CSV/JSON), backups, and app settings."
      />
    </Screen>
  );
}
