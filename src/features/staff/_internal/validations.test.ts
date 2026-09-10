import { describe, it, expect } from "vitest";
import { createStaffSchema, updateStaffSchema } from "./validations";

describe("staff validations", () => {
  it("validate createStaffSchema successfully with valid input", () => {
    const valid = {
      departmentId: "123e4567-e89b-12d3-a456-426614174000",
      academicTitleTh: "ศ.ดร.",
      academicTitleEn: "Prof. Dr.",
      firstNameTh: "สมชาย",
      lastNameTh: "วิชาการดี",
      firstNameEn: "Somchai",
      lastNameEn: "Wichakandee",
      email: "somchai@faculty.ac.th",
      researchInterests: ["AI", "Software Engineering"],
      educationHistory: [
        { degree: "Ph.D.", field: "Computer Science", institution: "MIT", year: "2015" }
      ],
      status: "ACTIVE" as const,
      orderIndex: 1,
    };
    const result = createStaffSchema.parse(valid);
    expect(result.firstNameTh).toBe("สมชาย");
    expect(result.educationHistory).toHaveLength(1);
  });

  it("fails when email is invalid", () => {
    const invalid = {
      departmentId: "123e4567-e89b-12d3-a456-426614174000",
      academicTitleTh: "ศ.ดร.",
      academicTitleEn: "Prof. Dr.",
      firstNameTh: "สมชาย",
      lastNameTh: "วิชาการดี",
      firstNameEn: "Somchai",
      lastNameEn: "Wichakandee",
      email: "invalid-email-format",
    };
    expect(() => createStaffSchema.parse(invalid)).toThrow();
  });

  it("validate updateStaffSchema requires valid id", () => {
    const valid = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      departmentId: "123e4567-e89b-12d3-a456-426614174000",
      academicTitleTh: "รศ.ดร.",
      academicTitleEn: "Assoc. Prof. Dr.",
      firstNameTh: "สมชาย",
      lastNameTh: "วิชาการดี",
      firstNameEn: "Somchai",
      lastNameEn: "Wichakandee",
      email: "somchai@faculty.ac.th",
    };
    expect(updateStaffSchema.parse(valid).id).toBe("123e4567-e89b-12d3-a456-426614174000");
  });
});
