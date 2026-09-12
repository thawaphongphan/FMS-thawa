import { z } from "zod";

export const degreeLevelSchema = z.enum(["BACHELOR", "MASTER", "DOCTORATE", "CERTIFICATE", "TRAINING"]);

export const curriculumDetailsSchema = z.object({
  philosophyTh: z.string().trim().max(3000).default(""),
  philosophyEn: z.string().trim().max(3000).default(""),
  objectivesTh: z.array(z.string().trim()).default([]),
  objectivesEn: z.array(z.string().trim()).default([]),
  careerPathsTh: z.array(z.string().trim()).default([]),
  careerPathsEn: z.array(z.string().trim()).default([]),
  admissionCriteriaTh: z.string().trim().max(3000).default(""),
  admissionCriteriaEn: z.string().trim().max(3000).default(""),
  englishProficiencyRequirements: z.string().trim().max(2000).default(""),
  studyPlansSummaryTh: z.string().trim().max(3000).default(""),
  studyPlansSummaryEn: z.string().trim().max(3000).default(""),
  tuitionFeeEstimate: z.string().trim().max(500).default(""),
});

export const createCurriculumSchema = z.object({
  departmentId: z.string().uuid().optional().nullable().or(z.literal("")),
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
  details: curriculumDetailsSchema.optional(),
  isActive: z.boolean().default(true),
});

export const updateCurriculumSchema = createCurriculumSchema.extend({
  id: z.string().uuid(),
});

export type CurriculumDetailsInput = z.infer<typeof curriculumDetailsSchema>;

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
