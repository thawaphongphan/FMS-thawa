import { requirePermission, hasPermission } from "@/features/identity/server";
import { SCHEDULE_P } from "@/features/schedule";
import {
  listAcademicTerms,
  adminListClassSchedules,
  adminListExamSchedules,
  listScheduleOptions,
} from "@/features/schedule/server";
import { ScheduleClient } from "./_components/schedule-client";

export default async function AdminSchedulePage() {
  const ctx = await requirePermission(SCHEDULE_P.scheduleRead);

  const [terms, classes, exams, options] = await Promise.all([
    listAcademicTerms(ctx.tenantId),
    adminListClassSchedules(ctx.tenantId),
    adminListExamSchedules(ctx.tenantId),
    listScheduleOptions(ctx.tenantId),
  ]);

  return (
    <ScheduleClient
      initialTerms={terms}
      initialClasses={classes}
      initialExams={exams}
      options={options}
      canManage={hasPermission(ctx, SCHEDULE_P.scheduleManage)}
    />
  );
}
