import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { getDashboardStats } from "@/lib/dashboard";

export default async function DashboardPage() {
  const data = await getDashboardStats();
  return <DashboardClient data={data} />;
}
