import { Suspense } from "react";
import { requirePermission, hasPermission } from "@/features/identity/server";
import { CURRICULUM_P } from "@/features/curriculum";
import { adminListCurricula } from "@/features/curriculum/server";
import { listPublicDepartments } from "@/features/department/server";
import { CurriculumClient } from "./_components/curriculum-client";

export default async function AdminCurriculumPage() {
  const ctx = await requirePermission(CURRICULUM_P.curriculumRead);
  const [initialCurricula, departments] = await Promise.all([
    adminListCurricula(ctx.tenantId),
    listPublicDepartments(ctx.tenantId),
  ]);

  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading curricula...</div>}>
      <CurriculumClient
        initialCurricula={initialCurricula}
        departments={departments}
        canManage={hasPermission(ctx, CURRICULUM_P.curriculumManage)}
      />
    </Suspense>
  );
}
