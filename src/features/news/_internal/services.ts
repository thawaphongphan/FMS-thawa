import { prisma } from "@/shared/lib/infra/prisma";
import type { Prisma, Article, ArticleCategory } from "@/generated/prisma";
import type { CreateArticleInput, UpdateArticleInput } from "./validations";

export interface ArticleCategoryDto {
  id: string;
  code: string;
  nameTh: string;
  nameEn: string;
  orderIndex: number;
}

export interface ArticleDto {
  id: string;
  tenantId: string;
  categoryId: string;
  categoryCode: string;
  categoryNameTh: string;
  categoryNameEn: string;
  authorId: string | null;
  authorName: string | null;
  slug: string;
  titleTh: string;
  titleEn: string;
  summaryTh: string | null;
  summaryEn: string | null;
  contentTh: string;
  contentEn: string;
  coverImageUrl: string | null;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
  pinned: boolean;
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function listCategories(tenantId: string): Promise<ArticleCategoryDto[]> {
  const cats = await prisma.articleCategory.findMany({
    where: { tenantId },
    orderBy: { orderIndex: "asc" },
  });
  return cats.map((c) => ({
    id: c.id,
    code: c.code,
    nameTh: c.nameTh,
    nameEn: c.nameEn,
    orderIndex: c.orderIndex,
  }));
}

export async function listPublishedArticles(
  tenantId: string,
  categoryCode?: string,
  search?: string
): Promise<ArticleDto[]> {
  const where: Prisma.ArticleWhereInput = {
    tenantId,
    status: "PUBLISHED",
    publishedAt: { lte: new Date() },
  };

  if (categoryCode && categoryCode !== "all") {
    where.category = { code: categoryCode };
  }

  if (search && search.trim()) {
    where.OR = [
      { titleTh: { contains: search.trim(), mode: "insensitive" } },
      { titleEn: { contains: search.trim(), mode: "insensitive" } },
    ];
  }

  const articles = await prisma.article.findMany({
    where,
    include: {
      category: true,
      author: { select: { name: true } },
    },
    orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
  });

  return articles.map(mapArticleToDto);
}

export async function getArticleBySlug(tenantId: string, slug: string): Promise<ArticleDto | null> {
  const article = await prisma.article.findUnique({
    where: { tenantId_slug: { tenantId, slug } },
    include: {
      category: true,
      author: { select: { name: true } },
    },
  });

  if (!article) return null;
  return mapArticleToDto(article);
}

export async function adminListArticles(tenantId: string): Promise<ArticleDto[]> {
  const articles = await prisma.article.findMany({
    where: { tenantId },
    include: {
      category: true,
      author: { select: { name: true } },
    },
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
  });

  return articles.map(mapArticleToDto);
}

export async function createArticle(
  tenantId: string,
  authorId: string | null,
  input: CreateArticleInput
): Promise<ArticleDto> {
  const created = await prisma.article.create({
    data: {
      tenantId,
      authorId,
      categoryId: input.categoryId,
      slug: input.slug,
      titleTh: input.titleTh,
      titleEn: input.titleEn,
      summaryTh: input.summaryTh ?? null,
      summaryEn: input.summaryEn ?? null,
      contentTh: input.contentTh,
      contentEn: input.contentEn,
      coverImageUrl: input.coverImageUrl || null,
      status: input.status,
      pinned: input.pinned,
      publishedAt: input.publishedAt ? new Date(input.publishedAt) : (input.status === "PUBLISHED" ? new Date() : null),
    },
    include: {
      category: true,
      author: { select: { name: true } },
    },
  });

  return mapArticleToDto(created);
}

export async function updateArticle(
  tenantId: string,
  input: UpdateArticleInput
): Promise<ArticleDto> {
  const updated = await prisma.article.update({
    where: { id: input.id, tenantId },
    data: {
      categoryId: input.categoryId,
      slug: input.slug,
      titleTh: input.titleTh,
      titleEn: input.titleEn,
      summaryTh: input.summaryTh ?? null,
      summaryEn: input.summaryEn ?? null,
      contentTh: input.contentTh,
      contentEn: input.contentEn,
      coverImageUrl: input.coverImageUrl || null,
      status: input.status,
      pinned: input.pinned,
      publishedAt: input.publishedAt ? new Date(input.publishedAt) : (input.status === "PUBLISHED" ? new Date() : null),
    },
    include: {
      category: true,
      author: { select: { name: true } },
    },
  });

  return mapArticleToDto(updated);
}

export async function deleteArticle(tenantId: string, id: string): Promise<void> {
  await prisma.article.delete({
    where: { id, tenantId },
  });
}

export async function incrementArticleView(tenantId: string, id: string): Promise<void> {
  await prisma.article.update({
    where: { id, tenantId },
    data: { viewCount: { increment: 1 } },
  });
}

function mapArticleToDto(
  row: Article & { category: ArticleCategory; author?: { name: string } | null }
): ArticleDto {
  return {
    id: row.id,
    tenantId: row.tenantId,
    categoryId: row.categoryId,
    categoryCode: row.category.code,
    categoryNameTh: row.category.nameTh,
    categoryNameEn: row.category.nameEn,
    authorId: row.authorId,
    authorName: row.author?.name ?? null,
    slug: row.slug,
    titleTh: row.titleTh,
    titleEn: row.titleEn,
    summaryTh: row.summaryTh,
    summaryEn: row.summaryEn,
    contentTh: row.contentTh,
    contentEn: row.contentEn,
    coverImageUrl: row.coverImageUrl,
    status: row.status,
    pinned: row.pinned,
    viewCount: row.viewCount,
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
