import { describe, it, expect } from "vitest";
import { createStudentSchema, updateStudentSchema } from "./validations";

describe("student validations", () => {
  const validBase = {
    studentId: "67010555",
    titleTh: "นาย",
    titleEn: "Mr.",
    firstNameTh: "อานนท์",
    lastNameTh: "มีชัย",
    firstNameEn: "Arnon",
    lastNameEn: "Meechai",
    gender: "MALE" as const,
    nationality: "ไทย",
    ethnicity: "ไทย",
    curriculumId: "123e4567-e89b-12d3-a456-426614174000",
    admissionYear: 2567,
    currentYear: 2,
  };

  it("validates createStudentSchema successfully", () => {
    const parsed = createStudentSchema.parse(validBase);
    expect(parsed.studentId).toBe("67010555");
    expect(parsed.gender).toBe("MALE");
    expect(parsed.status).toBe("ENROLLED");
    expect(parsed.degreeLevel).toBe("BACHELOR");
  });

  it("fails when required fields are missing or empty", () => {
    expect(() => createStudentSchema.parse({ ...validBase, studentId: "" })).toThrow();
    expect(() => createStudentSchema.parse({ ...validBase, firstNameTh: "" })).toThrow();
    expect(() => createStudentSchema.parse({ ...validBase, curriculumId: "invalid-uuid" })).toThrow();
  });

  it("validates admissionYear boundaries (2500 - 2700)", () => {
    expect(() => createStudentSchema.parse({ ...validBase, admissionYear: 2499 })).toThrow();
    expect(() => createStudentSchema.parse({ ...validBase, admissionYear: 2701 })).toThrow();
    expect(createStudentSchema.parse({ ...validBase, admissionYear: 2500 }).admissionYear).toBe(2500);
    expect(createStudentSchema.parse({ ...validBase, admissionYear: 2700 }).admissionYear).toBe(2700);
  });

  it("validates currentYear boundaries (1 - 8)", () => {
    expect(() => createStudentSchema.parse({ ...validBase, currentYear: 0 })).toThrow();
    expect(() => createStudentSchema.parse({ ...validBase, currentYear: 9 })).toThrow();
    expect(createStudentSchema.parse({ ...validBase, currentYear: 4 }).currentYear).toBe(4);
  });

  it("handles optional email and url correctly", () => {
    const withEmail = createStudentSchema.parse({
      ...validBase,
      email: "student@example.com",
      avatarUrl: "https://example.com/photo.jpg",
    });
    expect(withEmail.email).toBe("student@example.com");
    expect(withEmail.avatarUrl).toBe("https://example.com/photo.jpg");

    const withEmpty = createStudentSchema.parse({
      ...validBase,
      email: "",
      avatarUrl: "",
    });
    expect(withEmpty.email).toBe("");
    expect(withEmpty.avatarUrl).toBe("");

    expect(() => createStudentSchema.parse({ ...validBase, email: "not-an-email" })).toThrow();
  });

  it("validates updateStudentSchema requiring id", () => {
    const validUpdate = {
      ...validBase,
      id: "123e4567-e89b-12d3-a456-426614174000",
    };
    expect(updateStudentSchema.parse(validUpdate).id).toBe("123e4567-e89b-12d3-a456-426614174000");

    expect(() => updateStudentSchema.parse(validBase)).toThrow();
    expect(() => updateStudentSchema.parse({ ...validBase, id: "bad-id" })).toThrow();
  });
});
