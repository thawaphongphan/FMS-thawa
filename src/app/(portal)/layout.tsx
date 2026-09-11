import { PortalHeader } from "./_components/portal-header";
import { PortalFooter } from "./_components/portal-footer";
import { getPortalTenant } from "@/shared/lib/portal-tenant";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const tenant = await getPortalTenant();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <PortalHeader tenant={tenant} />
      <main className="flex-1">
        {children}
      </main>
      <PortalFooter tenant={tenant} />
    </div>
  );
}
