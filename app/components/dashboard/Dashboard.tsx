import type { DashboardData } from "@/lib/types";
import { AccountSection } from "./AccountSection";
import { DashboardOverview } from "./DashboardOverview";

interface DashboardProps {
  data: DashboardData;
}

export function Dashboard({ data }: DashboardProps) {
  return (
    <div className="space-y-8">
      <DashboardOverview data={data} />
      <div className="space-y-10">
        {data.accounts.map((account) => (
          <AccountSection key={account.id} account={account} />
        ))}
      </div>
    </div>
  );
}
