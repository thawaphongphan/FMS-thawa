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

export const contactSettingsSchema = z.object({
  addressTh: z.string().trim().max(500).default(""),
  addressEn: z.string().trim().max(500).default(""),
  phone: z.string().trim().max(100).default(""),
  email: z
    .string()
    .trim()
    .refine((val) => val === "" || z.string().email().safeParse(val).success, {
      message: "invalid_email",
    })
    .default(""),
  hoursTh: z.string().trim().max(200).default(""),
  hoursEn: z.string().trim().max(200).default(""),
  facebook: z.string().trim().max(300).default(""),
  line: z.string().trim().max(100).default(""),
  mapsUrl: z
    .string()
    .trim()
    .max(1000)
    .refine((val) => val === "" || /^https?:\/\//.test(val), {
      message: "invalid_url",
    })
    .default(""),
  website: z
    .string()
    .trim()
    .max(500)
    .refine((val) => val === "" || /^https?:\/\//.test(val), {
      message: "invalid_url",
    })
    .default(""),
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
  contact: contactSettingsSchema.optional(),
});
export const updateProfileSchema = z.object({ name: z.string().trim().min(1).max(255), locale: z.enum(["th", "en"]) });
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type GmailSmtpInput = z.infer<typeof gmailSmtpSchema>;
export type TestGmailSmtpInput = z.infer<typeof testGmailSmtpSchema>;
export type ContactSettingsInput = z.infer<typeof contactSettingsSchema>;
