import { requirePermission, hasPermission } from "@/features/identity/server";
import { STAFF_P, adminListStaff, listDepartments } from "@/features/staff/server";
import { StaffClient } from "./_components/staff-client";

export default async function AdminStaffPage() {
  const ctx = await requirePermission(STAFF_P.staffRead);
  const [initialStaff, departments] = await Promise.all([
    adminListStaff(ctx.tenantId),
    listDepartments(ctx.tenantId),
  ]);

  return (
    <StaffClient
      initialStaff={initialStaff}
      departments={departments}
      canManage={hasPermission(ctx, STAFF_P.staffManage)}
    />
  );
}
