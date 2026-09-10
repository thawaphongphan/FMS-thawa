import { z } from "zod";

export const EMPLOYMENT_STATUSES = [
  "EMPLOYED",
  "STUDYING",
  "ENTREPRENEUR",
  "JOB_SEEKING",
  "OTHER",
] as const;

export const createAlumniSchema = z.object({
  studentId: z.string().min(1).max(50),
  titleTh: z.string().min(1).max(50),
  titleEn: z.string().min(1).max(50),
  firstNameTh: z.string().min(1).max(100),
  lastNameTh: z.string().min(1).max(100),
  firstNameEn: z.string().min(1).max(100),
  lastNameEn: z.string().min(1).max(100),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).default("MALE"),
  curriculumId: z.string().uuid(),
  degreeLevel: z.enum(["BACHELOR", "MASTER", "DOCTORATE", "CERTIFICATE", "TRAINING"]).default("BACHELOR"),
  graduationYear: z.coerce.number().int().min(2500).max(2700),
  generation: z.coerce.number().int().optional().nullable(),
  gpa: z.coerce.number().min(0).max(4).optional().nullable(),
  employmentStatus: z.enum(EMPLOYMENT_STATUSES).default("EMPLOYED"),
  jobTitle: z.string().max(255).optional().nullable(),
  company: z.string().max(255).optional().nullable(),
  industry: z.string().max(150).optional().nullable(),
  salaryRange: z.string().max(100).optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  phoneNumber: z.string().max(50).optional().nullable(),
  linkedinUrl: z.string().url().optional().nullable().or(z.literal("")),
  avatarUrl: z.string().url().optional().nullable().or(z.literal("")),
  isFeatured: z.boolean().default(false),
  featuredStoryTh: z.string().optional().nullable(),
  featuredStoryEn: z.string().optional().nullable(),
});

export const updateAlumniSchema = createAlumniSchema.extend({
  id: z.string().uuid(),
});

export type CreateAlumniInput = z.infer<typeof createAlumniSchema>;
export type UpdateAlumniInput = z.infer<typeof updateAlumniSchema>;
