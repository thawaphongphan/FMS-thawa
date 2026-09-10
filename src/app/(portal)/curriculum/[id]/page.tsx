import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Award,
  Clock,
  Calendar,
  FileText,
  Download,
  GraduationCap,
} from "lucide-react";
import { getLocale, getT } from "@/i18n/server";
import { getDefaultTenantId } from "@/shared/lib/portal-tenant";
import { getCurriculumById } from "@/features/curriculum/server";
import { Button } from "@/components/ui/button";

interface CurriculumDetailProps {
  params: Promise<{ id: string }>;
}

export default async function CurriculumDetailPage({ params }: CurriculumDetailProps) {
  const { id } = await params;
  const locale = await getLocale();
  const t = await getT();
  const tenantId = await getDefaultTenantId();

  const curriculum = await getCurriculumById(tenantId, id);

  if (!curriculum) {
    notFound();
  }

  const getDegreeLabel = (level: string) => {
    switch (level) {
      case "BACHELOR":
        return t("curriculum.bachelor");
      case "MASTER":
        return t("curriculum.master");
      case "DOCTORATE":
        return t("curriculum.doctorate");
      case "CERTIFICATE":
        return t("curriculum.certificate");
      case "TRAINING":
        return t("curriculum.training");
      default:
        return level;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb & Navigation */}
      <div className="border-b border-border/40 bg-muted/20 py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/curriculum"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{locale === "th" ? "กลับสู่หน้ารายการหลักสูตร" : "Back to Curricula"}</span>
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content (2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary mb-3">
                <GraduationCap className="h-3.5 w-3.5" />
                <span>{getDegreeLabel(curriculum.degreeLevel)}</span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl md:text-4xl">
                {locale === "th" ? curriculum.nameTh : curriculum.nameEn}
              </h1>
              <p className="mt-2 text-base text-muted-foreground font-medium">
                {locale === "th" ? curriculum.nameEn : curriculum.nameTh}
              </p>
            </div>

            {/* Degree Title Box */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                {locale === "th" ? "ชื่อปริญญาและสาขาวิชา" : "Degree Titles"}
              </h2>
              <div className="space-y-2">
                <div>
                  <span className="text-xs font-medium text-muted-foreground">{locale === "th" ? "ภาษาไทย:" : "Thai:"} </span>
                  <span className="text-sm font-semibold text-foreground">{curriculum.degreeTitleTh}</span>
                </div>
                <div>
                  <span className="text-xs font-medium text-muted-foreground">{locale === "th" ? "ภาษาอังกฤษ:" : "English:"} </span>
                  <span className="text-sm font-semibold text-foreground">{curriculum.degreeTitleEn}</span>
                </div>
              </div>
            </div>

            {/* Course Curriculum Structure */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <span>{t("curriculum.courses")}</span>
              </h2>

              {(!curriculum.courses || curriculum.courses.length === 0) ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  {locale === "th"
                    ? "อยู่ในระหว่างการปรับปรุงรายการรายวิชาประจำภาคการศึกษา โปรดดาวน์โหลดเล่มหลักสูตรฉบับเต็ม"
                    : "Course list is being updated. Please refer to the official brochure PDF."}
                </div>
              ) : (
                <div className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden">
                  {curriculum.courses.map((item) => (
                    <div key={item.id} className="p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-mono text-xs font-bold text-primary">
                            {item.course.courseCode}
                          </div>
                          <div className="font-semibold text-foreground text-sm">
                            {locale === "th" ? item.course.nameTh : item.course.nameEn}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {locale === "th" ? item.course.nameEn : item.course.nameTh}
                          </div>
                          {(item.course.descriptionTh || item.course.descriptionEn) && (
                            <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                              {locale === "th" ? item.course.descriptionTh : item.course.descriptionEn}
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <span className="inline-flex rounded-md bg-muted px-2.5 py-1 text-xs font-semibold text-foreground">
                            {item.course.credits}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Info Card (1 col) */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
              <h3 className="font-bold text-foreground text-base border-b border-border pb-3">
                {locale === "th" ? "ข้อมูลหลักสูตรโดยย่อ" : "Program Summary"}
              </h3>

              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Award className="h-4 w-4 text-primary" />
                    <span>{t("curriculum.totalCredits")}</span>
                  </span>
                  <span className="font-bold text-foreground">
                    {curriculum.totalCredits} {t("curriculum.creditsUnit")}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>
                      {curriculum.degreeLevel === "TRAINING"
                        ? t("curriculum.durationMonths")
                        : t("curriculum.durationYears")}
                    </span>
                  </span>
                  <span className="font-bold text-foreground">
                    {curriculum.durationYears} {curriculum.degreeLevel === "TRAINING" ? t("curriculum.months") : t("curriculum.years")}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{t("curriculum.revisedYear")}</span>
                  </span>
                  <span className="font-bold text-foreground">
                    {curriculum.revisedYear}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-4 w-4 text-primary" />
                    <span>{t("curriculum.programCode")}</span>
                  </span>
                  <span className="font-mono font-bold text-foreground">
                    {curriculum.programCode}
                  </span>
                </div>
              </div>

              {curriculum.brochureUrl && (
                <div className="pt-2 border-t border-border">
                  <a
                    href={curriculum.brochureUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button className="w-full gap-2 shadow-sm font-semibold text-xs">
                      <Download className="h-4 w-4" />
                      <span>{t("curriculum.downloadBrochure")}</span>
                    </Button>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
