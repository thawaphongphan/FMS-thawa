import { prisma } from "@/shared/lib/infra/prisma";
import type { Prisma, DayOfWeek, ExamType } from "@/generated/prisma";
import type {
  CreateAcademicTermInput,
  UpdateAcademicTermInput,
  CreateClassScheduleInput,
  UpdateClassScheduleInput,
  CreateExamScheduleInput,
  UpdateExamScheduleInput,
} from "./validations";

// -------------------------------------------------------------
// Academic Terms
// -------------------------------------------------------------

export async function listAcademicTerms(tenantId: string) {
  return prisma.academicTerm.findMany({
    where: { tenantId },
    orderBy: [{ year: "desc" }, { term: "desc" }],
  });
}

export async function getCurrentAcademicTerm(tenantId: string) {
  const current = await prisma.academicTerm.findFirst({
    where: { tenantId, isCurrent: true },
  });
  if (current) return current;

  return prisma.academicTerm.findFirst({
    where: { tenantId },
    orderBy: [{ year: "desc" }, { term: "desc" }],
  });
}

export async function createAcademicTerm(tenantId: string, input: CreateAcademicTermInput) {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    if (input.isCurrent) {
      await tx.academicTerm.updateMany({
        where: { tenantId, isCurrent: true },
        data: { isCurrent: false },
      });
    }
    return tx.academicTerm.create({
      data: {
        tenantId,
        year: input.year,
        term: input.term,
        nameTh: input.nameTh,
        nameEn: input.nameEn,
        startDate: input.startDate ? new Date(input.startDate) : null,
        endDate: input.endDate ? new Date(input.endDate) : null,
        isCurrent: input.isCurrent,
      },
    });
  });
}

export async function updateAcademicTerm(tenantId: string, input: UpdateAcademicTermInput) {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    if (input.isCurrent) {
      await tx.academicTerm.updateMany({
        where: { tenantId, isCurrent: true, id: { not: input.id } },
        data: { isCurrent: false },
      });
    }
    return tx.academicTerm.update({
      where: { id: input.id, tenantId },
      data: {
        year: input.year,
        term: input.term,
        nameTh: input.nameTh,
        nameEn: input.nameEn,
        startDate: input.startDate ? new Date(input.startDate) : null,
        endDate: input.endDate ? new Date(input.endDate) : null,
        isCurrent: input.isCurrent,
      },
    });
  });
}

export async function setCurrentAcademicTerm(tenantId: string, id: string) {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.academicTerm.updateMany({
      where: { tenantId, isCurrent: true },
      data: { isCurrent: false },
    });
    return tx.academicTerm.update({
      where: { id, tenantId },
      data: { isCurrent: true },
    });
  });
}

export async function deleteAcademicTerm(tenantId: string, id: string) {
  return prisma.academicTerm.delete({
    where: { id, tenantId },
  });
}

// -------------------------------------------------------------
// Options & References for dropdowns
// -------------------------------------------------------------

export async function listScheduleOptions(tenantId: string) {
  const [courses, instructors, curricula, terms] = await Promise.all([
    prisma.course.findMany({
      where: { tenantId },
      orderBy: { courseCode: "asc" },
      select: { id: true, courseCode: true, nameTh: true, nameEn: true, credits: true },
    }),
    prisma.staffProfile.findMany({
      where: { tenantId, status: "ACTIVE" },
      orderBy: [{ academicTitleTh: "asc" }, { firstNameTh: "asc" }],
      select: {
        id: true,
        academicTitleTh: true,
        academicTitleEn: true,
        firstNameTh: true,
        lastNameTh: true,
        firstNameEn: true,
        lastNameEn: true,
        department: { select: { nameTh: true, nameEn: true } },
      },
    }),
    prisma.curriculum.findMany({
      where: { tenantId, isActive: true },
      orderBy: { programCode: "asc" },
      select: { id: true, programCode: true, nameTh: true, degreeLevel: true },
    }),
    prisma.academicTerm.findMany({
      where: { tenantId },
      orderBy: [{ year: "desc" }, { term: "desc" }],
    }),
  ]);

  return { courses, instructors, curricula, terms };
}

