import { getPortalTenant } from "@/shared/lib/portal-tenant";
import { AdminLayoutClient } from "./_components/admin-layout-client";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const tenant = await getPortalTenant().catch(() => null);

  return (
    <AdminLayoutClient tenant={tenant}>
      {children}
    </AdminLayoutClient>
  );
}
