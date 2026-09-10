import { requirePermission, hasPermission } from "@/features/identity/server";
import { CURRICULUM_P } from "@/features/curriculum";
import { adminListCurricula } from "@/features/curriculum/server";
import { CurriculumClient } from "./_components/curriculum-client";

export default async function AdminCurriculumPage() {
  const ctx = await requirePermission(CURRICULUM_P.curriculumRead);
  const initialCurricula = await adminListCurricula(ctx.tenantId);

  return (
    <CurriculumClient
      initialCurricula={initialCurricula}
      canManage={hasPermission(ctx, CURRICULUM_P.curriculumManage)}
    />
  );
}
