"use server";
import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { P } from "../../permissions";
import { requirePermission } from "../rbac";
import { updateSettingsSchema, testGmailSmtpSchema, testGeminiSchema } from "../validations/settings";
import { getTenantSettings, updateTenantSettings, getTenantGeminiConfig, type TenantSettings } from "../services/tenant.service";
import { testSmtpConnection } from "@/shared/lib/infra/mailer";
import { testGeminiConnection } from "@/shared/lib/infra/gemini";

import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { errors } from "@/shared/lib/errors";

export async function testGeminiAction(input: unknown): Promise<ActionResult<{ success: boolean }>> {
  return runAction(async () => {
    const ctx = await requirePermission(P.settingsManage);
    const parsed = testGeminiSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    let apiKey = parsed.apiKey?.trim();
    let model = parsed.model?.trim() || "gemini-2.5-flash";

    if (!apiKey) {
      const current = await getTenantGeminiConfig(ctx.tenantId);
      if (current?.apiKey) {
        apiKey = current.apiKey;
        model = current.model || model;
      }
    }

    if (!apiKey) {
      throw new Error("api_key_required");
    }

    const res = await testGeminiConnection({ apiKey, model });
    if (!res.success) {
      throw new Error(res.error || "Failed to connect to Gemini API");
    }
    return { success: true };
  });
}

export async function testGmailSmtpAction(input: unknown): Promise<ActionResult<{ success: boolean }>> {
  return runAction(async () => {
    await requirePermission(P.settingsManage);
    const parsed = testGmailSmtpSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const from = parsed.fromName ? `${parsed.fromName} <${parsed.user}>` : parsed.user;
    const res = await testSmtpConnection(
      {
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        user: parsed.user,
        pass: parsed.pass,
        from,
      },
      parsed.recipientEmail
    );
    if (!res.success) {
      throw new Error(res.error || "Failed to connect to Gmail SMTP");
    }
    return { success: true };
  });
}

export async function getSettingsAction(): Promise<ActionResult<TenantSettings>> {
  return runAction(async () => getTenantSettings((await requirePermission(P.settingsManage)).tenantId));
}
export async function updateSettingsAction(input: unknown): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(P.settingsManage);
    await updateTenantSettings({ tenantId: ctx.tenantId, actorId: ctx.userId, ...updateSettingsSchema.parse(input, { error: zodErrorMap(await getLocale()) }) });
    revalidatePath("/", "layout");
    revalidatePath("/(portal)", "layout");
    revalidatePath("/(admin)", "layout");
    revalidatePath("/settings");
    revalidatePath("/dashboard");
    revalidatePath("/");
  });
}

export async function uploadLogoAction(formData: FormData): Promise<ActionResult<{ url: string }>> {
  return runAction(async () => {
    await requirePermission(P.settingsManage);
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      throw errors.validation("no_file");
    }

    const ALLOWED_TYPES: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
    };

    const ext = ALLOWED_TYPES[file.type];
    if (!ext) {
      throw errors.validation("invalid_file_type");
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      throw errors.validation("file_too_large");
    }

    const filename = `logo-${crypto.randomUUID()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "logos");

    await fs.mkdir(uploadDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(uploadDir, filename), buffer);

    return { url: `/uploads/logos/${filename}` };
  });
}
