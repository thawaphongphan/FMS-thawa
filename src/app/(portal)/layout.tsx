import { PortalHeader } from "./_components/portal-header";
import { PortalFooter } from "./_components/portal-footer";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <PortalHeader />
      <main className="flex-1">
        {children}
      </main>
      <PortalFooter />
    </div>
  );
}
