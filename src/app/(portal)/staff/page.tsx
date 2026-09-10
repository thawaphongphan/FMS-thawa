import Link from "next/link";
import { GraduationCap, Mail, Phone, MapPin, Search, BookOpen, Award } from "lucide-react";
import { getLocale, getT } from "@/i18n/server";
import { getDefaultTenantId } from "@/shared/lib/portal-tenant";
import { listPublicStaff, listDepartments } from "@/features/staff/server";

export default async function StaffPortalPage({
  searchParams,
}: {
  searchParams: Promise<{ dept?: string; q?: string }>;
}) {
  const { dept, q } = await searchParams;
  const locale = await getLocale();
  const t = await getT();
  const tenantId = await getDefaultTenantId();

  const [departments, staffList] = await Promise.all([
    listDepartments(tenantId),
    listPublicStaff(tenantId, dept, q),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      {/* Page Header */}
      <div className="border-b border-border/60 pb-8 text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          {t("staff.title")}
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          {t("staff.subtitle")}
        </p>

        {/* Filter & Search Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Department Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/staff"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                !dept || dept === "all"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {t("staff.allDepartments")}
            </Link>
            {departments.map((d) => {
              const isActive = dept === d.code;
              const deptName = locale === "th" ? d.nameTh : d.nameEn;
              return (
                <Link
                  key={d.id}
                  href={`/staff?dept=${d.code}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  {deptName}
                </Link>
              );
            })}
          </div>

          {/* Search form */}
          <form method="GET" action="/staff" className="relative w-full sm:w-80">
            {dept && <input type="hidden" name="dept" value={dept} />}
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              name="q"
              defaultValue={q ?? ""}
              placeholder={t("staff.searchPlaceholder")}
              className="w-full rounded-lg border border-input bg-background pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </form>
        </div>
      </div>

      {/* Staff Grid */}
      {staffList.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-dashed border-border p-8">
          <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">{t("staff.empty")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {staffList.map((staff) => {
            const fullName = locale === "th" ? staff.fullNameTh : staff.fullNameEn;
            const position = locale === "th" ? staff.adminPositionTh : staff.adminPositionEn;
            const deptName = locale === "th" ? staff.departmentNameTh : staff.departmentNameEn;
            const bio = locale === "th" ? staff.bioTh : staff.bioEn;

            return (
              <div
                key={staff.id}
                className="group flex flex-col rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/40"
              >
                {/* Header Profile */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-primary/20 shadow-sm bg-muted">
                    {staff.avatarUrl ? (
                      <img
                        src={staff.avatarUrl}
                        alt={fullName}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xl font-bold text-muted-foreground">
                        {staff.firstNameEn.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    {position && (
                      <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary mb-1 truncate max-w-full">
                        {position}
                      </span>
                    )}
                    <h2 className="font-bold text-base text-foreground leading-snug">
                      {fullName}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {deptName}
                    </p>
                  </div>
                </div>

                {/* Bio */}
                {bio && (
                  <p className="text-xs text-muted-foreground line-clamp-2 italic mb-4">
                    &ldquo;{bio}&rdquo;
                  </p>
                )}

                {/* Research Interests Tags */}
                {staff.researchInterests.length > 0 && (
                  <div className="mb-4 space-y-1.5">
                    <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                      <Award className="h-3 w-3 text-primary" />
                      {t("staff.researchInterests")}:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {staff.researchInterests.map((interest, i) => (
                        <span
                          key={i}
                          className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education History Preview */}
                {staff.educationHistory.length > 0 && (
                  <div className="mb-4 space-y-1 text-xs border-t border-border/40 pt-3 flex-1">
                    <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1 mb-1">
                      <BookOpen className="h-3 w-3 text-primary" />
                      {t("staff.education")}:
                    </span>
                    {staff.educationHistory.slice(0, 2).map((edu, idx) => (
                      <div key={idx} className="text-[11px] text-muted-foreground">
                        • {edu.degree} ({edu.institution})
                      </div>
                    ))}
                  </div>
                )}

                {/* Contact Footer */}
                <div className="mt-auto border-t border-border/40 pt-3 space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">{staff.email}</span>
                  </div>
                  {staff.phoneNumber && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{staff.phoneNumber}</span>
                    </div>
                  )}
                  {staff.officeRoom && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{staff.officeRoom}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
