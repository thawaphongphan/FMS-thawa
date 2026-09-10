import { describe, it, expect } from "vitest";
import {
  createAcademicTermSchema,
  createClassScheduleSchema,
  createExamScheduleSchema,
} from "./validations";

describe("schedule validations", () => {
  it("validates createAcademicTermSchema successfully", () => {
    const input = {
      year: 2569,
      term: 1,
      nameTh: "ภาคการศึกษาต้น 2569",
      nameEn: "First Semester 2026",
      isCurrent: true,
    };
    const parsed = createAcademicTermSchema.parse(input);
    expect(parsed.year).toBe(2569);
    expect(parsed.term).toBe(1);
    expect(parsed.isCurrent).toBe(true);
  });

  it("validates createClassScheduleSchema successfully", () => {
    const input = {
      termId: "123e4567-e89b-12d3-a456-426614174000",
      courseId: "123e4567-e89b-12d3-a456-426614174001",
      section: "1",
      dayOfWeek: "MONDAY",
      startTime: "09:00",
      endTime: "12:00",
      room: "IT-401",
    };
    const parsed = createClassScheduleSchema.parse(input);
    expect(parsed.dayOfWeek).toBe("MONDAY");
    expect(parsed.startTime).toBe("09:00");
  });

  it("fails createClassScheduleSchema with invalid time format", () => {
    const invalid = {
      termId: "123e4567-e89b-12d3-a456-426614174000",
      courseId: "123e4567-e89b-12d3-a456-426614174001",
      section: "1",
      dayOfWeek: "MONDAY",
      startTime: "9:00", // missing leading zero
      endTime: "12:00",
      room: "IT-401",
    };
    expect(() => createClassScheduleSchema.parse(invalid)).toThrow();
  });

  it("validates createExamScheduleSchema successfully", () => {
    const input = {
      termId: "123e4567-e89b-12d3-a456-426614174000",
      courseId: "123e4567-e89b-12d3-a456-426614174001",
      section: "1",
      examType: "MIDTERM",
      examDate: "2026-10-15",
      startTime: "09:00",
      endTime: "12:00",
      room: "IT-Auditorium",
    };
    const parsed = createExamScheduleSchema.parse(input);
    expect(parsed.examType).toBe("MIDTERM");
    expect(parsed.room).toBe("IT-Auditorium");
  });
});
