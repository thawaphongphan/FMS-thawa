import { describe, it, expect } from "vitest";
import { updateSettingsSchema, testGeminiSchema } from "./settings";

describe("settings validations", () => {
  const validBase = {
    nameTh: "มหาวิทยาลัยตัวอย่าง",
    nameEn: "Sample University",
    logoUrl: "",
    palette: "blue" as const,
  };

  it("validates valid settings with empty logoUrl", () => {
    const res = updateSettingsSchema.parse(validBase);
    expect(res.nameTh).toBe("มหาวิทยาลัยตัวอย่าง");
    expect(res.logoUrl).toBe("");
  });

  it("validates valid settings with relative /uploads path", () => {
    const res = updateSettingsSchema.parse({
      ...validBase,
      logoUrl: "/uploads/logos/logo-abc123.png",
    });
    expect(res.logoUrl).toBe("/uploads/logos/logo-abc123.png");
  });

  it("validates valid settings with full https URL", () => {
    const res = updateSettingsSchema.parse({
      ...validBase,
      logoUrl: "https://example.com/logo.png",
    });
    expect(res.logoUrl).toBe("https://example.com/logo.png");
  });

  it("fails when logoUrl is not empty and not a valid path or URL", () => {
    expect(() =>
      updateSettingsSchema.parse({
        ...validBase,
        logoUrl: "invalid-logo-string",
      })
    ).toThrow();
  });

  it("fails when nameTh or nameEn is empty", () => {
    expect(() =>
      updateSettingsSchema.parse({
        ...validBase,
        nameTh: "   ",
      })
    ).toThrow();
    expect(() =>
      updateSettingsSchema.parse({
        ...validBase,
        nameEn: "",
      })
    ).toThrow();
  });

  it("fails when palette is not a recognized palette ID", () => {
    expect(() =>
      updateSettingsSchema.parse({
        ...validBase,
        palette: "unknown-color" as never,
      })
    ).toThrow();
  });

  it("validates valid settings with smtp config", () => {
    const res = updateSettingsSchema.parse({
      ...validBase,
      smtp: {
        enabled: true,
        user: "test@gmail.com",
        pass: "abcd efgh ijkl mnop",
        fromName: "Sample College",
      },
    });
    expect(res.smtp?.enabled).toBe(true);
    expect(res.smtp?.user).toBe("test@gmail.com");
    expect(res.smtp?.pass).toBe("abcd efgh ijkl mnop");
    expect(res.smtp?.fromName).toBe("Sample College");
  });

  it("allows disabled smtp config with empty user", () => {
    const res = updateSettingsSchema.parse({
      ...validBase,
      smtp: {
        enabled: false,
        user: "",
        pass: "",
        fromName: "",
      },
    });
    expect(res.smtp?.enabled).toBe(false);
    expect(res.smtp?.user).toBe("");
  });

  it("validates valid contact settings", () => {
    const res = updateSettingsSchema.parse({
      ...validBase,
      contact: {
        phone: "02-999-8888",
        email: "info@faculty.ac.th",
        addressTh: "123 อาคารเรียนรวม",
        addressEn: "123 Main Building",
        hoursTh: "จันทร์-ศุกร์ 8.30-16.30",
        hoursEn: "Mon-Fri 8:30-16:30",
        facebook: "https://facebook.com/faculty",
        line: "@faculty",
        mapsUrl: "https://maps.app.goo.gl/xyz",
        website: "https://faculty.ac.th",
      },
    });
    expect(res.contact?.phone).toBe("02-999-8888");
    expect(res.contact?.email).toBe("info@faculty.ac.th");
    expect(res.contact?.addressTh).toBe("123 อาคารเรียนรวม");
    expect(res.contact?.mapsUrl).toBe("https://maps.app.goo.gl/xyz");
  });

  it("fails when contact email is invalid", () => {
    expect(() =>
      updateSettingsSchema.parse({
        ...validBase,
        contact: {
          email: "not-an-email",
        },
      })
    ).toThrow();
  });

  it("validates valid gemini settings in updateSettingsSchema", () => {
    const res = updateSettingsSchema.parse({
      ...validBase,
      gemini: {
        apiKey: "AIzaSyFakeKey12345",
        model: "gemini-2.5-flash",
      },
    });
    expect(res.gemini?.apiKey).toBe("AIzaSyFakeKey12345");
    expect(res.gemini?.model).toBe("gemini-2.5-flash");
  });

  it("validates testGeminiSchema with provided or empty key", () => {
    const empty = testGeminiSchema.parse({ apiKey: "" });
    expect(empty.apiKey).toBe("");
    const valid = testGeminiSchema.parse({ apiKey: "AIzaSyFakeKey12345", model: "gemini-1.5-flash" });
    expect(valid.apiKey).toBe("AIzaSyFakeKey12345");
    expect(valid.model).toBe("gemini-1.5-flash");
  });
});

