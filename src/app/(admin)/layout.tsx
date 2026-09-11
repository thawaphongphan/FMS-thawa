import { auth } from "@/features/identity/server";
import { getPortalTenant, getTenantById } from "@/shared/lib/portal-tenant";
import { AdminLayoutClient } from "./_components/admin-layout-client";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth().catch(() => null);
  const tenantFromSession = session?.tenantId ? await getTenantById(session.tenantId).catch(() => null) : null;
  const tenant = tenantFromSession ?? (await getPortalTenant().catch(() => null));

  return (
    <AdminLayoutClient tenant={tenant}>
      {children}
    </AdminLayoutClient>
  );
}
