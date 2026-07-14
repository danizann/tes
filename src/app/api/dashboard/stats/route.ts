import { ok } from "@/lib/api-helpers";
import { getDashboardStats } from "@/lib/dashboard";

export async function GET() {
  const data = await getDashboardStats();
  return ok(data);
}
