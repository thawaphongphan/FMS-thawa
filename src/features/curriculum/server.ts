import "server-only";

export {
  listPublicCurricula,
  listActiveDegreeLevels,
  getCurriculumById,
  adminListCurricula,
  type CurriculumDto,
  type CurriculumCourseDto,
  type CurriculumDepartmentSummary,
} from "./_internal/services";
