import Link from "next/link";
import Image from "next/image";
import { Pin, CalendarDays, Eye, Newspaper, ArrowRight, Search } from "lucide-react";
import { getLocale, getT } from "@/i18n/server";
import { formatDate } from "@/shared/lib/format";
import { getDefaultTenantId } from "@/shared/lib/portal-tenant";
import { listPublishedArticles, listCategories } from "@/features/news/server";

export default async function NewsPortalPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; q?: string }>;
}) {
  const { cat, q } = await searchParams;
  const locale = await getLocale();
  const t = await getT();
  const tenantId = await getDefaultTenantId();

  const [categories, articles] = await Promise.all([
    listCategories(tenantId),
    listPublishedArticles(tenantId, cat, q),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      {/* Page Header */}
      <div className="border-b border-border/60 pb-8 text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          {t("news.title")}
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          {t("news.subtitle")}
        </p>

        {/* Filter & Search Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/news"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                !cat || cat === "all"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {t("news.allCategories")}
            </Link>
            {categories.map((c) => {
              const isActive = cat === c.code;
              const catName = locale === "th" ? c.nameTh : c.nameEn;
              return (
                <Link
                  key={c.id}
                  href={`/news?cat=${c.code}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  {catName}
                </Link>
              );
            })}
          </div>

          {/* Search form */}
          <form method="GET" action="/news" className="relative w-full sm:w-72">
            {cat && <input type="hidden" name="cat" value={cat} />}
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              name="q"
              defaultValue={q ?? ""}
              placeholder={t("news.searchPlaceholder")}
              className="w-full rounded-lg border border-input bg-background pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </form>
        </div>
      </div>

      {/* Articles Grid */}
      {articles.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-dashed border-border p-8">
          <Newspaper className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">{t("news.empty")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((article) => {
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

                  <h2 className="font-bold text-base text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {title}
                  </h2>

                  <p className="mt-2 text-xs text-muted-foreground line-clamp-3 flex-1 leading-relaxed">
                    {summary}
                  </p>

                  <div className="mt-5 pt-3 border-t border-border/40">
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
      )}
    </div>
  );
}
