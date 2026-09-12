import { prisma } from "@/shared/lib/infra/prisma";

export interface PortalContactInfo {
  addressTh?: string;
  addressEn?: string;
  phone?: string;
  email?: string;
  hoursTh?: string;
  hoursEn?: string;
  facebook?: string;
  line?: string;
  mapsUrl?: string;
  website?: string;
  [key: string]: unknown;
}

export interface PortalTenantInfo {
  id: string;
  nameTh: string;
  nameEn: string;
  logoUrl: string | null;
  contact?: PortalContactInfo | null;
}

function extractContact(settings: unknown): PortalContactInfo | null {
  if (!settings || typeof settings !== "object") return null;
  const c = (settings as { contact?: PortalContactInfo }).contact;
  if (!c) return null;
  return {
    addressTh: c.addressTh || "",
    addressEn: c.addressEn || "",
    phone: c.phone || "",
    email: c.email || "",
    hoursTh: c.hoursTh || "",
    hoursEn: c.hoursEn || "",
    facebook: c.facebook || "",
    line: c.line || "",
    mapsUrl: c.mapsUrl || "",
    website: c.website || "",
  };
}

export async function getPortalTenant(): Promise<PortalTenantInfo> {
  const tenant = await prisma.tenant.findFirst({
    where: { isActive: true },
    orderBy: [{ userTenants: { _count: "desc" } }, { createdAt: "desc" }],
    select: { id: true, nameTh: true, nameEn: true, logoUrl: true, settings: true },
  });
  if (tenant) {
    return {
      id: tenant.id,
      nameTh: tenant.nameTh,
      nameEn: tenant.nameEn,
      logoUrl: tenant.logoUrl,
      contact: extractContact(tenant.settings),
    };
  }
  const firstTenant = await prisma.tenant.findFirst({
    select: { id: true, nameTh: true, nameEn: true, logoUrl: true, settings: true },
  });
  if (!firstTenant) throw new Error("No tenant configured in database");
  return {
    id: firstTenant.id,
    nameTh: firstTenant.nameTh,
    nameEn: firstTenant.nameEn,
    logoUrl: firstTenant.logoUrl,
    contact: extractContact(firstTenant.settings),
  };
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
  const t = await prisma.tenant.findUnique({
    where: { id },
    select: { id: true, nameTh: true, nameEn: true, logoUrl: true, settings: true },
  });
  if (!t) return null;
  return {
    id: t.id,
    nameTh: t.nameTh,
    nameEn: t.nameEn,
    logoUrl: t.logoUrl,
    contact: extractContact(t.settings),
  };
}
