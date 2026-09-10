import { prisma } from "@/shared/lib/infra/prisma";
import type { Prisma, EmploymentStatus } from "@/generated/prisma";
import type { CreateAlumniInput, UpdateAlumniInput } from "./validations";

export interface AlumniFilter {
  query?: string;
  graduationYear?: number;
  curriculumId?: string;
  employmentStatus?: EmploymentStatus;
}

export async function listPublicAlumni(tenantId: string, filter?: AlumniFilter) {
  const whereClause: Prisma.AlumniProfileWhereInput = { tenantId };

  if (filter?.graduationYear) {
    whereClause.graduationYear = filter.graduationYear;
  }
  if (filter?.curriculumId) {
    whereClause.curriculumId = filter.curriculumId;
  }
  if (filter?.employmentStatus) {
    whereClause.employmentStatus = filter.employmentStatus;
  }
  if (filter?.query) {
    const q = filter.query.trim();
    whereClause.OR = [
      { studentId: { contains: q, mode: "insensitive" } },
      { firstNameTh: { contains: q, mode: "insensitive" } },
      { lastNameTh: { contains: q, mode: "insensitive" } },
      { firstNameEn: { contains: q, mode: "insensitive" } },
      { lastNameEn: { contains: q, mode: "insensitive" } },
      { company: { contains: q, mode: "insensitive" } },
      { jobTitle: { contains: q, mode: "insensitive" } },
    ];
  }

  return prisma.alumniProfile.findMany({
    where: whereClause,
    include: {
      curriculum: {
        select: {
          id: true,
          programCode: true,
          nameTh: true,
          nameEn: true,
          degreeLevel: true,
        },
      },
    },
    orderBy: [{ graduationYear: "desc" }, { createdAt: "desc" }],
  });
}

export async function listFeaturedAlumni(tenantId: string) {
  return prisma.alumniProfile.findMany({
    where: { tenantId, isFeatured: true },
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
    orderBy: [{ graduationYear: "desc" }, { createdAt: "desc" }],
  });
}

export async function adminListAlumni(tenantId: string) {
  return prisma.alumniProfile.findMany({
    where: { tenantId },
    include: {
      curriculum: {
        select: {
          id: true,
          programCode: true,
          nameTh: true,
          nameEn: true,
          degreeLevel: true,
        },
      },
    },
    orderBy: [{ graduationYear: "desc" }, { createdAt: "desc" }],
  });
}

export async function listAlumniOptions(tenantId: string) {
  const [curricula, years] = await Promise.all([
    prisma.curriculum.findMany({
      where: { tenantId, isActive: true },
      select: { id: true, programCode: true, nameTh: true, degreeLevel: true },
      orderBy: { programCode: "asc" },
    }),
    prisma.alumniProfile.findMany({
      where: { tenantId },
      select: { graduationYear: true },
      distinct: ["graduationYear"],
      orderBy: { graduationYear: "desc" },
    }),
  ]);

  return {
    curricula,
    graduationYears: years.map((y) => y.graduationYear),
  };
}

export async function createAlumni(tenantId: string, input: CreateAlumniInput) {
  return prisma.alumniProfile.create({
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
      curriculumId: input.curriculumId,
      degreeLevel: input.degreeLevel,
      graduationYear: input.graduationYear,
      generation: input.generation ?? null,
      gpa: input.gpa ?? null,
      employmentStatus: input.employmentStatus,
      jobTitle: input.jobTitle ?? null,
      company: input.company ?? null,
      industry: input.industry ?? null,
      salaryRange: input.salaryRange ?? null,
      email: input.email ?? null,
      phoneNumber: input.phoneNumber ?? null,
      linkedinUrl: input.linkedinUrl ?? null,
      avatarUrl: input.avatarUrl ?? null,
      isFeatured: input.isFeatured,
      featuredStoryTh: input.featuredStoryTh ?? null,
      featuredStoryEn: input.featuredStoryEn ?? null,
    },
  });
}

export async function updateAlumni(tenantId: string, input: UpdateAlumniInput) {
  return prisma.alumniProfile.update({
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
      curriculumId: input.curriculumId,
      degreeLevel: input.degreeLevel,
      graduationYear: input.graduationYear,
      generation: input.generation ?? null,
      gpa: input.gpa ?? null,
      employmentStatus: input.employmentStatus,
      jobTitle: input.jobTitle ?? null,
      company: input.company ?? null,
      industry: input.industry ?? null,
      salaryRange: input.salaryRange ?? null,
      email: input.email ?? null,
      phoneNumber: input.phoneNumber ?? null,
      linkedinUrl: input.linkedinUrl ?? null,
      avatarUrl: input.avatarUrl ?? null,
      isFeatured: input.isFeatured,
      featuredStoryTh: input.featuredStoryTh ?? null,
      featuredStoryEn: input.featuredStoryEn ?? null,
    },
  });
}

export async function deleteAlumni(tenantId: string, id: string) {
  return prisma.alumniProfile.delete({
    where: { id, tenantId },
  });
}

export type AlumniRow = Awaited<ReturnType<typeof adminListAlumni>>[number];
export type AlumniOptions = Awaited<ReturnType<typeof listAlumniOptions>>;
