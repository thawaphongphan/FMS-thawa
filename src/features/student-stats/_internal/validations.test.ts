import { describe, it, expect } from "vitest";
import { createStudentSchema } from "./validations";

describe("student validations", () => {
  it("validates createStudentSchema successfully", () => {
    const input = {
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
    const parsed = createStudentSchema.parse(input);
    expect(parsed.studentId).toBe("67010555");
    expect(parsed.gender).toBe("MALE");
  });
});
