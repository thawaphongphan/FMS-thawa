import { prisma } from "@/shared/lib/infra/prisma";
import { errors } from "@/shared/lib/errors";
import type { CreateDepartmentInput, UpdateDepartmentInput } from "./validations";

export interface DepartmentCurriculumSummary {
  id: string;
  programCode: string;
  nameTh: string;
  nameEn: string;
  degreeLevel: string;
  revisedYear: number;
  isActive: boolean;
}

export interface DepartmentDto {
  id: string;
  tenantId: string;
  code: string;
  nameTh: string;
  nameEn: string;
  description: string | null;
  orderIndex: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  curriculaCount?: number;
  staffCount?: number;
  curricula?: DepartmentCurriculumSummary[];
}

export async function listPublicDepartments(tenantId: string): Promise<DepartmentDto[]> {
  const depts = await prisma.department.findMany({
    where: {
      tenantId,
      isActive: true,
    },
    orderBy: [
      { orderIndex: "asc" },
      { code: "asc" },
    ],
  });

  return depts as DepartmentDto[];
}

export async function adminListDepartments(tenantId: string): Promise<DepartmentDto[]> {
  const depts = await prisma.department.findMany({
    where: { tenantId },
    include: {
      _count: {
        select: {
          curricula: true,
          staffProfiles: true,
        },
      },
    },
    orderBy: [
      { orderIndex: "asc" },
      { code: "asc" },
    ],
  });

  return depts.map((d) => ({
    id: d.id,
    tenantId: d.tenantId,
    code: d.code,
    nameTh: d.nameTh,
    nameEn: d.nameEn,
    description: d.description,
    orderIndex: d.orderIndex,
    isActive: d.isActive,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
    curriculaCount: d._count.curricula,
    staffCount: d._count.staffProfiles,
  }));
}

export async function getDepartmentById(
  tenantId: string,
  id: string
): Promise<DepartmentDto | null> {
  const dept = await prisma.department.findFirst({
    where: { id, tenantId },
    include: {
      curricula: {
        select: {
          id: true,
          programCode: true,
          nameTh: true,
          nameEn: true,
          degreeLevel: true,
          revisedYear: true,
          isActive: true,
        },
        orderBy: [
          { degreeLevel: "asc" },
          { revisedYear: "desc" },
          { programCode: "asc" },
        ],
      },
      _count: {
        select: {
          curricula: true,
          staffProfiles: true,
        },
      },
    },
  });

  if (!dept) return null;

  return {
    id: dept.id,
    tenantId: dept.tenantId,
    code: dept.code,
    nameTh: dept.nameTh,
    nameEn: dept.nameEn,
    description: dept.description,
    orderIndex: dept.orderIndex,
    isActive: dept.isActive,
    createdAt: dept.createdAt,
    updatedAt: dept.updatedAt,
    curriculaCount: dept._count.curricula,
    staffCount: dept._count.staffProfiles,
    curricula: dept.curricula,
  };
}

export async function createDepartment(
  tenantId: string,
  input: CreateDepartmentInput
): Promise<DepartmentDto> {
  const existing = await prisma.department.findUnique({
    where: {
      tenantId_code: {
        tenantId,
        code: input.code,
      },
    },
  });

  if (existing) {
    throw errors.conflict("Department code already exists");
  }

  const created = await prisma.department.create({
    data: {
      tenantId,
      code: input.code,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      description: input.description || null,
      orderIndex: input.orderIndex,
      isActive: input.isActive,
    },
  });

  return created as DepartmentDto;
}

export async function updateDepartment(
  tenantId: string,
  input: UpdateDepartmentInput
): Promise<DepartmentDto> {
  const existing = await prisma.department.findFirst({
    where: {
      tenantId,
      code: input.code,
      NOT: { id: input.id },
    },
  });

  if (existing) {
    throw errors.conflict("Department code already exists");
  }

  const updated = await prisma.department.update({
    where: { id: input.id, tenantId },
    data: {
      code: input.code,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      description: input.description || null,
      orderIndex: input.orderIndex,
      isActive: input.isActive,
    },
  });

  return updated as DepartmentDto;
}

export async function deleteDepartment(tenantId: string, id: string): Promise<void> {
  const dept = await prisma.department.findFirst({
    where: { id, tenantId },
    include: {
      _count: {
        select: {
          curricula: true,
          staffProfiles: true,
        },
      },
    },
  });

  if (!dept) {
    throw errors.not_found("Department not found");
  }

  if (dept._count.curricula > 0) {
    throw errors.conflict("department.deleteHasCurricula");
  }

  if (dept._count.staffProfiles > 0) {
    throw errors.conflict("department.deleteHasStaff");
  }

  await prisma.department.delete({
    where: { id, tenantId },
  });
}
