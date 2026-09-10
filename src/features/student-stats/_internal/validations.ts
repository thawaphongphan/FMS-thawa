import { z } from "zod";

export const STUDENT_STATUSES = [
  "ENROLLED",
  "ON_LEAVE",
  "GRADUATED",
  "DISMISSED",
] as const;

export const createStudentSchema = z.object({
  studentId: z.string().min(1).max(50),
  titleTh: z.string().min(1).max(50),
  titleEn: z.string().min(1).max(50),
  firstNameTh: z.string().min(1).max(100),
  lastNameTh: z.string().min(1).max(100),
  firstNameEn: z.string().min(1).max(100),
  lastNameEn: z.string().min(1).max(100),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).default("MALE"),
  nationality: z.string().min(1).max(100).default("ไทย"),
  ethnicity: z.string().min(1).max(100).default("ไทย"),
  religion: z.string().max(100).optional().nullable(),
  domicileRegion: z.string().max(100).optional().nullable(),
  curriculumId: z.string().uuid(),
  degreeLevel: z.enum(["BACHELOR", "MASTER", "DOCTORATE", "CERTIFICATE", "TRAINING"]).default("BACHELOR"),
  admissionYear: z.coerce.number().int().min(2500).max(2700),
  currentYear: z.coerce.number().int().min(1).max(8).default(1),
  status: z.enum(STUDENT_STATUSES).default("ENROLLED"),
  email: z.string().email().optional().nullable().or(z.literal("")),
  phoneNumber: z.string().max(50).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable().or(z.literal("")),
});

export const updateStudentSchema = createStudentSchema.extend({
  id: z.string().uuid(),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
