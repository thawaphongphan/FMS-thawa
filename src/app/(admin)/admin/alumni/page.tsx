import { requirePermission, hasPermission } from "@/features/identity/server";
import {
  ALUMNI_P,
  adminListAlumni,
  listAlumniOptions,
} from "@/features/alumni/server";
import { AlumniClient } from "./_components/alumni-client";

export default async function AdminAlumniPage() {
  const ctx = await requirePermission(ALUMNI_P.alumniRead);
  const [initialAlumni, options] = await Promise.all([
    adminListAlumni(ctx.tenantId),
    listAlumniOptions(ctx.tenantId),
  ]);

  return (
    <AlumniClient
      initialAlumni={initialAlumni}
      options={options}
      canManage={hasPermission(ctx, ALUMNI_P.alumniManage)}
    />
  );
}
