import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CalendarDays, Eye, User, Pin } from "lucide-react";
import { getLocale, getT } from "@/i18n/server";
import { formatDate } from "@/shared/lib/format";
import { getDefaultTenantId } from "@/shared/lib/portal-tenant";
import { getArticleBySlug } from "@/features/news/server";
import { trackArticleViewAction } from "@/features/news/actions";
import { Button } from "@/components/ui/button";

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getLocale();
  const t = await getT();
  const tenantId = await getDefaultTenantId();

  const article = await getArticleBySlug(tenantId, slug);
  if (!article) notFound();

  // Increment view count asynchronously
  trackArticleViewAction(tenantId, article.id).catch(() => {});

  const title = locale === "th" ? article.titleTh : article.titleEn;
  const content = locale === "th" ? article.contentTh : article.contentEn;
  const summary = locale === "th" ? article.summaryTh : article.summaryEn;
  const categoryName = locale === "th" ? article.categoryNameTh : article.categoryNameEn;

  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      {/* Back button */}
      <div>
        <Link href="/news">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            {t("news.backToList")}
          </Button>
        </Link>
      </div>

      {/* Article Header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {categoryName}
          </span>
          {article.pinned && (
            <span className="flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
              <Pin className="h-3 w-3" />
              {t("news.pinned")}
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
          {title}
        </h1>

        {summary && (
          <p className="text-lg text-muted-foreground leading-relaxed italic border-l-4 border-primary/40 pl-4">
            {summary}
          </p>
        )}

        {/* Metadata row */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-y border-border/50 py-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-primary" />
              {formatDate(article.publishedAt, locale, { time: true })}
            </span>
            {article.authorName && (
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4 text-primary" />
                {article.authorName}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-primary" />
              {article.viewCount} {t("news.viewCount")}
            </span>
          </div>
        </div>
      </div>

      {/* Cover Image */}
      {article.coverImageUrl && (
        <div className="overflow-hidden rounded-2xl border border-border/60 shadow-md">
          <div className="relative w-full aspect-video max-h-[500px]">
            <Image
              src={article.coverImageUrl}
              alt={title}
              fill
              unoptimized
              className="object-cover"
              priority
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="prose prose-neutral dark:prose-invert max-w-none text-base sm:text-lg leading-relaxed space-y-6">
        {content.split("\n\n").map((para, i) => (
          <p key={i} className="text-foreground/90">{para}</p>
        ))}
      </div>

      {/* Bottom Footer Actions */}
      <div className="border-t border-border/60 pt-8 flex items-center justify-between">
        <Link href="/news">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t("news.backToList")}
          </Button>
        </Link>
      </div>
    </article>
  );
}
