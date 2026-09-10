import { z } from "zod";

export const degreeLevelSchema = z.enum(["BACHELOR", "MASTER", "DOCTORATE", "CERTIFICATE", "TRAINING"]);

export const createCurriculumSchema = z.object({
  degreeLevel: degreeLevelSchema.default("BACHELOR"),
  programCode: z.string().min(2).max(50),
  nameTh: z.string().min(3).max(255),
  nameEn: z.string().min(3).max(255),
  degreeTitleTh: z.string().min(3).max(255),
  degreeTitleEn: z.string().min(3).max(255),
  totalCredits: z.coerce.number().int().min(0),
  durationYears: z.coerce.number().int().min(0).max(120).default(4),
  revisedYear: z.coerce.number().int().min(2500).max(2650),
  brochureUrl: z.string().url().optional().nullable().or(z.literal("")),
  isActive: z.boolean().default(true),
});

export const updateCurriculumSchema = createCurriculumSchema.extend({
  id: z.string().uuid(),
});

export const createCourseSchema = z.object({
  courseCode: z.string().min(3).max(50),
  nameTh: z.string().min(3).max(255),
  nameEn: z.string().min(3).max(255),
  credits: z.string().min(1).max(20),
  descriptionTh: z.string().optional().nullable(),
  descriptionEn: z.string().optional().nullable(),
});

export type CreateCurriculumInput = z.infer<typeof createCurriculumSchema>;
export type UpdateCurriculumInput = z.infer<typeof updateCurriculumSchema>;
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
