import { prisma } from "@/shared/lib/infra/prisma";
import type { Prisma, Gender, StudentStatus, DegreeLevel, EmploymentStatus } from "@/generated/prisma";
import type { CreateStudentInput, UpdateStudentInput } from "./validations";

export interface StudentFilter {
  query?: string;
  curriculumId?: string;
  status?: StudentStatus;
  gender?: Gender;
  admissionYear?: number;
}

export async function adminListStudents(tenantId: string, filter?: StudentFilter) {
  const whereClause: Prisma.StudentProfileWhereInput = { tenantId };

  if (filter?.curriculumId) whereClause.curriculumId = filter.curriculumId;
  if (filter?.status) whereClause.status = filter.status;
  if (filter?.gender) whereClause.gender = filter.gender;
  if (filter?.admissionYear) whereClause.admissionYear = filter.admissionYear;

  if (filter?.query) {
    const q = filter.query.trim();
    whereClause.OR = [
      { studentId: { contains: q, mode: "insensitive" } },
      { firstNameTh: { contains: q, mode: "insensitive" } },
      { lastNameTh: { contains: q, mode: "insensitive" } },
      { firstNameEn: { contains: q, mode: "insensitive" } },
      { lastNameEn: { contains: q, mode: "insensitive" } },
      { nationality: { contains: q, mode: "insensitive" } },
      { ethnicity: { contains: q, mode: "insensitive" } },
    ];
  }

  return prisma.studentProfile.findMany({
    where: whereClause,
    include: {
      curriculum: {
        select: {
          id: true,
          programCode: true,
          nameTh: true,
          nameEn: true,
        },
      },
    },
    orderBy: [{ admissionYear: "desc" }, { studentId: "asc" }],
  });
}

export async function listStudentOptions(tenantId: string) {
  const [curricula, years] = await Promise.all([
    prisma.curriculum.findMany({
      where: { tenantId, isActive: true },
      select: { id: true, programCode: true, nameTh: true, degreeLevel: true },
      orderBy: { programCode: "asc" },
    }),
    prisma.studentProfile.findMany({
      where: { tenantId },
      select: { admissionYear: true },
      distinct: ["admissionYear"],
      orderBy: { admissionYear: "desc" },
    }),
  ]);

  return {
    curricula,
    admissionYears: years.map((y) => y.admissionYear),
  };
}