// -------------------------------------------------------------
// Public Queries
// -------------------------------------------------------------

export interface ClassScheduleFilter {
  termId?: string;
  courseCodeOrName?: string;
  instructorId?: string;
  dayOfWeek?: DayOfWeek;
  curriculumId?: string;
  targetYear?: number;
}

export async function listPublicClassSchedules(tenantId: string, filter?: ClassScheduleFilter) {
  let effectiveTermId = filter?.termId;
  if (!effectiveTermId) {
    const currentTerm = await getCurrentAcademicTerm(tenantId);
    effectiveTermId = currentTerm?.id;
  }

  if (!effectiveTermId) return [];

  const whereClause: Prisma.ClassScheduleWhereInput = {
    tenantId,
    termId: effectiveTermId,
  };

  if (filter?.dayOfWeek) {
    whereClause.dayOfWeek = filter.dayOfWeek;
  }
  if (filter?.instructorId) {
    whereClause.instructorId = filter.instructorId;
  }
  if (filter?.curriculumId) {
    whereClause.curriculumId = filter.curriculumId;
  }
  if (filter?.targetYear) {
    whereClause.targetYear = filter.targetYear;
  }
  if (filter?.courseCodeOrName) {
    const q = filter.courseCodeOrName.trim();
    whereClause.OR = [
      { course: { courseCode: { contains: q, mode: "insensitive" } } },
      { course: { nameTh: { contains: q, mode: "insensitive" } } },
      { course: { nameEn: { contains: q, mode: "insensitive" } } },
    ];
  }

  return prisma.classSchedule.findMany({
    where: whereClause,
    include: {
      course: true,
      instructor: {
        select: {
          id: true,
          academicTitleTh: true,
          academicTitleEn: true,
          firstNameTh: true,
          lastNameTh: true,
          firstNameEn: true,
          lastNameEn: true,
        },
      },
      curriculum: {
        select: {
          id: true,
          programCode: true,
          nameTh: true,
        },
      },
    },
    orderBy: [
      { dayOfWeek: "asc" },
      { startTime: "asc" },
      { section: "asc" },
    ],
  });
}

export interface ExamScheduleFilter {
  termId?: string;
  examType?: ExamType;
  query?: string;
}

export async function listPublicExamSchedules(tenantId: string, filter?: ExamScheduleFilter) {
  let effectiveTermId = filter?.termId;
  if (!effectiveTermId) {
    const currentTerm = await getCurrentAcademicTerm(tenantId);
    effectiveTermId = currentTerm?.id;
  }

  if (!effectiveTermId) return [];

  const whereClause: Prisma.ExamScheduleWhereInput = {
    tenantId,
    termId: effectiveTermId,
  };

  if (filter?.examType) {
    whereClause.examType = filter.examType;
  }

  if (filter?.query) {
    const q = filter.query.trim();
    whereClause.OR = [
      { course: { courseCode: { contains: q, mode: "insensitive" } } },
      { course: { nameTh: { contains: q, mode: "insensitive" } } },
      { course: { nameEn: { contains: q, mode: "insensitive" } } },
      { room: { contains: q, mode: "insensitive" } },
    ];
  }

  return prisma.examSchedule.findMany({
    where: whereClause,
    include: {
      course: true,
      invigilator: {
        select: {
          id: true,
          academicTitleTh: true,
          academicTitleEn: true,
          firstNameTh: true,
          lastNameTh: true,
          firstNameEn: true,
          lastNameEn: true,
        },
      },
    },
    orderBy: [
      { examDate: "asc" },
      { startTime: "asc" },
    ],
  });
}

// -------------------------------------------------------------
// Admin Queries & Mutations
// -------------------------------------------------------------

export async function adminListClassSchedules(tenantId: string, termId?: string) {
  const whereClause: Prisma.ClassScheduleWhereInput = { tenantId };
  if (termId) whereClause.termId = termId;

  return prisma.classSchedule.findMany({
    where: whereClause,
    include: {
      course: true,
      term: true,
      instructor: {
        select: {
          id: true,
          academicTitleTh: true,
          academicTitleEn: true,
          firstNameTh: true,
          lastNameTh: true,
          firstNameEn: true,
          lastNameEn: true,
        },
      },
      curriculum: {
        select: { id: true, programCode: true, nameTh: true },
      },
    },
    orderBy: [{ term: { year: "desc" } }, { term: { term: "desc" } }, { dayOfWeek: "asc" }, { startTime: "asc" }],
  });
}

