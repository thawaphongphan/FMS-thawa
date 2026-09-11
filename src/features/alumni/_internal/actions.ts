"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission, writeAudit } from "@/features/identity/server";
import { getDefaultTenantId } from "@/shared/lib/portal-tenant";
import { ALUMNI_P } from "../permissions";
import { createAlumniSchema, updateAlumniSchema } from "./validations";
import {
  createAlumni,
  updateAlumni,
  deleteAlumni,
  type AlumniRow,
} from "./services";

function revalidateAlumniPages() {
  revalidatePath("/admin/alumni");
  revalidatePath("/alumni");
  revalidatePath("/(portal)/alumni", "page");
  revalidatePath("/statistics");
  revalidatePath("/(portal)/statistics", "page");
  revalidatePath("/", "page");
}

export async function createAlumniAction(input: unknown): Promise<ActionResult<AlumniRow>> {
  return runAction(async () => {
    const ctx = await requirePermission(ALUMNI_P.alumniManage);
    const parsed = createAlumniSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createAlumni(ctx.tenantId, parsed);
    await writeAudit({
      tenantId: ctx.tenantId,
      actorId: ctx.userId,
      action: "alumni.create",
      entity: "alumni_profile",
      entityId: result.id,
      after: parsed,
    });
    revalidateAlumniPages();
    return result;
  });
}

export async function updateAlumniAction(input: unknown): Promise<ActionResult<AlumniRow>> {
  return runAction(async () => {
    const ctx = await requirePermission(ALUMNI_P.alumniManage);
    const parsed = updateAlumniSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateAlumni(ctx.tenantId, parsed);
    await writeAudit({
      tenantId: ctx.tenantId,
      actorId: ctx.userId,
      action: "alumni.update",
      entity: "alumni_profile",
      entityId: result.id,
      after: parsed,
    });
    revalidateAlumniPages();
    return result;
  });
}

export async function deleteAlumniAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(ALUMNI_P.alumniManage);
    await deleteAlumni(ctx.tenantId, id);
    await writeAudit({
      tenantId: ctx.tenantId,
      actorId: ctx.userId,
      action: "alumni.delete",
      entity: "alumni_profile",
      entityId: id,
    });
    revalidateAlumniPages();
  });
}

/** Public action for alumni to report their status */
export async function registerAlumniAction(input: unknown): Promise<ActionResult<AlumniRow>> {
  return runAction(async () => {
    const tenantId = await getDefaultTenantId();
    const parsed = createAlumniSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createAlumni(tenantId, parsed);
    await writeAudit({
      tenantId,
      actorId: null,
      action: "alumni.register_public",
      entity: "alumni_profile",
      entityId: result.id,
      after: parsed,
    });
    revalidateAlumniPages();
    return result;
  });
}
