import { requirePermission, hasPermission } from "@/features/identity/server";
import {
  STUDENTS_P,
  adminListStudents,
  listStudentOptions,
} from "@/features/student-stats/server";
import { StudentClient } from "./_components/student-client";

export default async function AdminStudentsPage() {
  const ctx = await requirePermission(STUDENTS_P.studentsRead);
  const [initialStudents, options] = await Promise.all([
    adminListStudents(ctx.tenantId),
    listStudentOptions(ctx.tenantId),
  ]);

  return (
    <StudentClient
      initialStudents={initialStudents}
      options={options}
      canManage={hasPermission(ctx, STUDENTS_P.studentsManage)}
    />
  );
}
