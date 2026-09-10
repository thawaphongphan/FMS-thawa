"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { STUDENTS_P } from "../permissions";
import { createStudentSchema, updateStudentSchema } from "./validations";
import {
  createStudent,
  updateStudent,
  deleteStudent,
  type StudentRow,
} from "./services";

function revalidateStudentPages() {
  revalidatePath("/admin/students");
  revalidatePath("/statistics");
  revalidatePath("/(portal)/statistics", "page");
  revalidatePath("/", "page");
}

export async function createStudentAction(input: unknown): Promise<ActionResult<StudentRow>> {
  return runAction(async () => {
    const ctx = await requirePermission(STUDENTS_P.studentsManage);
    const parsed = createStudentSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createStudent(ctx.tenantId, parsed);
    revalidateStudentPages();
    return result as unknown as StudentRow;
  });
}

export async function updateStudentAction(input: unknown): Promise<ActionResult<StudentRow>> {
  return runAction(async () => {
    const ctx = await requirePermission(STUDENTS_P.studentsManage);
    const parsed = updateStudentSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateStudent(ctx.tenantId, parsed);
    revalidateStudentPages();
    return result as unknown as StudentRow;
  });
}

export async function deleteStudentAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(STUDENTS_P.studentsManage);
    await deleteStudent(ctx.tenantId, id);
    revalidateStudentPages();
  });
}
