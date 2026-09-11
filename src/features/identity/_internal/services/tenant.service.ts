import { cache } from "react";
import { prisma, type Db } from "@/shared/lib/infra/prisma";
import type { Prisma } from "@/generated/prisma";
import { DEFAULT_PALETTE, isPalette, type PaletteId } from "@/shared/lib/palette";
import { errors } from "@/shared/lib/errors";
import { writeAudit } from "../audit";
import type { UpdateSettingsInput } from "../validations/settings";

import type { SmtpConfig } from "@/shared/lib/infra/mailer";

export interface GmailSmtpSettings {
  enabled: boolean;
  user: string;
  pass: string;
  fromName: string;
  [key: string]: unknown;
}

export interface TenantSettings {
  code: string;
  nameTh: string;
  nameEn: string;
  logoUrl: string | null;
  palette: PaletteId;
  smtp?: GmailSmtpSettings;
}

async function readTenantSettings(tenantId: string, db: Db): Promise<TenantSettings> {
  const t = await db.tenant.findUnique({ where: { id: tenantId } });
  if (!t) throw errors.not_found();
  const settingsObj = (t.settings as { palette?: unknown; smtp?: GmailSmtpSettings }) || {};
  const p = settingsObj.palette;
  const smtp = settingsObj.smtp
    ? {
        enabled: !!settingsObj.smtp.enabled,
        user: settingsObj.smtp.user || "",
        pass: settingsObj.smtp.pass || "",
        fromName: settingsObj.smtp.fromName || "",
      }
    : undefined;

  return {
    code: t.code,
    nameTh: t.nameTh,
    nameEn: t.nameEn,
    logoUrl: t.logoUrl,
    palette: isPalette(p) ? p : DEFAULT_PALETTE,
    smtp,
  };
}

export async function getTenantSettings(tenantId: string): Promise<TenantSettings> {
  return readTenantSettings(tenantId, prisma);
}

/** ดึงการตั้งค่า Gmail SMTP สำหรับนำไปส่งอีเมลผ่าน mailer */
export async function getTenantSmtpConfig(tenantId: string): Promise<SmtpConfig | null> {
  const t = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { settings: true, nameTh: true } });
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

/** เก็บคีย์อื่น ๆ ใน settings JSON ไว้ทั้งหมด — merge palette และ smtp ไม่ทับทั้งก้อน */
export async function updateTenantSettings(input: { tenantId: string; actorId: string } & UpdateSettingsInput): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const before = await readTenantSettings(input.tenantId, tx);
    const t = await tx.tenant.findUniqueOrThrow({ where: { id: input.tenantId }, select: { settings: true } });
    const existingSettings = (t.settings as { palette?: unknown; smtp?: GmailSmtpSettings }) || {};

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

    const updatedSettings = {
      ...existingSettings,
      palette: input.palette,
      ...(newSmtp ? { smtp: newSmtp } : {}),
    };

    await tx.tenant.update({
      where: { id: input.tenantId },
      data: {
        nameTh: input.nameTh,
        nameEn: input.nameEn,
        logoUrl: input.logoUrl || null,
        settings: updatedSettings as Prisma.InputJsonObject,
      },
    });

    const auditAfter = {
      ...input,
      smtp: input.smtp ? { ...input.smtp, pass: input.smtp.pass ? "••••••••" : undefined } : undefined,
    };
    await writeAudit({ tenantId: input.tenantId, actorId: input.actorId, action: "tenant.settings_update", entity: "tenant", entityId: input.tenantId, before, after: auditAfter }, tx);
  });
}

export async function getTenantPalette(tenantId: string): Promise<PaletteId> {
  const t = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { settings: true } });
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
