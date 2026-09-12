import { cache } from "react";
import { prisma, type Db } from "@/shared/lib/infra/prisma";
import type { Prisma } from "@/generated/prisma";
import { DEFAULT_PALETTE, isPalette, type PaletteId } from "@/shared/lib/palette";
import { errors } from "@/shared/lib/errors";
import { writeAudit } from "../audit";
import type { UpdateSettingsInput } from "../validations/settings";

import type { SmtpConfig } from "@/shared/lib/infra/mailer";
import type { GeminiConfig } from "@/shared/lib/infra/gemini";

export interface GmailSmtpSettings {
  enabled: boolean;
  user: string;
  pass: string;
  fromName: string;
  [key: string]: unknown;
}

export interface GeminiSettings {
  apiKey: string;
  model: string;
  [key: string]: unknown;
}

import type { PortalContactInfo } from "@/shared/lib/portal-tenant";

export type TenantContactSettings = PortalContactInfo;

export interface TenantSettings {
  code: string;
  nameTh: string;
  nameEn: string;
  logoUrl: string | null;
  palette: PaletteId;
  smtp?: GmailSmtpSettings;
  contact?: TenantContactSettings;
  gemini?: GeminiSettings;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isValidUuid(id: unknown): id is string {
  return typeof id === "string" && UUID_REGEX.test(id);
}

async function readTenantSettings(tenantId: string, db: Db): Promise<TenantSettings> {
  let t = isValidUuid(tenantId) ? await db.tenant.findUnique({ where: { id: tenantId } }) : null;
  if (!t) {
    t = await db.tenant.findFirst({
      where: { isActive: true },
      orderBy: [{ userTenants: { _count: "desc" } }, { createdAt: "desc" }],
    });
  }
  if (!t) throw errors.not_found();
  const settingsObj = (t.settings as {
    palette?: unknown;
    smtp?: GmailSmtpSettings;
    contact?: TenantContactSettings;
    gemini?: GeminiSettings;
  }) || {};
  const p = settingsObj.palette;
  const smtp = settingsObj.smtp
    ? {
        enabled: !!settingsObj.smtp.enabled,
        user: settingsObj.smtp.user || "",
        pass: settingsObj.smtp.pass || "",
        fromName: settingsObj.smtp.fromName || "",
      }
    : undefined;
  const contact = settingsObj.contact
    ? {
        addressTh: settingsObj.contact.addressTh || "",
        addressEn: settingsObj.contact.addressEn || "",
        phone: settingsObj.contact.phone || "",
        email: settingsObj.contact.email || "",
        hoursTh: settingsObj.contact.hoursTh || "",
        hoursEn: settingsObj.contact.hoursEn || "",
        facebook: settingsObj.contact.facebook || "",
        line: settingsObj.contact.line || "",
        mapsUrl: settingsObj.contact.mapsUrl || "",
        website: settingsObj.contact.website || "",
      }
    : undefined;
  const gemini = settingsObj.gemini
    ? {
        apiKey: settingsObj.gemini.apiKey || "",
        model: settingsObj.gemini.model || "gemini-2.5-flash",
      }
    : undefined;

  return {
    code: t.code,
    nameTh: t.nameTh,
    nameEn: t.nameEn,
    logoUrl: t.logoUrl,
    palette: isPalette(p) ? p : DEFAULT_PALETTE,
    smtp,
    contact,
    gemini,
  };
}

export async function getTenantSettings(tenantId: string): Promise<TenantSettings> {
  return readTenantSettings(tenantId, prisma);
}

/** ดึงการตั้งค่า Gemini AI สำหรับนำไปใช้แปลเนื้อหาหรือประมวลผล AI */
export async function getTenantGeminiConfig(tenantId: string): Promise<GeminiConfig | null> {
  let t = isValidUuid(tenantId)
    ? await prisma.tenant.findUnique({ where: { id: tenantId }, select: { settings: true } })
    : null;
  if (!t) {
    t = await prisma.tenant.findFirst({
      where: { isActive: true },
      orderBy: [{ userTenants: { _count: "desc" } }, { createdAt: "desc" }],
      select: { settings: true },
    });
  }
  const gemini = (t?.settings as { gemini?: GeminiSettings } | null)?.gemini;
  const apiKey = gemini?.apiKey?.trim() || process.env.GEMINI_API_KEY?.trim() || "";
  if (!apiKey) {
    return null;
  }
  return {
    apiKey,
    model: gemini?.model?.trim() || "gemini-2.5-flash",
  };
}

/** ดึงการตั้งค่า Gmail SMTP สำหรับนำไปส่งอีเมลผ่าน mailer */
export async function getTenantSmtpConfig(tenantId: string): Promise<SmtpConfig | null> {
  let t = isValidUuid(tenantId)
    ? await prisma.tenant.findUnique({ where: { id: tenantId }, select: { settings: true, nameTh: true } })
    : null;
  if (!t) {
    t = await prisma.tenant.findFirst({
      where: { isActive: true },
      orderBy: [{ userTenants: { _count: "desc" } }, { createdAt: "desc" }],
      select: { settings: true, nameTh: true },
    });
  }
  const smtp = (t?.settings as { smtp?: GmailSmtpSettings })?.smtp;
  if (!smtp || !smtp.enabled || !smtp.user || !smtp.pass) {
    return null;
  }
  const from = smtp.fromName ? `${smtp.fromName} <${smtp.user}>` : smtp.user;
  return {
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    user: smtp.user,
    pass: smtp.pass,
    from,
  };
}

/** เก็บคีย์อื่น ๆ ใน settings JSON ไว้ทั้งหมด — merge palette, smtp, gemini ไม่ทับทั้งก้อน */
export async function updateTenantSettings(input: { tenantId: string; actorId: string } & UpdateSettingsInput): Promise<void> {
  await prisma.$transaction(async (tx) => {
    let targetTenantId = input.tenantId;
    const exists = isValidUuid(targetTenantId)
      ? await tx.tenant.findUnique({ where: { id: targetTenantId }, select: { id: true } })
      : null;
    if (!exists) {
      const active = await tx.tenant.findFirst({
        where: { isActive: true },
        orderBy: [{ userTenants: { _count: "desc" } }, { createdAt: "desc" }],
        select: { id: true },
      });
      if (active) targetTenantId = active.id;
    }

    const before = await readTenantSettings(targetTenantId, tx);
    const t = await tx.tenant.findUniqueOrThrow({ where: { id: targetTenantId }, select: { settings: true } });
    const existingSettings = (t.settings as {
      palette?: unknown;
      smtp?: GmailSmtpSettings;
      contact?: TenantContactSettings;
      gemini?: GeminiSettings;
    }) || {};

    let newSmtp = existingSettings.smtp;
    if (input.smtp) {
      const pass = input.smtp.pass.trim() !== "" ? input.smtp.pass.trim() : (existingSettings.smtp?.pass || "");
      newSmtp = {
        enabled: input.smtp.enabled,
        user: input.smtp.user,
        pass,
        fromName: input.smtp.fromName,
      };
    }

    let newContact = existingSettings.contact;
    if (input.contact) {
      newContact = {
        addressTh: input.contact.addressTh || "",
        addressEn: input.contact.addressEn || "",
        phone: input.contact.phone || "",
        email: input.contact.email || "",
        hoursTh: input.contact.hoursTh || "",
        hoursEn: input.contact.hoursEn || "",
        facebook: input.contact.facebook || "",
        line: input.contact.line || "",
        mapsUrl: input.contact.mapsUrl || "",
        website: input.contact.website || "",
      };
    }

    let newGemini = existingSettings.gemini;
    if (input.gemini) {
      const apiKey = input.gemini.apiKey.trim() !== "" ? input.gemini.apiKey.trim() : (existingSettings.gemini?.apiKey || "");
      newGemini = {
        apiKey,
        model: input.gemini.model?.trim() || existingSettings.gemini?.model || "gemini-2.5-flash",
      };
    }

    const updatedSettings = {
      ...existingSettings,
      palette: input.palette,
      ...(newSmtp ? { smtp: newSmtp } : {}),
      ...(newContact ? { contact: newContact } : {}),
      ...(newGemini ? { gemini: newGemini } : {}),
    };

    await tx.tenant.update({
      where: { id: targetTenantId },
      data: {
        nameTh: input.nameTh,
        nameEn: input.nameEn,
        logoUrl: input.logoUrl || null,
        settings: updatedSettings as unknown as Prisma.InputJsonObject,
      },
    });

    const auditAfter = {
      ...input,
      smtp: input.smtp ? { ...input.smtp, pass: input.smtp.pass ? "••••••••" : undefined } : undefined,
      gemini: input.gemini ? { ...input.gemini, apiKey: input.gemini.apiKey ? "••••••••" : undefined } : undefined,
    };
    await writeAudit({ tenantId: targetTenantId, actorId: input.actorId, action: "tenant.settings_update", entity: "tenant", entityId: targetTenantId, before, after: auditAfter }, tx);
  });
}

export async function getTenantPalette(tenantId: string): Promise<PaletteId> {
  const t = isValidUuid(tenantId)
    ? await prisma.tenant.findUnique({ where: { id: tenantId }, select: { settings: true } })
    : null;
  const p = (t?.settings as { palette?: unknown } | null)?.palette;
  return isPalette(p) ? p : DEFAULT_PALETTE;
}

/**
 * tenant ของ session ถ้ามี — import แบบ dynamic เพราะ `../auth` ดึง next-auth ทั้งก้อนเข้ามา และ
 * โมดูลนี้ถูก import จาก root layout ที่รันทุก request · แยก try ของตัวเองไว้ต่างหากโดยเจตนา: เดิมมันอยู่
 * ใน try เดียวกับการอ่านฐานข้อมูล ทำให้ "โหลด auth ไม่ได้" กับ "ฐานข้อมูลล้ม" กลืนหายไปเป็นค่าเดียวกัน
 * และเส้นทางอ่าน tenant ทั้งเส้นทดสอบไม่ได้เลย (ในสภาพแวดล้อมเทสต์ next-auth resolve ไม่ผ่าน)
 */
async function sessionTenantId(): Promise<string | null> {
  try {
    const { auth } = await import("../auth");
    return (await auth())?.tenantId || null;
  } catch {
    return null;
  }
}

/** ใช้โดย root layout ทุก request — tenant จาก session ถ้ามี ไม่งั้น tenant แรก (หน้า login ยังไม่มี session) · ไม่ throw */
export const resolvePalette = cache(async (): Promise<PaletteId> => {
  try {
    const tenantId = (await sessionTenantId()) || (await prisma.tenant.findFirst({ orderBy: { createdAt: "asc" }, select: { id: true } }))?.id;
    return tenantId ? await getTenantPalette(tenantId) : DEFAULT_PALETTE;
  } catch {
    return DEFAULT_PALETTE;
  }
});
