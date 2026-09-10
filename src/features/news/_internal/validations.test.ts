import { describe, it, expect } from "vitest";
import { createArticleSchema, updateArticleSchema } from "./validations";

describe("news validations", () => {
  it("validate createArticleSchema successfully with valid input", () => {
    const valid = {
      titleTh: "ข่าวกิจกรรมใหม่",
      titleEn: "New Activity News",
      slug: "new-activity-2026",
      categoryId: "123e4567-e89b-12d3-a456-426614174000",
      contentTh: "เนื้อหาข่าวความยาวมากกว่าสิบตัวอักษร",
      contentEn: "News content with more than ten characters length",
      status: "DRAFT" as const,
      pinned: false,
    };
    const result = createArticleSchema.parse(valid);
    expect(result.titleTh).toBe(valid.titleTh);
    expect(result.slug).toBe("new-activity-2026");
  });

  it("fails when slug contains uppercase letters or spaces", () => {
    const invalid = {
      titleTh: "ข่าวกิจกรรมใหม่",
      titleEn: "New Activity News",
      slug: "New Activity",
      categoryId: "123e4567-e89b-12d3-a456-426614174000",
      contentTh: "เนื้อหาข่าวความยาวมากกว่าสิบตัวอักษร",
      contentEn: "News content with more than ten characters length",
    };
    expect(() => createArticleSchema.parse(invalid)).toThrow();
  });

  it("validate updateArticleSchema requires valid uuid id", () => {
    const valid = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      titleTh: "ข่าวกิจกรรมใหม่",
      titleEn: "New Activity News",
      slug: "new-activity-2026",
      categoryId: "123e4567-e89b-12d3-a456-426614174000",
      contentTh: "เนื้อหาข่าวความยาวมากกว่าสิบตัวอักษร",
      contentEn: "News content with more than ten characters length",
    };
    expect(updateArticleSchema.parse(valid).id).toBe("123e4567-e89b-12d3-a456-426614174000");
  });
});
