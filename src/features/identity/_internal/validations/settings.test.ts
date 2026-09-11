import { describe, it, expect } from "vitest";
import { updateSettingsSchema } from "./settings";

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
});
