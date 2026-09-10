import Link from "next/link";
import { BookOpen, GraduationCap, Clock, Award, FileText, ArrowRight } from "lucide-react";
import { getLocale, getT } from "@/i18n/server";
import { getDefaultTenantId } from "@/shared/lib/portal-tenant";
import { listPublicCurricula, listActiveDegreeLevels } from "@/features/curriculum/server";
import { Button } from "@/components/ui/button";
import type { DegreeLevel } from "@/generated/prisma";

interface CurriculumPageProps {
  searchParams: Promise<{ level?: string }>;
}

export default async function PublicCurriculumPage({ searchParams }: CurriculumPageProps) {
  const { level } = await searchParams;
  const locale = await getLocale();
  const t = await getT();
  const tenantId = await getDefaultTenantId();

  const activeLevels = await listActiveDegreeLevels(tenantId);

  const activeLevel = level && activeLevels.includes(level as DegreeLevel)
    ? (level as DegreeLevel)
    : undefined;

  const curricula = await listPublicCurricula(tenantId, activeLevel);

  const levelLabels: Record<DegreeLevel, string> = {
    BACHELOR: t("curriculum.bachelor"),
    MASTER: t("curriculum.master"),
    DOCTORATE: t("curriculum.doctorate"),
    CERTIFICATE: t("curriculum.certificate"),
    TRAINING: t("curriculum.training"),
  };

  const levelTabs = activeLevels.length > 0
    ? [
        { key: "ALL", label: t("curriculum.allLevels"), href: "/curriculum" },
        ...activeLevels.map((lvl) => ({
          key: lvl,
          label: levelLabels[lvl] ?? lvl,
          href: `/curriculum?level=${lvl}`,
        })),
      ]
    : [];

  const getDegreeBadge = (degLevel: string) => {
    switch (degLevel) {
      case "BACHELOR":
        return {
          label: t("curriculum.bachelor"),
          color: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900",
        };
      case "MASTER":
        return {
          label: t("curriculum.master"),
          color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900",
        };
      case "DOCTORATE":
        return {
          label: t("curriculum.doctorate"),
          color: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900",
        };
      case "CERTIFICATE":
        return {
          label: t("curriculum.certificate"),
          color: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900",
        };
      case "TRAINING":
        return {
          label: t("curriculum.training"),
          color: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-900",
        };
      default:
        return {
          label: degLevel,
          color: "bg-muted text-muted-foreground border-border",
        };
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Banner */}
      <section className="border-b border-border/40 bg-muted/20 py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary mb-4">
              <GraduationCap className="h-3.5 w-3.5" />
              <span>{locale === "th" ? "ระดับอุดมศึกษาและบัณฑิตศึกษา" : "Undergraduate & Graduate Studies"}</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              {t("curriculum.title")}
            </h1>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              {t("curriculum.subtitle")}
            </p>
          </div>

          {/* Degree Level Filter Tabs */}
          {levelTabs.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {levelTabs.map((tab) => {
                const isActive = (!activeLevel && tab.key === "ALL") || activeLevel === tab.key;
                return (
                  <Link key={tab.key} href={tab.href}>
                    <Button
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      className="rounded-full shadow-none font-medium text-xs sm:text-sm"
                    >
                      {tab.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Curricula Grid */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {curricula.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-base font-semibold text-foreground">
                {t("curriculum.empty")}
              </h3>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {curricula.map((item) => {
                const badge = getDegreeBadge(item.degreeLevel);
                return (
                  <div
                    key={item.id}
                    className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-primary/40"
                  >
                    <div>
                      {/* Badge & Revised Year */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                        <span className="text-xs font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded">
                          {t("curriculum.revisedYear")} {item.revisedYear}
                        </span>
                      </div>

                      {/* Program Title */}
                      <h3 className="text-lg font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                        {locale === "th" ? item.nameTh : item.nameEn}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {locale === "th" ? item.nameEn : item.nameTh}
                      </p>

                      {/* Degree Title */}
                      <div className="mt-4 rounded-lg bg-muted/30 p-3 text-xs border border-border/50">
                        <div className="font-semibold text-foreground">
                          {locale === "th" ? item.degreeTitleTh : item.degreeTitleEn}
                        </div>
                      </div>

                      {/* Meta Info */}
                      <div className="mt-6 grid grid-cols-2 gap-3 border-t border-border/50 pt-4 text-xs">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Award className="h-4 w-4 text-primary shrink-0" />
                          <span>
                            {item.totalCredits} {t("curriculum.creditsUnit")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4 text-primary shrink-0" />
                          <span>
                            {item.durationYears} {item.degreeLevel === "TRAINING" ? t("curriculum.months") : t("curriculum.years")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between gap-2">
                      <Link href={`/curriculum/${item.id}`} className="flex-1">
                        <Button variant="default" size="sm" className="w-full gap-1.5 shadow-none text-xs">
                          <span>{t("curriculum.viewDetails")}</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>

                      {item.brochureUrl && (
                        <a
                          href={item.brochureUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={t("curriculum.downloadBrochure")}
                        >
                          <Button variant="outline" size="sm" className="gap-1 text-xs shadow-none">
                            <FileText className="h-3.5 w-3.5" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
