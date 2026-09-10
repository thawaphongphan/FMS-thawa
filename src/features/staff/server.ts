import "server-only";

export {
  listDepartments,
  listPublicStaff,
  getStaffById,
  adminListStaff,
  type StaffProfileDto,
  type DepartmentDto,
  type EducationItem,
} from "./_internal/services";
export { STAFF_P, STAFF_PERMISSIONS } from "./permissions";
