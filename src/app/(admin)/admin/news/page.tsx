import { requirePermission, hasPermission } from "@/features/identity/server";
import { NEWS_P, adminListArticles, listCategories } from "@/features/news/server";
import { NewsClient } from "./_components/news-client";

export default async function AdminNewsPage() {
  const ctx = await requirePermission(NEWS_P.newsRead);
  const [initialArticles, categories] = await Promise.all([
    adminListArticles(ctx.tenantId),
    listCategories(ctx.tenantId),
  ]);

  return (
    <NewsClient
      initialArticles={initialArticles}
      categories={categories}
      canManage={hasPermission(ctx, NEWS_P.newsManage)}
    />
  );
}
