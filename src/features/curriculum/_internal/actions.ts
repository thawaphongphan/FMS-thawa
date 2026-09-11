"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission, writeAudit } from "@/features/identity/server";
import { CURRICULUM_P } from "../permissions";
import { createCurriculumSchema, updateCurriculumSchema } from "./validations";
import {
  createCurriculum,
  updateCurriculum,
  deleteCurriculum,
  adminListCurricula,
  type CurriculumDto,
} from "./services";

export async function adminListCurriculaAction(): Promise<ActionResult<CurriculumDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumRead);
    return adminListCurricula(ctx.tenantId);
  });
}

export async function createCurriculumAction(input: unknown): Promise<ActionResult<CurriculumDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumManage);
    const parsed = createCurriculumSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createCurriculum(ctx.tenantId, parsed);
    await writeAudit({
      tenantId: ctx.tenantId,
      actorId: ctx.userId,
      action: "curriculum.create",
      entity: "curriculum",
      entityId: result.id,
      after: parsed,
    });
    revalidatePath("/admin/curriculum");
    revalidatePath("/curriculum");
    revalidatePath("/(portal)/curriculum", "page");
    revalidatePath("/", "page");
    return result;
  });
}

export async function updateCurriculumAction(input: unknown): Promise<ActionResult<CurriculumDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumManage);
    const parsed = updateCurriculumSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateCurriculum(ctx.tenantId, parsed);
    await writeAudit({
      tenantId: ctx.tenantId,
      actorId: ctx.userId,
      action: "curriculum.update",
      entity: "curriculum",
      entityId: result.id,
      after: parsed,
    });
    revalidatePath("/admin/curriculum");
    revalidatePath("/curriculum");
    revalidatePath("/(portal)/curriculum", "page");
    revalidatePath("/", "page");
    return result;
  });
}

export async function deleteCurriculumAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(CURRICULUM_P.curriculumManage);
    await deleteCurriculum(ctx.tenantId, id);
    await writeAudit({
      tenantId: ctx.tenantId,
      actorId: ctx.userId,
      action: "curriculum.delete",
      entity: "curriculum",
      entityId: id,
    });
    revalidatePath("/admin/curriculum");
    revalidatePath("/curriculum");
    revalidatePath("/(portal)/curriculum", "page");
    revalidatePath("/", "page");
  });
}