export async function getStudentDemographicsSummary(tenantId: string, admissionYear?: number) {
  const studentWhere: Prisma.StudentProfileWhereInput = { tenantId };
  if (admissionYear) {
    studentWhere.admissionYear = admissionYear;
  }

  const [
    allStudents,
    totalAlumni,
    employedAlumni,
    curricula,
    admissionYears,
    alumniStatuses,
  ] = await Promise.all([
    prisma.studentProfile.findMany({
      where: studentWhere,
      select: {
        id: true,
        gender: true,
        nationality: true,
        ethnicity: true,
        degreeLevel: true,
        currentYear: true,
        status: true,
        curriculumId: true,
      },
    }),
    prisma.alumniProfile.count({ where: { tenantId } }),
    prisma.alumniProfile.count({
      where: {
        tenantId,
        employmentStatus: { in: ["EMPLOYED", "ENTREPRENEUR"] },
      },
    }),
    prisma.curriculum.findMany({
      where: { tenantId, isActive: true },
      select: { id: true, programCode: true, nameTh: true },
      orderBy: { programCode: "asc" },
    }),
    prisma.studentProfile.findMany({
      where: { tenantId },
      select: { admissionYear: true },
      distinct: ["admissionYear"],
      orderBy: { admissionYear: "desc" },
    }),
    prisma.alumniProfile.groupBy({
      by: ["employmentStatus"],
      where: { tenantId },
      _count: { id: true },
    }),
  ]);

  const totalEnrolled = allStudents.filter((s) => s.status === "ENROLLED").length;
  const totalCount = allStudents.length;

  // Gender Breakdown
  const genderBreakdown: Record<Gender, number> = {
    MALE: allStudents.filter((s) => s.gender === "MALE").length,
    FEMALE: allStudents.filter((s) => s.gender === "FEMALE").length,
    OTHER: allStudents.filter((s) => s.gender === "OTHER").length,
  };

  // Nationality Breakdown
  const natMap = new Map<string, number>();
  for (const s of allStudents) {
    const nat = s.nationality || "ไทย";
    natMap.set(nat, (natMap.get(nat) || 0) + 1);
  }
  const nationalityBreakdown = Array.from(natMap.entries())
    .map(([label, count]) => ({
      label,
      count,
      isThai: label === "ไทย",
    }))
    .sort((a, b) => b.count - a.count);

  // Ethnicity Breakdown
  const ethMap = new Map<string, number>();
  for (const s of allStudents) {
    const eth = s.ethnicity || "ไทย";
    ethMap.set(eth, (ethMap.get(eth) || 0) + 1);
  }
  const ethnicityBreakdown = Array.from(ethMap.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  // Degree Level Breakdown
  const degreeLevelBreakdown: Record<DegreeLevel, number> = {
    BACHELOR: allStudents.filter((s) => s.degreeLevel === "BACHELOR").length,
    MASTER: allStudents.filter((s) => s.degreeLevel === "MASTER").length,
    DOCTORATE: allStudents.filter((s) => s.degreeLevel === "DOCTORATE").length,
    CERTIFICATE: allStudents.filter((s) => s.degreeLevel === "CERTIFICATE").length,
    TRAINING: allStudents.filter((s) => s.degreeLevel === "TRAINING").length,
  };

  // Curriculum & Cohort Breakdown
  const curriculumYearBreakdown = curricula.map((curr) => {
    const currStudents = allStudents.filter((s) => s.curriculumId === curr.id);
    return {
      curriculumId: curr.id,
      programCode: curr.programCode,
      nameTh: curr.nameTh,
      year1: currStudents.filter((s) => s.currentYear === 1).length,
      year2: currStudents.filter((s) => s.currentYear === 2).length,
      year3: currStudents.filter((s) => s.currentYear === 3).length,
      year4: currStudents.filter((s) => s.currentYear >= 4).length,
      total: currStudents.length,
    };
  });

  // Employment Breakdown
  const employmentBreakdown: Record<EmploymentStatus, number> = {
    EMPLOYED: 0,
    STUDYING: 0,
    ENTREPRENEUR: 0,
    JOB_SEEKING: 0,
    OTHER: 0,
  };
  for (const item of alumniStatuses) {
    employmentBreakdown[item.employmentStatus] = item._count.id;
  }

  const employmentRate = totalAlumni > 0 ? Math.round((employedAlumni / totalAlumni) * 100) : 0;
  const internationalCount = nationalityBreakdown
    .filter((n) => !n.isThai)
    .reduce((acc, curr) => acc + curr.count, 0);

  return {
    totalStudents: totalCount,
    totalEnrolled,
    totalAlumni,
    employmentRate,
    internationalCount,
    genderBreakdown,
    nationalityBreakdown,
    ethnicityBreakdown,
    degreeLevelBreakdown,
    curriculumYearBreakdown,
    employmentBreakdown,
    availableAdmissionYears: admissionYears.map((y) => y.admissionYear),
  };
}

export async function createStudent(tenantId: string, input: CreateStudentInput) {
  return prisma.studentProfile.create({
    data: {
      tenantId,
      studentId: input.studentId,
      titleTh: input.titleTh,
      titleEn: input.titleEn,
      firstNameTh: input.firstNameTh,
      lastNameTh: input.lastNameTh,
      firstNameEn: input.firstNameEn,
      lastNameEn: input.lastNameEn,
      gender: input.gender,
      nationality: input.nationality,
      ethnicity: input.ethnicity,
      religion: input.religion ?? null,
      domicileRegion: input.domicileRegion ?? null,
      curriculumId: input.curriculumId,
      degreeLevel: input.degreeLevel,
      admissionYear: input.admissionYear,
      currentYear: input.currentYear,
      status: input.status,
      email: input.email ?? null,
      phoneNumber: input.phoneNumber ?? null,
      avatarUrl: input.avatarUrl ?? null,
    },
    include: {
      curriculum: {
        select: {
          id: true,
          programCode: true,
          nameTh: true,
          nameEn: true,
        },
      },
    },
  });
}

export async function updateStudent(tenantId: string, input: UpdateStudentInput) {
  return prisma.studentProfile.update({
    where: { id: input.id, tenantId },
    data: {
      studentId: input.studentId,
      titleTh: input.titleTh,
      titleEn: input.titleEn,
      firstNameTh: input.firstNameTh,
      lastNameTh: input.lastNameTh,
      firstNameEn: input.firstNameEn,
      lastNameEn: input.lastNameEn,
      gender: input.gender,
      nationality: input.nationality,
      ethnicity: input.ethnicity,
      religion: input.religion ?? null,
      domicileRegion: input.domicileRegion ?? null,
      curriculumId: input.curriculumId,
      degreeLevel: input.degreeLevel,
      admissionYear: input.admissionYear,
      currentYear: input.currentYear,
      status: input.status,
      email: input.email ?? null,
      phoneNumber: input.phoneNumber ?? null,
      avatarUrl: input.avatarUrl ?? null,
    },
    include: {
      curriculum: {
        select: {
          id: true,
          programCode: true,
          nameTh: true,
          nameEn: true,
        },
      },
    },
  });
}

export async function deleteStudent(tenantId: string, id: string) {
  return prisma.studentProfile.delete({
    where: { id, tenantId },
  });
}

export type StudentRow = Awaited<ReturnType<typeof adminListStudents>>[number];
export type StudentDemographicsData = Awaited<ReturnType<typeof getStudentDemographicsSummary>>;
export type StudentOptions = Awaited<ReturnType<typeof listStudentOptions>>;
