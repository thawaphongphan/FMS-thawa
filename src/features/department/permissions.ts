import type { PermissionDef } from "@/shared/lib/permission-def";

export const DEPARTMENT_P = {
  departmentRead: "department:read",
  departmentManage: "department:manage",
} as const;

export const DEPARTMENT_PERMISSIONS: readonly PermissionDef[] = [
  { code: DEPARTMENT_P.departmentRead, module: "department", action: "read", description: "ดูข้อมูลภาควิชาและส่วนงาน" },
  { code: DEPARTMENT_P.departmentManage, module: "department", action: "manage", description: "จัดการภาควิชาและส่วนงาน" },
];
