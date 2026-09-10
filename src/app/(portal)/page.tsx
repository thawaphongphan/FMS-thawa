import Link from "next/link";
import {
  ArrowRight,
  Newspaper,
  GraduationCap,
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
      title: locale === "th" ? "หลักสูตรการศึกษา" : "Academic Programs",
      desc: locale === "th" ? "ระดับปริญญาตรี ปริญญาโท และปริญญาเอก ในสาขา AI และซอฟต์แวร์" : "Undergraduate & Graduate programs in AI and Software",
      icon: BookOpen,
      href: "/curriculum",
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      title: locale === "th" ? "ตารางเรียนและตารางสอบ" : "Class & Exam Schedule",
      desc: locale === "th" ? "ค้นหาตารางเรียน ตารางสอบประจำภาคการศึกษาแบบเรียลไทม์" : "Search real-time weekly class timetables and exam schedules",
      icon: Calendar,
      href: "/schedule",
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      title: locale === "th" ? "เครือข่ายศิษย์เก่า" : "Alumni Network",
      desc: locale === "th" ? "ทำเนียบศิษย์เก่าดีเด่น อัปเดตข้อมูลการทำงานและสร้างเครือข่าย" : "Alumni hall of fame, career tracking, and professional network",
      icon: Users,
      href: "/alumni",
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    },
    {
      title: locale === "th" ? "สถิตินิสิตและข้อมูลเชิงลึก" : "Student Analytics",
      desc: locale === "th" ? "แดชบอร์ดสรุปสถิตินิสิต สัดส่วนประชากรศาสตร์ และอัตราการได้งาน" : "Interactive demographic stats, enrollment trends, and metrics",
      icon: BarChart3,
      href: "/statistics",
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden border-b border-border/50 bg-gradient-to-b from-primary/5 via-background to-background py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary mb-6 animate-pulse">
            <span>✨ {locale === "th" ? "เปิดรับสมัครนักศึกษาใหม่ ปีการศึกษา 2569" : "Admissions Open for AY 2026"}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-tight">
            {locale === "th"
              ? "ศูนย์กลางการเรียนรู้และนวัตกรรมดิจิทัลแห่งอนาคต"
              : "Empowering Next-Gen Digital Innovation & Technology"}
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {locale === "th"
              ? "พัฒนาทักษะด้านปัญญาประดิษฐ์ วิศวกรรมซอฟต์แวร์ และวิทยาการข้อมูล ด้วยมาตรฐานระดับสากลและงานวิจัยที่ตอบโจทย์สังคม"
              : "Fostering excellence in Artificial Intelligence, Software Engineering, and Data Science through world-class curricula and research."}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/news">
              <Button size="lg" className="gap-2 shadow-md">
                <Newspaper className="h-4 w-4" />
                {locale === "th" ? "ติดตามข่าวประชาสัมพันธ์" : "Latest Announcements"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/staff">
              <Button size="lg" variant="outline" className="gap-2">
                <GraduationCap className="h-4 w-4" />
                {locale === "th" ? "ทำเนียบคณาจารย์" : "Meet Our Faculty"}
              </Button>
            </Link>
            <Link href="/mock-hero">
              <Button size="lg" variant="secondary" className="gap-2 border border-primary/30 hover:border-primary/60 bg-gradient-to-r from-amber-500/10 via-primary/10 to-purple-500/10">
                <span className="text-amber-500">✨</span>
                {locale === "th" ? "สัมผัส Cinematic Hero (ASME)" : "Try Cinematic Hero (ASME)"}
              </Button>
            </Link>
          </div>

          {/* Quick KPI stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto border-t border-border/60 pt-10">
            <div>
              <div className="text-3xl font-bold text-primary">1,200+</div>
              <div className="text-xs text-muted-foreground mt-1">{locale === "th" ? "นิสิตในสังกัด" : "Enrolled Students"}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">3</div>
              <div className="text-xs text-muted-foreground mt-1">{locale === "th" ? "ภาควิชาเชี่ยวชาญ" : "Departments"}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">98.5%</div>
              <div className="text-xs text-muted-foreground mt-1">{locale === "th" ? "อัตราการมีงานทำ" : "Employment Rate"}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">50+</div>
              <div className="text-xs text-muted-foreground mt-1">{locale === "th" ? "ผลงานวิจัยระดับสากล" : "Intl. Publications"}</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Platform Core Pillars */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {locale === "th" ? "บริการสำหรับนิสิตและบุคคลทั่วไป" : "Faculty Services & Portals"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {locale === "th" ? "เข้าถึงระบบข้อมูลสำคัญของคณะได้อย่างสะดวกรวดเร็ว" : "Quick access to essential faculty resources and services"}
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
              {locale === "th" ? "ดูข่าวทั้งหมด" : "View All"}
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
                    <img
                      src={article.coverImageUrl}
                      alt={title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
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
              {locale === "th" ? "ผู้บริหารและคณาจารย์ประจำคณะ" : "Faculty Leadership"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("staff.subtitle")}
            </p>
          </div>
          <Link href="/staff">
            <Button variant="ghost" size="sm" className="gap-1 text-primary">
              {locale === "th" ? "ดูทำเนียบทั้งหมด" : "Full Directory"}
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
                    <img
                      src={staff.avatarUrl}
                      alt={fullName}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
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
