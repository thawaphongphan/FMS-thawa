"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission, writeAudit } from "@/features/identity/server";
import { DEPARTMENT_P } from "../permissions";
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  deleteDepartmentSchema,
} from "./validations";
import {
  createDepartment,
  updateDepartment,
  deleteDepartment,
  adminListDepartments,
  type DepartmentDto,
} from "./services";

export async function adminListDepartmentsAction(): Promise<ActionResult<DepartmentDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(DEPARTMENT_P.departmentRead);
    return adminListDepartments(ctx.tenantId);
  });
}

export async function createDepartmentAction(input: unknown): Promise<ActionResult<DepartmentDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(DEPARTMENT_P.departmentManage);
    const parsed = createDepartmentSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createDepartment(ctx.tenantId, parsed);
    await writeAudit({
      tenantId: ctx.tenantId,
      actorId: ctx.userId,
      action: "department.create",
      entity: "department",
      entityId: result.id,
      after: parsed,
    });
    revalidatePath("/admin/departments");
    revalidatePath("/admin/curriculum");
    revalidatePath("/admin/staff");
    revalidatePath("/curriculum");
    revalidatePath("/staff");
    return result;
  });
}

export async function updateDepartmentAction(input: unknown): Promise<ActionResult<DepartmentDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(DEPARTMENT_P.departmentManage);
    const parsed = updateDepartmentSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateDepartment(ctx.tenantId, parsed);
    await writeAudit({
      tenantId: ctx.tenantId,
      actorId: ctx.userId,
      action: "department.update",
      entity: "department",
      entityId: result.id,
      after: parsed,
    });
    revalidatePath("/admin/departments");
    revalidatePath("/admin/curriculum");
    revalidatePath("/admin/staff");
    revalidatePath("/curriculum");
    revalidatePath("/staff");
    return result;
  });
}

export async function deleteDepartmentAction(input: unknown): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(DEPARTMENT_P.departmentManage);
    const parsed = deleteDepartmentSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    await deleteDepartment(ctx.tenantId, parsed.id);
    await writeAudit({
      tenantId: ctx.tenantId,
      actorId: ctx.userId,
      action: "department.delete",
      entity: "department",
      entityId: parsed.id,
    });
    revalidatePath("/admin/departments");
    revalidatePath("/admin/curriculum");
    revalidatePath("/admin/staff");
    revalidatePath("/curriculum");
    revalidatePath("/staff");
  });
}
