import type { PermissionDef } from "@/shared/lib/permission-def";
import { IDENTITY_PERMISSIONS } from "@/features/identity/permissions";
import { SAMPLE_PERMISSIONS } from "@/features/sample/permissions";
import { NEWS_PERMISSIONS } from "@/features/news/permissions";
import { STAFF_PERMISSIONS } from "@/features/staff/permissions";
import { CURRICULUM_PERMISSIONS } from "@/features/curriculum/permissions";
import { SCHEDULE_PERMISSIONS } from "@/features/schedule/permissions";
import { ALUMNI_PERMISSIONS } from "@/features/alumni/permissions";
import { STUDENTS_PERMISSIONS } from "@/features/student-stats/permissions";
import { DEPARTMENT_PERMISSIONS } from "@/features/department/permissions";

/** สิทธิ์ทั้งระบบ — feature ใหม่เพิ่มบรรทัดที่นี่ · seed เขียนลง permissions ทุกครั้ง */
export const ALL_PERMISSIONS: readonly PermissionDef[] = [
  ...IDENTITY_PERMISSIONS,
  ...SAMPLE_PERMISSIONS,
  ...NEWS_PERMISSIONS,
  ...STAFF_PERMISSIONS,
  ...CURRICULUM_PERMISSIONS,
  ...SCHEDULE_PERMISSIONS,
  ...ALUMNI_PERMISSIONS,
  ...STUDENTS_PERMISSIONS,
  ...DEPARTMENT_PERMISSIONS,
];

const codes = ALL_PERMISSIONS.map((p) => p.code);
if (new Set(codes).size !== codes.length) throw new Error("permission code ซ้ำใน ALL_PERMISSIONS");
