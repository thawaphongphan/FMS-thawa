import { z } from "zod";

export const staffStatusSchema = z.enum(["ACTIVE", "ON_LEAVE", "RETIRED"]);

export const createStaffSchema = z.object({
  departmentId: z.string().uuid(),
  userId: z.string().uuid().optional().nullable(),
  academicTitleTh: z.string().max(50).default(""),
  academicTitleEn: z.string().max(50).default(""),
  firstNameTh: z.string().min(1).max(100),
  lastNameTh: z.string().max(100).default(""),
  firstNameEn: z.string().min(1).max(100),
  lastNameEn: z.string().max(100).default(""),
  email: z.string().email(),
  phoneNumber: z.string().optional().nullable(),
  officeRoom: z.string().optional().nullable(),
  avatarUrl: z.string().url().optional().nullable().or(z.literal("")),
  adminPositionTh: z.string().optional().nullable(),
  adminPositionEn: z.string().optional().nullable(),
  bioTh: z.string().optional().nullable(),
  bioEn: z.string().optional().nullable(),
  researchInterests: z.array(z.string()).default([]),
  educationHistory: z.array(z.object({
    degree: z.string(),
    field: z.string(),
    institution: z.string(),
    year: z.string().optional(),
  })).default([]),
  orderIndex: z.number().int().default(0),
  status: staffStatusSchema.default("ACTIVE"),
});

export const updateStaffSchema = createStaffSchema.extend({
  id: z.string().uuid(),
});

export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
