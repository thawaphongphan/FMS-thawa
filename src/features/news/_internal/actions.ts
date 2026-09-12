"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { errors, isAppError } from "@/shared/lib/errors";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission, writeAudit, getTenantGeminiConfig } from "@/features/identity/server";
import { translateNewsWithGemini, type TranslateNewsOutput } from "@/shared/lib/infra/gemini";
import { NEWS_P } from "../permissions";
import { createArticleSchema, updateArticleSchema, translateNewsSchema } from "./validations";
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

export async function translateNewsWithAiAction(input: unknown): Promise<ActionResult<TranslateNewsOutput>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsManage);
    const parsed = translateNewsSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const geminiConfig = await getTenantGeminiConfig(ctx.tenantId);
    if (!geminiConfig || !geminiConfig.apiKey) {
      throw errors.conflict("gemini_not_configured");
    }
    try {
      const result = await translateNewsWithGemini(geminiConfig, {
        titleTh: parsed.titleTh,
        summaryTh: parsed.summaryTh ?? undefined,
        contentTh: parsed.contentTh,
      });
      return result;
    } catch (err) {
      if (isAppError(err)) throw err;
      const msg = err instanceof Error ? err.message : String(err);
      throw errors.conflict(msg);
    }
  });
}

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
    await writeAudit({
      tenantId: ctx.tenantId,
      actorId: ctx.userId,
      action: "article.create",
      entity: "article",
      entityId: result.id,
      after: parsed,
    });
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
    await writeAudit({
      tenantId: ctx.tenantId,
      actorId: ctx.userId,
      action: "article.update",
      entity: "article",
      entityId: result.id,
      after: parsed,
    });
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
    await writeAudit({
      tenantId: ctx.tenantId,
      actorId: ctx.userId,
      action: "article.delete",
      entity: "article",
      entityId: id,
    });
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
