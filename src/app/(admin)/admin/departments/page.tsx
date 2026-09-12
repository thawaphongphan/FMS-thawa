import { requirePermission, hasPermission } from "@/features/identity/server";
import { DEPARTMENT_P } from "@/features/department";
import { adminListDepartments } from "@/features/department/server";
import { DepartmentClient } from "./_components/department-client";

export default async function AdminDepartmentPage() {
  const ctx = await requirePermission(DEPARTMENT_P.departmentRead);
  const initialDepartments = await adminListDepartments(ctx.tenantId);

  return (
    <DepartmentClient
      initialDepartments={initialDepartments}
      canManage={hasPermission(ctx, DEPARTMENT_P.departmentManage)}
    />
  );
}