export async function adminListExamSchedules(tenantId: string, termId?: string) {
  const whereClause: Prisma.ExamScheduleWhereInput = { tenantId };
  if (termId) whereClause.termId = termId;

  return prisma.examSchedule.findMany({
    where: whereClause,
    include: {
      course: true,
      term: true,
      invigilator: {
        select: {
          id: true,
          academicTitleTh: true,
          academicTitleEn: true,
          firstNameTh: true,
          lastNameTh: true,
          firstNameEn: true,
          lastNameEn: true,
        },
      },
    },
    orderBy: [{ term: { year: "desc" } }, { term: { term: "desc" } }, { examDate: "asc" }, { startTime: "asc" }],
  });
}

export async function createClassSchedule(tenantId: string, input: CreateClassScheduleInput) {
  return prisma.classSchedule.create({
    data: {
      tenantId,
      termId: input.termId,
      courseId: input.courseId,
      section: input.section,
      dayOfWeek: input.dayOfWeek,
      startTime: input.startTime,
      endTime: input.endTime,
      room: input.room,
      building: input.building ?? null,
      instructorId: input.instructorId ?? null,
      instructorName: input.instructorName ?? null,
      curriculumId: input.curriculumId ?? null,
      targetYear: input.targetYear ?? null,
      notes: input.notes ?? null,
    },
  });
}

export async function updateClassSchedule(tenantId: string, input: UpdateClassScheduleInput) {
  return prisma.classSchedule.update({
    where: { id: input.id, tenantId },
    data: {
      termId: input.termId,
      courseId: input.courseId,
      section: input.section,
      dayOfWeek: input.dayOfWeek,
      startTime: input.startTime,
      endTime: input.endTime,
      room: input.room,
      building: input.building ?? null,
      instructorId: input.instructorId ?? null,
      instructorName: input.instructorName ?? null,
      curriculumId: input.curriculumId ?? null,
      targetYear: input.targetYear ?? null,
      notes: input.notes ?? null,
    },
  });
}

export async function deleteClassSchedule(tenantId: string, id: string) {
  return prisma.classSchedule.delete({
    where: { id, tenantId },
  });
}

export async function createExamSchedule(tenantId: string, input: CreateExamScheduleInput) {
  return prisma.examSchedule.create({
    data: {
      tenantId,
      termId: input.termId,
      courseId: input.courseId,
      section: input.section,
      examType: input.examType,
      examDate: new Date(input.examDate),
      startTime: input.startTime,
      endTime: input.endTime,
      room: input.room,
      seatRange: input.seatRange ?? null,
      invigilatorId: input.invigilatorId ?? null,
      invigilatorName: input.invigilatorName ?? null,
      notes: input.notes ?? null,
    },
  });
}

export async function updateExamSchedule(tenantId: string, input: UpdateExamScheduleInput) {
  return prisma.examSchedule.update({
    where: { id: input.id, tenantId },
    data: {
      termId: input.termId,
      courseId: input.courseId,
      section: input.section,
      examType: input.examType,
      examDate: new Date(input.examDate),
      startTime: input.startTime,
      endTime: input.endTime,
      room: input.room,
      seatRange: input.seatRange ?? null,
      invigilatorId: input.invigilatorId ?? null,
      invigilatorName: input.invigilatorName ?? null,
      notes: input.notes ?? null,
    },
  });
}

export async function deleteExamSchedule(tenantId: string, id: string) {
  return prisma.examSchedule.delete({
    where: { id, tenantId },
  });
}

export type ClassScheduleRow = Awaited<ReturnType<typeof adminListClassSchedules>>[number];
export type ExamScheduleRow = Awaited<ReturnType<typeof adminListExamSchedules>>[number];
export type AcademicTermRow = Awaited<ReturnType<typeof listAcademicTerms>>[number];
export type ScheduleOptions = Awaited<ReturnType<typeof listScheduleOptions>>;

