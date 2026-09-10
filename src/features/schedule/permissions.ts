import type { PermissionDef } from "@/shared/lib/permission-def";

export const SCHEDULE_P = {
  scheduleRead: "schedule:read",
  scheduleManage: "schedule:manage",
} as const;

export const SCHEDULE_PERMISSIONS: readonly PermissionDef[] = [
  { code: SCHEDULE_P.scheduleRead, module: "schedule", action: "read", description: "ดูตารางเรียนและตารางสอบ" },
  { code: SCHEDULE_P.scheduleManage, module: "schedule", action: "manage", description: "จัดการตารางเรียนและตารางสอบ" },
];
