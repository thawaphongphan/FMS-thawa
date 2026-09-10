import type { PermissionDef } from "@/shared/lib/permission-def";

export const STUDENTS_P = {
  studentsRead: "students:read",
  studentsManage: "students:manage",
} as const;

export const STUDENTS_PERMISSIONS: readonly PermissionDef[] = [
  { code: STUDENTS_P.studentsRead, module: "students", action: "read", description: "ดูข้อมูลและสถิตินิสิต" },
  { code: STUDENTS_P.studentsManage, module: "students", action: "manage", description: "จัดการข้อมูลนิสิตและข้อมูลประชากรศาสตร์" },
];
