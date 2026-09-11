import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Newspaper,
  Calendar,
  Users,
  BarChart3,
  BookOpen,
  Pin,
  CalendarDays,
  Eye,
} from "lucide-react";
import { getLocale, getT } from "@/i18n/server";
import { formatDate } from "@/shared/lib/format";
import { getDefaultTenantId } from "@/shared/lib/portal-tenant";
import { listPublishedArticles } from "@/features/news/server";
import { listPublicStaff } from "@/features/staff/server";
import { Button } from "@/components/ui/button";
import { CinematicHero } from "./_components/cinematic-hero";

export default async function PortalHomePage() {
  const locale = await getLocale();
  const t = await getT();
  const tenantId = await getDefaultTenantId();

  const [articles, staffList] = await Promise.all([
    listPublishedArticles(tenantId),
    listPublicStaff(tenantId),
  ]);

  const latestArticles = articles.slice(0, 3);
  const leadershipStaff = staffList.slice(0, 3);

  const portalModules = [
    {
      title: t("portal.services.programs.title"),
      desc: t("portal.services.programs.desc"),
      icon: BookOpen,
      href: "/curriculum",
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      title: t("portal.services.schedules.title"),
      desc: t("portal.services.schedules.desc"),
      icon: Calendar,
      href: "/schedule",
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      title: t("portal.services.alumni.title"),
      desc: t("portal.services.alumni.desc"),
      icon: Users,
      href: "/alumni",
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    },
    {
      title: t("portal.services.stats.title"),
      desc: t("portal.services.stats.desc"),
      icon: BarChart3,
      href: "/statistics",
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* 1. Cinematic Hero Section */}
      <CinematicHero />

      {/* 2. Platform Core Pillars */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {t("portal.services.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("portal.services.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {portalModules.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/40 hover:-translate-y-1"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.color} mb-4 transition-transform group-hover:scale-110`}>
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors">
                {item.title}
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                {item.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Featured News & Announcements */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8 border-b border-border/40 pb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {t("news.title")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("news.subtitle")}
            </p>
          </div>
          <Link href="/news">
            <Button variant="ghost" size="sm" className="gap-1 text-primary">
              {t("portal.news.viewAll")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {latestArticles.map((article) => {
            const title = locale === "th" ? article.titleTh : article.titleEn;
            const summary = locale === "th" ? article.summaryTh : article.summaryEn;
            const categoryName = locale === "th" ? article.categoryNameTh : article.categoryNameEn;

            return (
              <article
                key={article.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all hover:shadow-md hover:border-primary/40"
              >
                {/* Cover Image */}
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                  {article.coverImageUrl ? (
                    <Image
                      src={article.coverImageUrl}
                      alt={title}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                      <Newspaper className="h-10 w-10 opacity-40" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="rounded-md bg-background/90 px-2.5 py-1 text-xs font-semibold backdrop-blur text-foreground shadow-sm">
                      {categoryName}
                    </span>
                    {article.pinned && (
                      <span className="flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
                        <Pin className="h-3 w-3" />
                        {t("news.pinned")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatDate(article.publishedAt, locale)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      {article.viewCount}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {title}
                  </h3>

                  <p className="mt-2 text-xs text-muted-foreground line-clamp-3 flex-1 leading-relaxed">
                    {summary}
                  </p>

                  <div className="mt-4 pt-3 border-t border-border/40">
                    <Link
                      href={`/news/${article.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      {t("news.readMore")}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 4. Faculty Leadership Spotlight */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8 border-b border-border/40 pb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {t("portal.staff.title")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("staff.subtitle")}
            </p>
          </div>
          <Link href="/staff">
            <Button variant="ghost" size="sm" className="gap-1 text-primary">
              {t("portal.staff.viewAll")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {leadershipStaff.map((staff) => {
            const fullName = locale === "th" ? staff.fullNameTh : staff.fullNameEn;
            const position = locale === "th" ? staff.adminPositionTh : staff.adminPositionEn;
            const deptName = locale === "th" ? staff.departmentNameTh : staff.departmentNameEn;

            return (
              <div
                key={staff.id}
                className="group rounded-2xl border border-border/60 bg-card p-6 text-center shadow-sm transition-all hover:shadow-md hover:border-primary/40"
              >
                <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-full border-2 border-primary/20 shadow-sm mb-4">
                  {staff.avatarUrl ? (
                    <Image
                      src={staff.avatarUrl}
                      alt={fullName}
                      fill
                      unoptimized
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground text-2xl font-bold">
                      {staff.firstNameEn.charAt(0)}
                    </div>
                  )}
                </div>

                {position && (
                  <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-2">
                    {position}
                  </span>
                )}

                <h3 className="font-bold text-base text-foreground">
                  {fullName}
                </h3>

                <p className="text-xs text-muted-foreground mt-1">
                  {deptName}
                </p>

                <p className="text-xs text-muted-foreground mt-3 line-clamp-2 italic">
                  &ldquo;{locale === "th" ? staff.bioTh : staff.bioEn}&rdquo;
                </p>

                <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <span>{staff.email}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
