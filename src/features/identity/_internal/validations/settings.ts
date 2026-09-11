import { z } from "zod";
import { PALETTE_IDS } from "@/shared/lib/palette";

export const gmailSmtpSchema = z.object({
  enabled: z.boolean().default(false),
  user: z
    .string()
    .trim()
    .refine((val) => val === "" || z.string().email().safeParse(val).success, {
      message: "invalid_email",
    })
    .default(""),
  pass: z.string().trim().default(""),
  fromName: z.string().trim().max(100).default(""),
});

export const testGmailSmtpSchema = z.object({
  user: z.string().trim().email(),
  pass: z.string().trim().min(1, "pass_required"),
  fromName: z.string().trim().max(100).optional(),
  recipientEmail: z.string().trim().email(),
});

export const updateSettingsSchema = z.object({
  nameTh: z.string().trim().min(1).max(255),
  nameEn: z.string().trim().min(1).max(255),
  logoUrl: z
    .string()
    .trim()
    .max(500)
    .refine((val) => val === "" || val.startsWith("/") || /^https?:\/\//.test(val), {
      message: "invalid_url",
    })
    .default(""),
  palette: z.enum(PALETTE_IDS),
  smtp: gmailSmtpSchema.optional(),
});
export const updateProfileSchema = z.object({ name: z.string().trim().min(1).max(255), locale: z.enum(["th", "en"]) });
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type GmailSmtpInput = z.infer<typeof gmailSmtpSchema>;
export type TestGmailSmtpInput = z.infer<typeof testGmailSmtpSchema>;
