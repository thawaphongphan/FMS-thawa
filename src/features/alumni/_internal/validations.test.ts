import { describe, it, expect } from "vitest";
import { createAlumniSchema } from "./validations";

describe("alumni validations", () => {
  it("validates createAlumniSchema successfully", () => {
    const input = {
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
    const parsed = createAlumniSchema.parse(input);
    expect(parsed.studentId).toBe("64010123");
    expect(parsed.company).toBe("Google");
    expect(parsed.isFeatured).toBe(true);
  });
});
