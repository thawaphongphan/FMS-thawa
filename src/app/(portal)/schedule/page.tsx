import { getLocale, getT } from "@/i18n/server";
import { getDefaultTenantId } from "@/shared/lib/portal-tenant";
import {
  listAcademicTerms,
  getCurrentAcademicTerm,
  listScheduleOptions,
  listPublicClassSchedules,
  listPublicExamSchedules,
} from "@/features/schedule/server";
import { ScheduleView } from "./_components/schedule-view";
import { CalendarDays } from "lucide-react";

interface SchedulePageProps {
  searchParams: Promise<{ termId?: string }>;
}

export default async function PublicSchedulePage({ searchParams }: SchedulePageProps) {
  const { termId } = await searchParams;
  const locale = await getLocale();
  const t = await getT();
  const tenantId = await getDefaultTenantId();

  const [terms, currentTerm, options] = await Promise.all([
    listAcademicTerms(tenantId),
    getCurrentAcademicTerm(tenantId),
    listScheduleOptions(tenantId),
  ]);

  const activeTermId = termId || currentTerm?.id || terms[0]?.id || "";

  const [classes, exams] = await Promise.all([
    activeTermId ? listPublicClassSchedules(tenantId, { termId: activeTermId }) : Promise.resolve([]),
    activeTermId ? listPublicExamSchedules(tenantId, { termId: activeTermId }) : Promise.resolve([]),
  ]);

  const instructors = options.instructors.map((inst) => ({
    id: inst.id,
    nameTh: `${inst.academicTitleTh} ${inst.firstNameTh} ${inst.lastNameTh}`,
    nameEn: `${inst.academicTitleEn} ${inst.firstNameEn} ${inst.lastNameEn}`,
  }));

  const curricula = options.curricula.map((curr) => ({
    id: curr.id,
    programCode: curr.programCode,
    nameTh: curr.nameTh,
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header Banner */}
      <section className="border-b border-border/40 bg-muted/20 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary mb-4">
              <CalendarDays className="h-3.5 w-3.5" />
              <span>{locale === "th" ? "บริการข้อมูลวิชาการ" : "Academic Schedule Portal"}</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              {t("schedule.title")}
            </h1>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              {t("schedule.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Main Schedule Container */}
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {terms.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center">
              <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <h3 className="mt-4 text-base font-semibold text-foreground">
                {t("schedule.noTerms")}
              </h3>
            </div>
          ) : (
            <ScheduleView
              terms={terms}
              selectedTermId={activeTermId}
              classes={classes}
              exams={exams}
              instructors={instructors}
              curricula={curricula}
            />
          )}
        </div>
      </section>
    </div>
  );
}
