import type { PermissionDef } from "@/shared/lib/permission-def";

export const STAFF_P = {
  staffRead: "staff:read",
  staffManage: "staff:manage",
} as const;

export const STAFF_PERMISSIONS: readonly PermissionDef[] = [
  { code: STAFF_P.staffRead, module: "staff", action: "read", description: "ดูข้อมูลบุคลากร" },
  { code: STAFF_P.staffManage, module: "staff", action: "manage", description: "จัดการข้อมูลบุคลากรและโครงสร้างภาควิชา" },
];
