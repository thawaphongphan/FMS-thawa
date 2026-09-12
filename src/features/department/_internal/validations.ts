import { z } from "zod";

export const createDepartmentSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2)
    .max(50)
    .regex(/^[A-Za-z0-9_-]+$/, "Code must contain only letters, numbers, hyphens, or underscores")
    .transform((val) => val.toUpperCase()),
  nameTh: z.string().trim().min(2).max(150),
  nameEn: z.string().trim().min(2).max(150),
  description: z.string().trim().max(500).optional().nullable().or(z.literal("")),
  orderIndex: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const updateDepartmentSchema = z.object({
  id: z.string().uuid(),
  code: z
    .string()
    .trim()
    .min(2)
    .max(50)
    .regex(/^[A-Za-z0-9_-]+$/, "Code must contain only letters, numbers, hyphens, or underscores")
    .transform((val) => val.toUpperCase()),
  nameTh: z.string().trim().min(2).max(150),
  nameEn: z.string().trim().min(2).max(150),
  description: z.string().trim().max(500).optional().nullable().or(z.literal("")),
  orderIndex: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const deleteDepartmentSchema = z.object({
  id: z.string().uuid(),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
export type DeleteDepartmentInput = z.infer<typeof deleteDepartmentSchema>;
