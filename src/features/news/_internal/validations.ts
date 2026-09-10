import { z } from "zod";

export const articleStatusSchema = z.enum(["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"]);

export const createArticleSchema = z.object({
  titleTh: z.string().min(3).max(255),
  titleEn: z.string().min(3).max(255),
  slug: z.string().min(3).max(255).regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
  categoryId: z.string().uuid(),
  summaryTh: z.string().optional().nullable(),
  summaryEn: z.string().optional().nullable(),
  contentTh: z.string().min(10),
  contentEn: z.string().min(10),
  coverImageUrl: z.string().url().optional().nullable().or(z.literal("")),
  status: articleStatusSchema.default("DRAFT"),
  pinned: z.boolean().default(false),
  publishedAt: z.string().datetime().optional().nullable(),
});

export const updateArticleSchema = createArticleSchema.extend({
  id: z.string().uuid(),
});

export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
