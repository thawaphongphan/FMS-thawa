import { getDefaultTenantId } from "@/shared/lib/portal-tenant";
import { getStudentDemographicsSummary } from "@/features/student-stats/server";
import { StatisticsView } from "./_components/statistics-view";

export const metadata = {
  title: "สถิติและข้อมูลนิสิต | Student Demographics & Statistics",
  description: "ระบบสถิติและข้อมูลเชิงวิเคราะห์ของนิสิต สัดส่วนเพศ สัญชาติ และแนวโน้มการศึกษา",
};

interface StatisticsPageProps {
  searchParams: Promise<{ year?: string }>;
}

export default async function StatisticsPortalPage({ searchParams }: StatisticsPageProps) {
  const { year } = await searchParams;
  const tenantId = await getDefaultTenantId();

  const yearNum = year && !isNaN(Number(year)) ? Number(year) : undefined;
  const summary = await getStudentDemographicsSummary(tenantId, yearNum);

  return (
    <div className="min-h-screen bg-background">
      <StatisticsView summary={summary} selectedYear={yearNum} />
    </div>
  );
}
