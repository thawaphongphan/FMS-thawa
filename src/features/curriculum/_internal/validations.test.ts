import { describe, it, expect } from "vitest";
import { createCurriculumSchema, updateCurriculumSchema } from "./validations";

describe("curriculum validations", () => {
  it("validate createCurriculumSchema successfully with valid input", () => {
    const valid = {
      degreeLevel: "BACHELOR" as const,
      programCode: "CS-2569",
      nameTh: "หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์",
      nameEn: "Bachelor of Science in Computer Science",
      degreeTitleTh: "วิทยาศาสตรบัณฑิต (วิทยาการคอมพิวเตอร์)",
      degreeTitleEn: "Bachelor of Science (Computer Science)",
      totalCredits: 132,
      durationYears: 4,
      revisedYear: 2569,
      isActive: true,
    };
    const result = createCurriculumSchema.parse(valid);
    expect(result.programCode).toBe("CS-2569");
    expect(result.totalCredits).toBe(132);
  });

  it("validate createCurriculumSchema successfully with CERTIFICATE and TRAINING", () => {
    const cert = {
      degreeLevel: "CERTIFICATE" as const,
      programCode: "CERT-FSW",
      nameTh: "หลักสูตรประกาศนียบัตรการพัฒนาเว็บฟูลสแตก",
      nameEn: "Certificate Program in Full-Stack Web Development",
      degreeTitleTh: "ประกาศนียบัตรการพัฒนาเว็บฟูลสแตก",
      degreeTitleEn: "Certificate in Full-Stack Web Development",
      totalCredits: 12,
      durationYears: 1,
      revisedYear: 2569,
      isActive: true,
    };
    expect(createCurriculumSchema.parse(cert).degreeLevel).toBe("CERTIFICATE");

    const training = {
      degreeLevel: "TRAINING" as const,
      programCode: "TRAIN-AI",
      nameTh: "โครงการอบรม AI และ Data Science",
      nameEn: "AI and Data Science Training",
      degreeTitleTh: "หนังสือรับรองการผ่านการอบรม",
      degreeTitleEn: "Certificate of Completion",
      totalCredits: 0,
      durationYears: 0,
      revisedYear: 2569,
      isActive: true,
    };
    expect(createCurriculumSchema.parse(training).degreeLevel).toBe("TRAINING");
  });

  it("fails when totalCredits is negative", () => {
    const invalid = {
      degreeLevel: "BACHELOR" as const,
      programCode: "CS-2569",
      nameTh: "หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์",
      nameEn: "Bachelor of Science in Computer Science",
      degreeTitleTh: "วิทยาศาสตรบัณฑิต (วิทยาการคอมพิวเตอร์)",
      degreeTitleEn: "Bachelor of Science (Computer Science)",
      totalCredits: -1,
      durationYears: 4,
      revisedYear: 2569,
    };
    expect(() => createCurriculumSchema.parse(invalid)).toThrow();
  });

  it("validate updateCurriculumSchema requires valid uuid", () => {
    const valid = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      degreeLevel: "BACHELOR" as const,
      programCode: "CS-2569",
      nameTh: "หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์",
      nameEn: "Bachelor of Science in Computer Science",
      degreeTitleTh: "วิทยาศาสตรบัณฑิต (วิทยาการคอมพิวเตอร์)",
      degreeTitleEn: "Bachelor of Science (Computer Science)",
      totalCredits: 132,
      durationYears: 4,
      revisedYear: 2569,
    };
    expect(updateCurriculumSchema.parse(valid).id).toBe("123e4567-e89b-12d3-a456-426614174000");
  });
});
