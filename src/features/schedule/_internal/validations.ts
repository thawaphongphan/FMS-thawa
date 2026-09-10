import { z } from "zod";

export const DAYS_OF_WEEK = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

export const EXAM_TYPES = ["MIDTERM", "FINAL"] as const;

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const createAcademicTermSchema = z.object({
  year: z.coerce.number().int().min(2500).max(2700),
  term: z.coerce.number().int().min(1).max(3),
  nameTh: z.string().min(1).max(100),
  nameEn: z.string().min(1).max(100),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  isCurrent: z.boolean().default(false),
});

export const updateAcademicTermSchema = createAcademicTermSchema.extend({
  id: z.string().uuid(),
});

export const createClassScheduleSchema = z.object({
  termId: z.string().uuid(),
  courseId: z.string().uuid(),
  section: z.string().min(1).max(50),
  dayOfWeek: z.enum(DAYS_OF_WEEK),
  startTime: z.string().regex(timeRegex, "Invalid start time (HH:mm)"),
  endTime: z.string().regex(timeRegex, "Invalid end time (HH:mm)"),
  room: z.string().min(1).max(100),
  building: z.string().max(100).optional().nullable(),
  instructorId: z.string().uuid().optional().nullable(),
  instructorName: z.string().max(255).optional().nullable(),
  curriculumId: z.string().uuid().optional().nullable(),
  targetYear: z.coerce.number().int().min(1).max(8).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updateClassScheduleSchema = createClassScheduleSchema.extend({
  id: z.string().uuid(),
});

export const createExamScheduleSchema = z.object({
  termId: z.string().uuid(),
  courseId: z.string().uuid(),
  section: z.string().min(1).max(50).default("ทุกกลุ่ม"),
  examType: z.enum(EXAM_TYPES),
  examDate: z.string().min(1, "Exam date is required"),
  startTime: z.string().regex(timeRegex, "Invalid start time (HH:mm)"),
  endTime: z.string().regex(timeRegex, "Invalid end time (HH:mm)"),
  room: z.string().min(1).max(100),
  seatRange: z.string().max(100).optional().nullable(),
  invigilatorId: z.string().uuid().optional().nullable(),
  invigilatorName: z.string().max(255).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updateExamScheduleSchema = createExamScheduleSchema.extend({
  id: z.string().uuid(),
});

export type CreateAcademicTermInput = z.infer<typeof createAcademicTermSchema>;
export type UpdateAcademicTermInput = z.infer<typeof updateAcademicTermSchema>;
export type CreateClassScheduleInput = z.infer<typeof createClassScheduleSchema>;
export type UpdateClassScheduleInput = z.infer<typeof updateClassScheduleSchema>;
export type CreateExamScheduleInput = z.infer<typeof createExamScheduleSchema>;
export type UpdateExamScheduleInput = z.infer<typeof updateExamScheduleSchema>;
