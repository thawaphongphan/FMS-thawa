import { describe, it, expect } from "vitest";
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  deleteDepartmentSchema,
} from "./validations";

describe("department validations", () => {
  it("validates createDepartmentSchema successfully with valid input", () => {
    const input = {
      code: "cs",
      nameTh: "ภาควิชาวิทยาการคอมพิวเตอร์",
      nameEn: "Department of Computer Science",
      description: "ภาควิชาที่เน้นการพัฒนาซอฟต์แวร์และวิทยาการคอมพิวเตอร์",
      orderIndex: 1,
      isActive: true,
    };
    const result = createDepartmentSchema.parse(input);
    expect(result.code).toBe("CS");
    expect(result.nameTh).toBe("ภาควิชาวิทยาการคอมพิวเตอร์");
    expect(result.orderIndex).toBe(1);
    expect(result.isActive).toBe(true);
  });

  it("fails when code contains invalid characters", () => {
    const input = {
      code: "CS@#$",
      nameTh: "ภาควิชา",
      nameEn: "Department",
    };
    expect(() => createDepartmentSchema.parse(input)).toThrow();
  });

  it("fails when nameTh or nameEn is too short", () => {
    const input = {
      code: "CS",
      nameTh: "ก",
      nameEn: "C",
    };
    expect(() => createDepartmentSchema.parse(input)).toThrow();
  });

  it("validates updateDepartmentSchema with valid uuid id", () => {
    const input = {
      id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      code: "SE",
      nameTh: "ภาควิชาวิศวกรรมซอฟต์แวร์",
      nameEn: "Department of Software Engineering",
      orderIndex: 2,
      isActive: false,
    };
    const result = updateDepartmentSchema.parse(input);
    expect(result.id).toBe("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11");
    expect(result.code).toBe("SE");
    expect(result.isActive).toBe(false);
  });

  it("fails updateDepartmentSchema with invalid uuid id", () => {
    const input = {
      id: "invalid-id",
      code: "SE",
      nameTh: "ภาควิชา",
      nameEn: "Department",
    };
    expect(() => updateDepartmentSchema.parse(input)).toThrow();
  });

  it("validates deleteDepartmentSchema with valid uuid id", () => {
    const input = { id: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22" };
    const result = deleteDepartmentSchema.parse(input);
    expect(result.id).toBe("b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22");
  });
});
