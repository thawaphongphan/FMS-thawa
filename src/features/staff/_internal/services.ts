import { prisma } from "@/shared/lib/infra/prisma";
import type { Prisma, StaffProfile, Department } from "@/generated/prisma";
import type { CreateStaffInput, UpdateStaffInput } from "./validations";

export interface DepartmentDto {
  id: string;
  code: string;
  nameTh: string;
  nameEn: string;
  orderIndex: number;
}

export interface EducationItem {
  degree: string;
  field: string;
  institution: string;
  year?: string;
}

export interface StaffProfileDto {
  id: string;
  tenantId: string;
  userId: string | null;
  departmentId: string;
  departmentCode: string;
  departmentNameTh: string;
  departmentNameEn: string;
  academicTitleTh: string;
  academicTitleEn: string;
  firstNameTh: string;
  lastNameTh: string;
  firstNameEn: string;
  lastNameEn: string;
  fullNameTh: string;
  fullNameEn: string;
  email: string;
  phoneNumber: string | null;
  officeRoom: string | null;
  avatarUrl: string | null;
  adminPositionTh: string | null;
  adminPositionEn: string | null;
  bioTh: string | null;
  bioEn: string | null;
  researchInterests: string[];
  educationHistory: EducationItem[];
  orderIndex: number;
  status: "ACTIVE" | "ON_LEAVE" | "RETIRED";
  createdAt: string;
  updatedAt: string;
}

export async function listDepartments(tenantId: string): Promise<DepartmentDto[]> {
  const depts = await prisma.department.findMany({
    where: { tenantId },
    orderBy: { orderIndex: "asc" },
  });
  return depts.map((d) => ({
    id: d.id,
    code: d.code,
    nameTh: d.nameTh,
    nameEn: d.nameEn,
    orderIndex: d.orderIndex,
  }));
}

export async function listPublicStaff(
  tenantId: string,
  departmentCode?: string,
  search?: string
): Promise<StaffProfileDto[]> {
  const where: Prisma.StaffProfileWhereInput = {
    tenantId,
    status: "ACTIVE",
  };

  if (departmentCode && departmentCode !== "all") {
    where.department = { code: departmentCode };
  }

  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { firstNameTh: { contains: q, mode: "insensitive" } },
      { lastNameTh: { contains: q, mode: "insensitive" } },
      { firstNameEn: { contains: q, mode: "insensitive" } },
      { lastNameEn: { contains: q, mode: "insensitive" } },
      { researchInterests: { has: q } },
    ];
  }

  const staffList = await prisma.staffProfile.findMany({
    where,
    include: { department: true },
    orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }],
  });

  return staffList.map(mapStaffToDto);
}

export async function getStaffById(tenantId: string, id: string): Promise<StaffProfileDto | null> {
  const staff = await prisma.staffProfile.findUnique({
    where: { id },
    include: { department: true },
  });
  if (!staff || staff.tenantId !== tenantId) return null;
  return mapStaffToDto(staff);
}

export async function adminListStaff(tenantId: string): Promise<StaffProfileDto[]> {
  const staffList = await prisma.staffProfile.findMany({
    where: { tenantId },
    include: { department: true },
    orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }],
  });
  return staffList.map(mapStaffToDto);
}

export async function createStaff(tenantId: string, input: CreateStaffInput): Promise<StaffProfileDto> {
  const created = await prisma.staffProfile.create({
    data: {
      tenantId,
      departmentId: input.departmentId,
      userId: input.userId || null,
      academicTitleTh: input.academicTitleTh,
      academicTitleEn: input.academicTitleEn,
      firstNameTh: input.firstNameTh,
      lastNameTh: input.lastNameTh,
      firstNameEn: input.firstNameEn,
      lastNameEn: input.lastNameEn,
      email: input.email,
      phoneNumber: input.phoneNumber || null,
      officeRoom: input.officeRoom || null,
      avatarUrl: input.avatarUrl || null,
      adminPositionTh: input.adminPositionTh || null,
      adminPositionEn: input.adminPositionEn || null,
      bioTh: input.bioTh || null,
      bioEn: input.bioEn || null,
      researchInterests: input.researchInterests,
      educationHistory: input.educationHistory as unknown as Prisma.InputJsonValue,
      orderIndex: input.orderIndex,
      status: input.status,
    },
    include: { department: true },
  });
  return mapStaffToDto(created);
}

export async function updateStaff(tenantId: string, input: UpdateStaffInput): Promise<StaffProfileDto> {
  const updated = await prisma.staffProfile.update({
    where: { id: input.id, tenantId },
    data: {
      departmentId: input.departmentId,
      userId: input.userId || null,
      academicTitleTh: input.academicTitleTh,
      academicTitleEn: input.academicTitleEn,
      firstNameTh: input.firstNameTh,
      lastNameTh: input.lastNameTh,
      firstNameEn: input.firstNameEn,
      lastNameEn: input.lastNameEn,
      email: input.email,
      phoneNumber: input.phoneNumber || null,
      officeRoom: input.officeRoom || null,
      avatarUrl: input.avatarUrl || null,
      adminPositionTh: input.adminPositionTh || null,
      adminPositionEn: input.adminPositionEn || null,
      bioTh: input.bioTh || null,
      bioEn: input.bioEn || null,
      researchInterests: input.researchInterests,
      educationHistory: input.educationHistory as unknown as Prisma.InputJsonValue,
      orderIndex: input.orderIndex,
      status: input.status,
    },
    include: { department: true },
  });
  return mapStaffToDto(updated);
}

export async function deleteStaff(tenantId: string, id: string): Promise<void> {
  await prisma.staffProfile.delete({
    where: { id, tenantId },
  });
}

function mapStaffToDto(row: StaffProfile & { department: Department }): StaffProfileDto {
  const fullNameTh = `${row.academicTitleTh} ${row.firstNameTh} ${row.lastNameTh}`.trim();
  const fullNameEn = `${row.academicTitleEn} ${row.firstNameEn} ${row.lastNameEn}`.trim();
  const educationHistory: EducationItem[] = Array.isArray(row.educationHistory)
    ? (row.educationHistory as unknown as EducationItem[])
    : [];

  return {
    id: row.id,
    tenantId: row.tenantId,
    userId: row.userId,
    departmentId: row.departmentId,
    departmentCode: row.department.code,
    departmentNameTh: row.department.nameTh,
    departmentNameEn: row.department.nameEn,
    academicTitleTh: row.academicTitleTh,
    academicTitleEn: row.academicTitleEn,
    firstNameTh: row.firstNameTh,
    lastNameTh: row.lastNameTh,
    firstNameEn: row.firstNameEn,
    lastNameEn: row.lastNameEn,
    fullNameTh,
    fullNameEn,
    email: row.email,
    phoneNumber: row.phoneNumber,
    officeRoom: row.officeRoom,
    avatarUrl: row.avatarUrl,
    adminPositionTh: row.adminPositionTh,
    adminPositionEn: row.adminPositionEn,
    bioTh: row.bioTh,
    bioEn: row.bioEn,
    researchInterests: row.researchInterests ?? [],
    educationHistory,
    orderIndex: row.orderIndex,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
