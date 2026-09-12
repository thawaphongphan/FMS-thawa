import { describe, it, expect } from "vitest";
import { createCurriculumSchema, updateCurriculumSchema } from "./validations";

describe("curriculum validations", () => {
  it("validate createCurriculumSchema successfully with valid input", () => {
    const valid = {
      departmentId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
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
    expect(result.departmentId).toBe("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11");
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

  it("validates curriculum with extended TQF 2 details", () => {
    const validWithDetails = {
      degreeLevel: "MASTER" as const,
      programCode: "629-MBD",
      nameTh: "หลักสูตรพุทธศาสตรมหาบัณฑิต สาขาวิชาพระธรรมทูต",
      nameEn: "Master of Buddhism Program in Dhammaduta",
      degreeTitleTh: "พุทธศาสตรมหาบัณฑิต (พระธรรมทูต)",
      degreeTitleEn: "Master of Buddhism (Dhammaduta)",
      totalCredits: 39,
      durationYears: 2,
      revisedYear: 2566,
      details: {
        philosophyTh: "มุ่งสร้างบัณฑิตให้มีความรู้ความเข้าใจหลักพุทธธรรมและศาสตร์สมัยใหม่",
        philosophyEn: "Aims to produce graduates...",
        objectivesTh: ["เพื่อผลิตมหาบัณฑิตที่มีความรู้...", "เพื่อพัฒนาทักษะ..."],
        objectivesEn: ["To produce graduates..."],
        careerPathsTh: ["พระธรรมทูต", "นักเผยแผ่พระพุทธศาสนา"],
        careerPathsEn: ["Dhammaduta monk"],
        admissionCriteriaTh: "สำเร็จการศึกษาระดับปริญญาตรี GPA >= 2.50",
        admissionCriteriaEn: "Bachelor's degree GPA >= 2.50",
        englishProficiencyRequirements: "MCU-GET >= 240, TOEFL >= 550",
        studyPlansSummaryTh: "แผน 1.1: วิทยานิพนธ์ 39 หน่วยกิต\nแผน 1.2: รายวิชา 27 + วิทยานิพนธ์ 12",
        studyPlansSummaryEn: "Plan 1.1: Thesis 39 credits",
        tuitionFeeEstimate: "ประมาณ 120,000 บาท",
      },
    };
    const parsed = createCurriculumSchema.parse(validWithDetails);
    expect(parsed.details?.philosophyTh).toContain("มุ่งสร้างบัณฑิต");
    expect(parsed.details?.careerPathsTh).toHaveLength(2);
    expect(parsed.details?.englishProficiencyRequirements).toBe("MCU-GET >= 240, TOEFL >= 550");
  });
});
