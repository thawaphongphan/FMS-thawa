import { prisma } from "@/shared/lib/infra/prisma";

export interface PortalTenantInfo {
  id: string;
  nameTh: string;
  nameEn: string;
  logoUrl: string | null;
}

export async function getPortalTenant(): Promise<PortalTenantInfo> {
  const tenant = await prisma.tenant.findFirst({
    where: { isActive: true },
    orderBy: [{ userTenants: { _count: "desc" } }, { createdAt: "desc" }],
    select: { id: true, nameTh: true, nameEn: true, logoUrl: true },
  });
  if (tenant) return tenant;
  const firstTenant = await prisma.tenant.findFirst({
    select: { id: true, nameTh: true, nameEn: true, logoUrl: true },
  });
  if (!firstTenant) throw new Error("No tenant configured in database");
  return firstTenant;
}

export async function getDefaultTenantId(): Promise<string> {
  const tenant = await getPortalTenant();
  return tenant.id;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUuid(id: unknown): id is string {
  return typeof id === "string" && UUID_REGEX.test(id);
}

export async function getTenantById(id: string): Promise<PortalTenantInfo | null> {
  if (!isValidUuid(id)) return null;
  return prisma.tenant.findUnique({
    where: { id },
    select: { id: true, nameTh: true, nameEn: true, logoUrl: true },
  });
}
