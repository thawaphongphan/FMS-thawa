"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { STAFF_P } from "../permissions";
import { createStaffSchema, updateStaffSchema } from "./validations";
import {
  createStaff,
  updateStaff,
  deleteStaff,
  adminListStaff,
  listDepartments,
  type StaffProfileDto,
  type DepartmentDto,
} from "./services";

export async function adminListStaffAction(): Promise<ActionResult<StaffProfileDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(STAFF_P.staffRead);
    return adminListStaff(ctx.tenantId);
  });
}

export async function listDepartmentsAction(): Promise<ActionResult<DepartmentDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(STAFF_P.staffRead);
    return listDepartments(ctx.tenantId);
  });
}

export async function createStaffAction(input: unknown): Promise<ActionResult<StaffProfileDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(STAFF_P.staffManage);
    const parsed = createStaffSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createStaff(ctx.tenantId, parsed);
    revalidatePath("/admin/staff");
    revalidatePath("/staff");
    revalidatePath("/(portal)/staff", "page");
    revalidatePath("/", "page");
    return result;
  });
}

export async function updateStaffAction(input: unknown): Promise<ActionResult<StaffProfileDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(STAFF_P.staffManage);
    const parsed = updateStaffSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateStaff(ctx.tenantId, parsed);
    revalidatePath("/admin/staff");
    revalidatePath("/staff");
    revalidatePath("/(portal)/staff", "page");
    revalidatePath("/", "page");
    return result;
  });
}

export async function deleteStaffAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(STAFF_P.staffManage);
    await deleteStaff(ctx.tenantId, id);
    revalidatePath("/admin/staff");
    revalidatePath("/staff");
    revalidatePath("/(portal)/staff", "page");
    revalidatePath("/", "page");
  });
}
