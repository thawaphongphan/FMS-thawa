import { prisma } from "@/shared/lib/infra/prisma";
import type { Prisma, DegreeLevel } from "@/generated/prisma";
import type { CreateCurriculumInput, UpdateCurriculumInput } from "./validations";

export interface CurriculumCourseDto {
  id: string;
  courseCategory: string;
  recommendedYear: number;
  recommendedTerm: number;
  course: {
    id: string;
    courseCode: string;
    nameTh: string;
    nameEn: string;
    credits: string;
    descriptionTh: string | null;
    descriptionEn: string | null;
  };
}

export interface CurriculumDepartmentSummary {
  id: string;
  code: string;
  nameTh: string;
  nameEn: string;
}

export interface CurriculumDetails {
  philosophyTh?: string;
  philosophyEn?: string;
  objectivesTh?: string[];
  objectivesEn?: string[];
  careerPathsTh?: string[];
  careerPathsEn?: string[];
  admissionCriteriaTh?: string;
  admissionCriteriaEn?: string;
  englishProficiencyRequirements?: string;
  studyPlansSummaryTh?: string;
  studyPlansSummaryEn?: string;
  tuitionFeeEstimate?: string;
  [key: string]: unknown;
}

export interface CurriculumDto {
  id: string;
  tenantId: string;
  departmentId: string | null;
  degreeLevel: DegreeLevel;
  programCode: string;
  nameTh: string;
  nameEn: string;
  degreeTitleTh: string;
  degreeTitleEn: string;
  totalCredits: number;
  durationYears: number;
  revisedYear: number;
  brochureUrl: string | null;
  details?: CurriculumDetails | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  department?: CurriculumDepartmentSummary | null;
  courses?: CurriculumCourseDto[];
}

export async function listPublicCurricula(
  tenantId: string,
  degreeLevel?: DegreeLevel,
  departmentId?: string
): Promise<CurriculumDto[]> {
  const where: { tenantId: string; isActive: boolean; degreeLevel?: DegreeLevel; departmentId?: string } = {
    tenantId,
    isActive: true,
  };
  if (degreeLevel) {
    where.degreeLevel = degreeLevel;
  }
  if (departmentId) {
    where.departmentId = departmentId;
  }

  const curricula = await prisma.curriculum.findMany({
    where,
    include: {
      department: {
        select: {
          id: true,
          code: true,
          nameTh: true,
          nameEn: true,
        },
      },
    },
    orderBy: [
      { degreeLevel: "asc" },
      { revisedYear: "desc" },
      { programCode: "asc" },
    ],
  });

  return curricula as CurriculumDto[];
}

export async function listActiveDegreeLevels(tenantId: string): Promise<DegreeLevel[]> {
  const result = await prisma.curriculum.findMany({
    where: {
      tenantId,
      isActive: true,
    },
    select: {
      degreeLevel: true,
    },
    distinct: ["degreeLevel"],
  });

  const order: DegreeLevel[] = ["BACHELOR", "MASTER", "DOCTORATE", "CERTIFICATE", "TRAINING"];
  const present = new Set(result.map((r) => r.degreeLevel));
  return order.filter((level) => present.has(level));
}

export async function getCurriculumById(
  tenantId: string,
  id: string
): Promise<CurriculumDto | null> {
  const curriculum = await prisma.curriculum.findFirst({
    where: { tenantId, id },
    include: {
      department: {
        select: {
          id: true,
          code: true,
          nameTh: true,
          nameEn: true,
        },
      },
      courses: {
        include: {
          course: true,
        },
        orderBy: [
          { recommendedYear: "asc" },
          { recommendedTerm: "asc" },
        ],
      },
    },
  });

  if (!curriculum) return null;
  return curriculum as unknown as CurriculumDto;
}

export async function adminListCurricula(
  tenantId: string,
  departmentId?: string
): Promise<CurriculumDto[]> {
  const where: { tenantId: string; departmentId?: string } = { tenantId };
  if (departmentId) {
    where.departmentId = departmentId;
  }

  const list = await prisma.curriculum.findMany({
    where,
    include: {
      department: {
        select: {
          id: true,
          code: true,
          nameTh: true,
          nameEn: true,
        },
      },
    },
    orderBy: [
      { degreeLevel: "asc" },
      { revisedYear: "desc" },
      { programCode: "asc" },
    ],
  });
  return list as CurriculumDto[];
}

export async function createCurriculum(
  tenantId: string,
  input: CreateCurriculumInput
): Promise<CurriculumDto> {
  const created = await prisma.curriculum.create({
    data: {
      tenantId,
      departmentId: input.departmentId || null,
      degreeLevel: input.degreeLevel,
      programCode: input.programCode,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      degreeTitleTh: input.degreeTitleTh,
      degreeTitleEn: input.degreeTitleEn,
      totalCredits: input.totalCredits,
      durationYears: input.durationYears,
      revisedYear: input.revisedYear,
      brochureUrl: input.brochureUrl || null,
      details: (input.details ?? {}) as unknown as Prisma.InputJsonObject,
      isActive: input.isActive,
    },
    include: {
      department: {
        select: {
          id: true,
          code: true,
          nameTh: true,
          nameEn: true,
        },
      },
    },
  });
  return created as CurriculumDto;
}

export async function updateCurriculum(
  tenantId: string,
  input: UpdateCurriculumInput
): Promise<CurriculumDto> {
  const updated = await prisma.curriculum.update({
    where: { id: input.id, tenantId },
    data: {
      departmentId: input.departmentId || null,
      degreeLevel: input.degreeLevel,
      programCode: input.programCode,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      degreeTitleTh: input.degreeTitleTh,
      degreeTitleEn: input.degreeTitleEn,
      totalCredits: input.totalCredits,
      durationYears: input.durationYears,
      revisedYear: input.revisedYear,
      brochureUrl: input.brochureUrl || null,
      details: (input.details ?? {}) as unknown as Prisma.InputJsonObject,
      isActive: input.isActive,
    },
    include: {
      department: {
        select: {
          id: true,
          code: true,
          nameTh: true,
          nameEn: true,
        },
      },
    },
  });
  return updated as CurriculumDto;
}

export async function deleteCurriculum(tenantId: string, id: string): Promise<void> {
  await prisma.curriculum.delete({
    where: { id, tenantId },
  });
}
