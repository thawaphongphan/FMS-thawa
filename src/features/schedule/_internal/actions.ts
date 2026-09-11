"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission, writeAudit } from "@/features/identity/server";
import { SCHEDULE_P } from "../permissions";
import {
  createClassScheduleSchema,
  updateClassScheduleSchema,
  createExamScheduleSchema,
  updateExamScheduleSchema,
  createAcademicTermSchema,
  updateAcademicTermSchema,
} from "./validations";
import {
  createClassSchedule,
  updateClassSchedule,
  deleteClassSchedule,
  createExamSchedule,
  updateExamSchedule,
  deleteExamSchedule,
  createAcademicTerm,
  updateAcademicTerm,
  setCurrentAcademicTerm,
  deleteAcademicTerm,
  type ClassSchedule,
  type ExamSchedule,
  type AcademicTerm,
} from "./services";

function revalidateSchedulePages() {
  revalidatePath("/admin/schedule");
  revalidatePath("/schedule");
  revalidatePath("/(portal)/schedule", "page");
  revalidatePath("/", "page");
}

// -------------------------------------------------------------
// Class Schedule Actions
// -------------------------------------------------------------

export async function createClassScheduleAction(input: unknown): Promise<ActionResult<ClassSchedule>> {
  return runAction(async () => {
    const ctx = await requirePermission(SCHEDULE_P.scheduleManage);
    const parsed = createClassScheduleSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createClassSchedule(ctx.tenantId, parsed);
    await writeAudit({
      tenantId: ctx.tenantId,
      actorId: ctx.userId,
      action: "class_schedule.create",
      entity: "class_schedule",
      entityId: result.id,
      after: parsed,
    });
    revalidateSchedulePages();
    return result;
  });
}

export async function updateClassScheduleAction(input: unknown): Promise<ActionResult<ClassSchedule>> {
  return runAction(async () => {
    const ctx = await requirePermission(SCHEDULE_P.scheduleManage);
    const parsed = updateClassScheduleSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateClassSchedule(ctx.tenantId, parsed);
    await writeAudit({
      tenantId: ctx.tenantId,
      actorId: ctx.userId,
      action: "class_schedule.update",
      entity: "class_schedule",
      entityId: result.id,
      after: parsed,
    });
    revalidateSchedulePages();
    return result;
  });
}

export async function deleteClassScheduleAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(SCHEDULE_P.scheduleManage);
    await deleteClassSchedule(ctx.tenantId, id);
    await writeAudit({
      tenantId: ctx.tenantId,
      actorId: ctx.userId,
      action: "class_schedule.delete",
      entity: "class_schedule",
      entityId: id,
    });
    revalidateSchedulePages();
  });
}

// -------------------------------------------------------------
// Exam Schedule Actions
// -------------------------------------------------------------

export async function createExamScheduleAction(input: unknown): Promise<ActionResult<ExamSchedule>> {
  return runAction(async () => {
    const ctx = await requirePermission(SCHEDULE_P.scheduleManage);
    const parsed = createExamScheduleSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createExamSchedule(ctx.tenantId, parsed);
    await writeAudit({
      tenantId: ctx.tenantId,
      actorId: ctx.userId,
      action: "exam_schedule.create",
      entity: "exam_schedule",
      entityId: result.id,
      after: parsed,
    });
    revalidateSchedulePages();
    return result;
  });
}

export async function updateExamScheduleAction(input: unknown): Promise<ActionResult<ExamSchedule>> {
  return runAction(async () => {
    const ctx = await requirePermission(SCHEDULE_P.scheduleManage);
    const parsed = updateExamScheduleSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateExamSchedule(ctx.tenantId, parsed);
    await writeAudit({
      tenantId: ctx.tenantId,
      actorId: ctx.userId,
      action: "exam_schedule.update",
      entity: "exam_schedule",
      entityId: result.id,
      after: parsed,
    });
    revalidateSchedulePages();
    return result;
  });
}

export async function deleteExamScheduleAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(SCHEDULE_P.scheduleManage);
    await deleteExamSchedule(ctx.tenantId, id);
    await writeAudit({
      tenantId: ctx.tenantId,
      actorId: ctx.userId,
      action: "exam_schedule.delete",
      entity: "exam_schedule",
      entityId: id,
    });
    revalidateSchedulePages();
  });
}

// -------------------------------------------------------------
// Academic Term Actions
// -------------------------------------------------------------

export async function createAcademicTermAction(input: unknown): Promise<ActionResult<AcademicTerm>> {
  return runAction(async () => {
    const ctx = await requirePermission(SCHEDULE_P.scheduleManage);
    const parsed = createAcademicTermSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createAcademicTerm(ctx.tenantId, parsed);
    await writeAudit({
      tenantId: ctx.tenantId,
      actorId: ctx.userId,
      action: "academic_term.create",
      entity: "academic_term",
      entityId: result.id,
      after: parsed,
    });
    revalidateSchedulePages();
    return result;
  });
}

export async function updateAcademicTermAction(input: unknown): Promise<ActionResult<AcademicTerm>> {
  return runAction(async () => {
    const ctx = await requirePermission(SCHEDULE_P.scheduleManage);
    const parsed = updateAcademicTermSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateAcademicTerm(ctx.tenantId, parsed);
    await writeAudit({
      tenantId: ctx.tenantId,
      actorId: ctx.userId,
      action: "academic_term.update",
      entity: "academic_term",
      entityId: result.id,
      after: parsed,
    });
    revalidateSchedulePages();
    return result;
  });
}

export async function setCurrentAcademicTermAction(id: string): Promise<ActionResult<AcademicTerm>> {
  return runAction(async () => {
    const ctx = await requirePermission(SCHEDULE_P.scheduleManage);
    const result = await setCurrentAcademicTerm(ctx.tenantId, id);
    await writeAudit({
      tenantId: ctx.tenantId,
      actorId: ctx.userId,
      action: "academic_term.set_current",
      entity: "academic_term",
      entityId: id,
    });
    revalidateSchedulePages();
    return result;
  });
}

export async function deleteAcademicTermAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(SCHEDULE_P.scheduleManage);
    await deleteAcademicTerm(ctx.tenantId, id);
    await writeAudit({
      tenantId: ctx.tenantId,
      actorId: ctx.userId,
      action: "academic_term.delete",
      entity: "academic_term",
      entityId: id,
    });
    revalidateSchedulePages();
  });
}
