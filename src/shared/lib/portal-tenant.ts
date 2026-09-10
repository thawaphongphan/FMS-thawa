import { prisma } from "@/shared/lib/infra/prisma";

export async function getDefaultTenantId(): Promise<string> {
  const tenant = await prisma.tenant.findFirst({
    where: { isActive: true },
    select: { id: true },
  });
  if (!tenant) {
    const firstTenant = await prisma.tenant.findFirst({ select: { id: true } });
    if (!firstTenant) throw new Error("No tenant configured in database");
    return firstTenant.id;
  }
  return tenant.id;
}
