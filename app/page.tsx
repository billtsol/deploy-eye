import { Dashboard } from "./components/dashboard/Dashboard";
import { AppHeader } from "./components/layout/AppHeader";
import { PageShell } from "./components/layout/PageShell";
import { getDashboardData } from "@/lib/dashboard";

export default async function Home() {
  const data = await getDashboardData();

  return (
    <PageShell>
      <AppHeader generatedAt={data.generatedAt} />
      <Dashboard data={data} />
    </PageShell>
  );
}
