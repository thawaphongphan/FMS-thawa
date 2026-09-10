import type { PermissionDef } from "@/shared/lib/permission-def";

export const ALUMNI_P = {
  alumniRead: "alumni:read",
  alumniManage: "alumni:manage",
} as const;

export const ALUMNI_PERMISSIONS: readonly PermissionDef[] = [
  { code: ALUMNI_P.alumniRead, module: "alumni", action: "read", description: "ดูข้อมูลศิษย์เก่า" },
  { code: ALUMNI_P.alumniManage, module: "alumni", action: "manage", description: "จัดการข้อมูลศิษย์เก่าและเรื่องราวความสำเร็จ" },
];
