import { describe, it, expect } from "vitest";
import { createAlumniSchema, updateAlumniSchema, EMPLOYMENT_STATUSES } from "./validations";

describe("alumni validations", () => {
  const validBase = {
    studentId: "64010123",
    titleTh: "นาย",
    titleEn: "Mr.",
    firstNameTh: "กิตติพงษ์",
    lastNameTh: "ใจดี",
    firstNameEn: "Kittipong",
    lastNameEn: "Jaidee",
    gender: "MALE" as const,
    curriculumId: "123e4567-e89b-12d3-a456-426614174000",
    graduationYear: 2568,
    employmentStatus: "EMPLOYED" as const,
    company: "Google",
    jobTitle: "Software Engineer",
    isFeatured: true,
  };

  it("validates createAlumniSchema successfully", () => {
    const parsed = createAlumniSchema.parse(validBase);
    expect(parsed.studentId).toBe("64010123");
    expect(parsed.company).toBe("Google");
    expect(parsed.isFeatured).toBe(true);
    expect(parsed.degreeLevel).toBe("BACHELOR");
  });

  it("validates all supported employment statuses", () => {
    for (const status of EMPLOYMENT_STATUSES) {
      const parsed = createAlumniSchema.parse({
        ...validBase,
        employmentStatus: status,
      });
      expect(parsed.employmentStatus).toBe(status);
    }
  });

  it("validates graduationYear boundaries (2500 - 2700)", () => {
    expect(() => createAlumniSchema.parse({ ...validBase, graduationYear: 2499 })).toThrow();
    expect(() => createAlumniSchema.parse({ ...validBase, graduationYear: 2701 })).toThrow();
    expect(createAlumniSchema.parse({ ...validBase, graduationYear: 2500 }).graduationYear).toBe(2500);
    expect(createAlumniSchema.parse({ ...validBase, graduationYear: 2700 }).graduationYear).toBe(2700);
  });

  it("validates GPA range (0.00 - 4.00)", () => {
    expect(createAlumniSchema.parse({ ...validBase, gpa: 3.75 }).gpa).toBe(3.75);
    expect(createAlumniSchema.parse({ ...validBase, gpa: 0 }).gpa).toBe(0);
    expect(createAlumniSchema.parse({ ...validBase, gpa: 4 }).gpa).toBe(4);
    expect(() => createAlumniSchema.parse({ ...validBase, gpa: -0.1 })).toThrow();
    expect(() => createAlumniSchema.parse({ ...validBase, gpa: 4.01 })).toThrow();
  });

  it("handles optional URLs correctly", () => {
    const withUrls = createAlumniSchema.parse({
      ...validBase,
      linkedinUrl: "https://linkedin.com/in/test",
      avatarUrl: "https://example.com/avatar.jpg",
    });
    expect(withUrls.linkedinUrl).toBe("https://linkedin.com/in/test");
    expect(withUrls.avatarUrl).toBe("https://example.com/avatar.jpg");

    const withEmpty = createAlumniSchema.parse({
      ...validBase,
      linkedinUrl: "",
      avatarUrl: "",
    });
    expect(withEmpty.linkedinUrl).toBe("");
    expect(withEmpty.avatarUrl).toBe("");

    expect(() => createAlumniSchema.parse({ ...validBase, linkedinUrl: "not-a-url" })).toThrow();
  });

  it("validates updateAlumniSchema requiring valid id", () => {
    const validUpdate = {
      ...validBase,
      id: "123e4567-e89b-12d3-a456-426614174000",
    };
    expect(updateAlumniSchema.parse(validUpdate).id).toBe("123e4567-e89b-12d3-a456-426614174000");
    expect(() => updateAlumniSchema.parse(validBase)).toThrow();
    expect(() => updateAlumniSchema.parse({ ...validBase, id: "invalid-id" })).toThrow();
  });
});
