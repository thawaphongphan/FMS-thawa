"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useT } from "@/shared/lib/i18n/client";
import type { StudentDemographicsData } from "@/features/student-stats/server";
import {
  Users,
  GraduationCap,
  Briefcase,
  Globe,
  Award,
  BookOpen,
  PieChart,
  BarChart3,
  Filter,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

interface StatisticsViewProps {
  summary: StudentDemographicsData;
  selectedYear?: number;
}

export function StatisticsView({ summary, selectedYear }: StatisticsViewProps) {
  const locale = useLocale();
  const t = useT();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleYearChange = (yearStr: string) => {
    startTransition(() => {
      if (yearStr === "all") {
        router.push("/statistics");
      } else {
        router.push(`/statistics?year=${yearStr}`);
      }
    });
  };

  const totalGender =
    summary.genderBreakdown.MALE +
    summary.genderBreakdown.FEMALE +
    summary.genderBreakdown.OTHER;

  const malePct = totalGender > 0 ? Math.round((summary.genderBreakdown.MALE / totalGender) * 100) : 0;
  const femalePct = totalGender > 0 ? Math.round((summary.genderBreakdown.FEMALE / totalGender) * 100) : 0;
  const otherPct = totalGender > 0 ? 100 - malePct - femalePct : 0;

  const degreeLabels: Record<string, { th: string; en: string; color: string }> = {
    BACHELOR: { th: "ปริญญาตรี", en: "Bachelor's", color: "bg-blue-500" },
    MASTER: { th: "ปริญญาโท", en: "Master's", color: "bg-indigo-500" },
    DOCTORATE: { th: "ปริญญาเอก", en: "Doctorate", color: "bg-purple-500" },
    CERTIFICATE: { th: "ประกาศนียบัตร", en: "Certificate", color: "bg-amber-500" },
    TRAINING: { th: "โครงการอบรม", en: "Training Program", color: "bg-emerald-500" },
  };

  const employmentLabels: Record<string, { th: string; en: string; color: string }> = {
    EMPLOYED: { th: "ได้งานทำ / พนักงานบริษัท / รับราชการ", en: "Employed", color: "bg-emerald-500" },
    ENTREPRENEUR: { th: "ประกอบธุรกิจส่วนตัว / อาชีพอิสระ", en: "Entrepreneur / Freelance", color: "bg-blue-500" },
    STUDYING: { th: "ศึกษาต่อระดับสูงขึ้น", en: "Higher Studies", color: "bg-indigo-500" },
    JOB_SEEKING: { th: "อยู่ระหว่างหางาน", en: "Job Seeking", color: "bg-amber-500" },
    OTHER: { th: "อื่นๆ", en: "Other", color: "bg-zinc-400" },
  };

  const totalEmploymentTracked = Object.values(summary.employmentBreakdown).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-10 pb-16">
      {/* Header Banner */}
      <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-primary/10 via-background to-background py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary mb-4">
                <BarChart3 className="h-3.5 w-3.5" />
                <span>{locale === "th" ? "ศูนย์ข้อมูลสถิติมหาวิทยาลัย" : "Faculty Demographics & Analytics"}</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                {t("stats.title")}
              </h1>
              <p className="mt-3 text-base text-muted-foreground sm:text-lg">
                {t("stats.subtitle")}
              </p>
            </div>

            {/* Year Selector */}
            <div className="flex items-center gap-3 bg-card border border-border p-3 rounded-2xl shadow-xs">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground whitespace-nowrap">
                {locale === "th" ? "จำแนกปีที่เข้าศึกษา:" : "Cohort Year:"}
              </span>
              <select
                value={selectedYear ? String(selectedYear) : "all"}
                onChange={(e) => handleYearChange(e.target.value)}
                disabled={isPending}
                aria-label={locale === "th" ? "จำแนกปีที่เข้าศึกษา" : "Cohort Year"}
                className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">
                  {locale === "th" ? "ทุกปีการศึกษา (ภาพรวมทั้งหมด)" : "All Cohorts (Overall)"}
                </option>
                {summary.availableAdmissionYears.map((yr) => (
                  <option key={yr} value={String(yr)}>
                    {locale === "th" ? `ปีการศึกษา ${yr}` : `Cohort ${yr}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* KPI Metric Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t("stats.totalEnrolled")}
              </span>
              <div className="rounded-xl bg-blue-500/10 p-2 text-blue-600">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-foreground">
                {summary.totalEnrolled.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">{locale === "th" ? "คน" : "students"}</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {locale === "th" ? `จากนิสิตในระบบทั้งหมด ${summary.totalStudents} คน` : `Out of ${summary.totalStudents} total recorded`}
            </p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t("stats.totalAlumni")}
              </span>
              <div className="rounded-xl bg-purple-500/10 p-2 text-purple-600">
                <GraduationCap className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-foreground">
                {summary.totalAlumni.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">{locale === "th" ? "คน" : "alumni"}</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {locale === "th" ? "บัณฑิตในทำเนียบศิษย์เก่า" : "In alumni network directory"}
            </p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t("stats.employmentRate")}
              </span>
              <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-600">
                <Briefcase className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-emerald-600">
                {summary.employmentRate}%
              </span>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {locale === "th" ? "มีงานทำหรือประกอบธุรกิจภายใน 1 ปี" : "Employed or entrepreneurs"}
            </p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t("stats.internationalCount")}
              </span>
              <div className="rounded-xl bg-amber-500/10 p-2 text-amber-600">
                <Globe className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-foreground">
                {summary.internationalCount.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">{locale === "th" ? "คน" : "students"}</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {locale === "th" ? "ความหลากหลายทางสัญชาติระดับนานาชาติ" : "Multinational diversity"}
            </p>
          </div>
        </div>

        {/* Two-Column Charts: Gender & Nationality/Ethnicity */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Gender Distribution */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-6">
              <PieChart className="h-5 w-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">
                {t("stats.chartGender")}
              </h2>
            </div>

            {totalGender === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                {locale === "th" ? "ยังไม่มีข้อมูลสัดส่วนเพศ" : "No gender data available"}
              </p>
            ) : (
              <div className="space-y-6">
                {/* Visual Ratio Bar */}
                <div className="space-y-2">
                  <div className="flex h-5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      style={{ width: `${malePct}%` }}
                      className="bg-blue-600 transition-all duration-500 hover:opacity-90"
                      title={`ชาย: ${summary.genderBreakdown.MALE} คน (${malePct}%)`}
                    />
                    <div
                      style={{ width: `${femalePct}%` }}
                      className="bg-rose-500 transition-all duration-500 hover:opacity-90"
                      title={`หญิง: ${summary.genderBreakdown.FEMALE} คน (${femalePct}%)`}
                    />
                    {otherPct > 0 && (
                      <div
                        style={{ width: `${otherPct}%` }}
                        className="bg-purple-500 transition-all duration-500 hover:opacity-90"
                        title={`อื่นๆ: ${summary.genderBreakdown.OTHER} คน (${otherPct}%)`}
                      />
                    )}
                  </div>
                </div>

                {/* Cards for each gender */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 p-4">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-blue-600" />
                      <span className="text-xs font-semibold text-foreground">{t("stats.male")}</span>
                    </div>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-2xl font-black text-blue-700 dark:text-blue-400">
                        {summary.genderBreakdown.MALE}
                      </span>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-300">{malePct}%</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-rose-500/20 bg-rose-50/50 dark:bg-rose-950/20 p-4">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-rose-500" />
                      <span className="text-xs font-semibold text-foreground">{t("stats.female")}</span>
                    </div>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-2xl font-black text-rose-700 dark:text-rose-400">
                        {summary.genderBreakdown.FEMALE}
                      </span>
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-300">{femalePct}%</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-purple-500/20 bg-purple-50/50 dark:bg-purple-950/20 p-4 col-span-2 sm:col-span-1">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-purple-500" />
                      <span className="text-xs font-semibold text-foreground">{t("stats.otherGender")}</span>
                    </div>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-2xl font-black text-purple-700 dark:text-purple-400">
                        {summary.genderBreakdown.OTHER}
                      </span>
                      <span className="text-xs font-bold text-purple-600 dark:text-purple-300">{otherPct}%</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>
                    {locale === "th"
                      ? `อัตราส่วน ชาย : หญิง อยู่ที่ ${malePct} : ${femalePct}`
                      : `Male to Female ratio is ${malePct}% : ${femalePct}%`}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Nationality & Ethnicity Breakdown */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-6">
              <Globe className="h-5 w-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">
                {t("stats.chartNationality")}
              </h2>
            </div>

            {summary.nationalityBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                {locale === "th" ? "ยังไม่มีข้อมูลสัญชาติ" : "No nationality data available"}
              </p>
            ) : (
              <div className="space-y-4">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  {locale === "th" ? "จำแนกตามสัญชาติ (Top Nationalities)" : "Top Nationalities"}
                </div>
                <div className="space-y-2.5">
                  {summary.nationalityBreakdown.slice(0, 5).map((item) => {
                    const pct = summary.totalStudents > 0 ? Math.round((item.count / summary.totalStudents) * 100) : 0;
                    return (
                      <div key={item.label} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-foreground flex items-center gap-1.5">
                            <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                            {item.label}
                            {item.isThai && (
                              <span className="text-[10px] text-muted-foreground">
                                ({locale === "th" ? "ในประเทศ" : "Domestic"})
                              </span>
                            )}
                          </span>
                          <span className="text-muted-foreground font-semibold">
                            {item.count} {locale === "th" ? "คน" : "students"} ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            style={{ width: `${pct}%` }}
                            className={`h-full rounded-full ${item.isThai ? "bg-primary" : "bg-amber-500"}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Ethnicity Pills */}
                <div className="pt-4 border-t border-border">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                    {locale === "th" ? "เชื้อชาติที่พบในระบบ" : "Ethnicities Identified"}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {summary.ethnicityBreakdown.map((item) => (
                      <span
                        key={item.label}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground"
                      >
                        <span>{item.label}</span>
                        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                          {item.count}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Curriculum & Cohort Year Matrix */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <div>
                <h2 className="text-base font-bold text-foreground">
                  {t("stats.chartCurriculum")}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {locale === "th"
                    ? "จำนวนนิสิตแยกตามแต่ละหลักสูตร และการกระจายตัวในชั้นปี 1 ถึง 4+"
                    : "Number of students enrolled in each curriculum by academic year"}
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
                <tr>
                  <th className="py-3 px-4">{locale === "th" ? "รหัสหลักสูตร" : "Code"}</th>
                  <th className="py-3 px-4">{locale === "th" ? "ชื่อหลักสูตร" : "Curriculum Name"}</th>
                  <th className="py-3 px-3 text-center">{locale === "th" ? "ปี 1" : "Year 1"}</th>
                  <th className="py-3 px-3 text-center">{locale === "th" ? "ปี 2" : "Year 2"}</th>
                  <th className="py-3 px-3 text-center">{locale === "th" ? "ปี 3" : "Year 3"}</th>
                  <th className="py-3 px-3 text-center">{locale === "th" ? "ปี 4+" : "Year 4+"}</th>
                  <th className="py-3 px-4 text-right">{locale === "th" ? "รวมทั้งหมด" : "Total"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {summary.curriculumYearBreakdown.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-muted-foreground">
                      {locale === "th" ? "ไม่มีข้อมูลหลักสูตร" : "No program data"}
                    </td>
                  </tr>
                ) : (
                  summary.curriculumYearBreakdown.map((row) => (
                    <tr key={row.curriculumId} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-primary">
                        {row.programCode}
                      </td>
                      <td className="py-3 px-4 font-medium text-foreground">
                        {row.nameTh}
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-foreground">
                        {row.year1 > 0 ? (
                          <span className="rounded-md bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 text-blue-700 dark:text-blue-400">
                            {row.year1}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-foreground">
                        {row.year2 > 0 ? (
                          <span className="rounded-md bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 text-indigo-700 dark:text-indigo-400">
                            {row.year2}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-foreground">
                        {row.year3 > 0 ? (
                          <span className="rounded-md bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 text-purple-700 dark:text-purple-400">
                            {row.year3}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-foreground">
                        {row.year4 > 0 ? (
                          <span className="rounded-md bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 text-amber-700 dark:text-amber-400">
                            {row.year4}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-foreground">
                        {row.total} {locale === "th" ? "คน" : ""}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Degree Level & Career Pathways Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Degree Level Breakdown */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-6">
              <Award className="h-5 w-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">
                {t("stats.chartDegreeLevel")}
              </h2>
            </div>

            <div className="space-y-4">
              {Object.entries(summary.degreeLevelBreakdown).map(([deg, count]) => {
                const info = degreeLabels[deg] || { th: deg, en: deg, color: "bg-primary" };
                const pct = summary.totalStudents > 0 ? Math.round((count / summary.totalStudents) * 100) : 0;
                return (
                  <div key={deg} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-foreground font-semibold">
                        {locale === "th" ? info.th : info.en}
                      </span>
                      <span className="text-muted-foreground">
                        {count} {locale === "th" ? "คน" : "students"} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                      <div style={{ width: `${pct}%` }} className={`h-full rounded-full ${info.color}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Graduate Career Pathways */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-6">
              <Briefcase className="h-5 w-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">
                {t("stats.chartEmployment")}
              </h2>
            </div>

            {totalEmploymentTracked === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                {locale === "th" ? "ยังไม่มีข้อมูลอาชีพบัณฑิต" : "No alumni employment data"}
              </p>
            ) : (
              <div className="space-y-4">
                {Object.entries(summary.employmentBreakdown).map(([status, count]) => {
                  const info = employmentLabels[status] || { th: status, en: status, color: "bg-primary" };
                  const pct = totalEmploymentTracked > 0 ? Math.round((count / totalEmploymentTracked) * 100) : 0;
                  return (
                    <div key={status} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-foreground">
                          {locale === "th" ? info.th : info.en}
                        </span>
                        <span className="text-muted-foreground font-bold">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                        <div style={{ width: `${pct}%` }} className={`h-full rounded-full ${info.color}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
