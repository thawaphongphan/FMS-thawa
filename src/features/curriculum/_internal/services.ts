import { prisma } from "@/shared/lib/infra/prisma";
import { Prisma, type DegreeLevel, type StudentStatus, type EmploymentStatus } from "@/generated/prisma";
import { AppError } from "@/shared/lib/errors";
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

export interface CurriculumStudentMemberDto {
  id: string;
  studentId: string;
  titleTh: string;
  firstNameTh: string;
  lastNameTh: string;
  titleEn: string;
  firstNameEn: string;
  lastNameEn: string;
  degreeLevel: DegreeLevel;
  admissionYear: number;
  currentYear: number;
  status: StudentStatus;
  email: string | null;
  phoneNumber: string | null;
}

export interface CurriculumAlumniMemberDto {
  id: string;
  studentId: string;
  titleTh: string;
  firstNameTh: string;
  lastNameTh: string;
  titleEn: string;
  firstNameEn: string;
  lastNameEn: string;
  degreeLevel: DegreeLevel;
  graduationYear: number;
  generation: number | null;
  employmentStatus: EmploymentStatus;
  jobTitle: string | null;
  company: string | null;
  email: string | null;
  phoneNumber: string | null;
}

export interface CurriculumEnrolledMembersDto {
  students: CurriculumStudentMemberDto[];
  alumni: CurriculumAlumniMemberDto[];
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
  _count?: {
    studentProfiles: number;
    alumniProfiles: number;
    classSchedules: number;
    courses: number;
  };
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
      _count: {
        select: {
          studentProfiles: true,
          alumniProfiles: true,
          classSchedules: true,
          courses: true,
        },
      },
    },
    orderBy: [
      { degreeLevel: "asc" },
      { revisedYear: "desc" },
      { programCode: "asc" },
    ],
  });
  return list as unknown as CurriculumDto[];
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
      _count: {
        select: {
          studentProfiles: true,
          alumniProfiles: true,
          classSchedules: true,
          courses: true,
        },
      },
    },
  });
  return created as unknown as CurriculumDto;
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
      _count: {
        select: {
          studentProfiles: true,
          alumniProfiles: true,
          classSchedules: true,
          courses: true,
        },
      },
    },
  });
  return updated as unknown as CurriculumDto;
}

export async function deleteCurriculum(tenantId: string, id: string): Promise<void> {
  // ตรวจสอบความปลอดภัยของข้อมูล: ห้ามลบหากมีนิสิตหรือศิษย์เก่าผูกอยู่
  const [studentCount, alumniCount] = await Promise.all([
    prisma.studentProfile.count({ where: { tenantId, curriculumId: id } }),
    prisma.alumniProfile.count({ where: { tenantId, curriculumId: id } }),
  ]);

  if (studentCount > 0 || alumniCount > 0) {
    const details: string[] = [];
    if (studentCount > 0) details.push(`นิสิตปัจจุบัน ${studentCount} คน`);
    if (alumniCount > 0) details.push(`ศิษย์เก่า ${alumniCount} คน`);

    throw new AppError(
      "conflict",
      `ไม่สามารถลบหลักสูตรนี้ได้ เนื่องจากมีข้อมูล${details.join(" และ ")}สังกัดอยู่ กรุณาย้ายหรือลบข้อมูลดังกล่าวก่อน หรือเลือกปิดสถานะการเปิดสอนแทน`
    );
  }

  try {
    await prisma.curriculum.delete({
      where: { id, tenantId },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      throw new AppError(
        "conflict",
        "ไม่สามารถลบหลักสูตรนี้ได้ เนื่องจากมีข้อมูลอื่นในระบบอ้างอิงถึงหลักสูตรนี้อยู่"
      );
    }
    throw error;
  }
}

export async function getCurriculumEnrolledMembers(
  tenantId: string,
  curriculumId: string
): Promise<CurriculumEnrolledMembersDto> {
  const [students, alumni] = await Promise.all([
    prisma.studentProfile.findMany({
      where: { tenantId, curriculumId },
      orderBy: [
        { currentYear: "asc" },
        { studentId: "asc" },
      ],
      select: {
        id: true,
        studentId: true,
        titleTh: true,
        firstNameTh: true,
        lastNameTh: true,
        titleEn: true,
        firstNameEn: true,
        lastNameEn: true,
        degreeLevel: true,
        admissionYear: true,
        currentYear: true,
        status: true,
        email: true,
        phoneNumber: true,
      },
    }),
    prisma.alumniProfile.findMany({
      where: { tenantId, curriculumId },
      orderBy: [
        { graduationYear: "desc" },
        { studentId: "asc" },
      ],
      select: {
        id: true,
        studentId: true,
        titleTh: true,
        firstNameTh: true,
        lastNameTh: true,
        titleEn: true,
        firstNameEn: true,
        lastNameEn: true,
        degreeLevel: true,
        graduationYear: true,
        generation: true,
        employmentStatus: true,
        jobTitle: true,
        company: true,
        email: true,
        phoneNumber: true,
      },
    }),
  ]);

  return { students, alumni };
}

