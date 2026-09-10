"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { NEWS_P } from "../permissions";
import { createArticleSchema, updateArticleSchema } from "./validations";
import {
  createArticle,
  updateArticle,
  deleteArticle,
  adminListArticles,
  listCategories,
  incrementArticleView,
  type ArticleDto,
  type ArticleCategoryDto,
} from "./services";

export async function adminListArticlesAction(): Promise<ActionResult<ArticleDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsRead);
    return adminListArticles(ctx.tenantId);
  });
}

export async function listNewsCategoriesAction(): Promise<ActionResult<ArticleCategoryDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsRead);
    return listCategories(ctx.tenantId);
  });
}

export async function createArticleAction(input: unknown): Promise<ActionResult<ArticleDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsManage);
    const parsed = createArticleSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createArticle(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/admin/news");
    revalidatePath("/news");
    revalidatePath("/(portal)/news", "page");
    revalidatePath("/", "page");
    return result;
  });
}

export async function updateArticleAction(input: unknown): Promise<ActionResult<ArticleDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsManage);
    const parsed = updateArticleSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateArticle(ctx.tenantId, parsed);
    revalidatePath("/admin/news");
    revalidatePath("/news");
    revalidatePath("/(portal)/news", "page");
    revalidatePath("/", "page");
    return result;
  });
}

export async function deleteArticleAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsManage);
    await deleteArticle(ctx.tenantId, id);
    revalidatePath("/admin/news");
    revalidatePath("/news");
    revalidatePath("/(portal)/news", "page");
    revalidatePath("/", "page");
  });
}

export async function trackArticleViewAction(tenantId: string, id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    await incrementArticleView(tenantId, id);
  });
}
