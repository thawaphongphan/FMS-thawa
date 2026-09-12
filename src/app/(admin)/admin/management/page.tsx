import { redirect } from "next/navigation";
import { requireSession, hasPermission } from "@/features/identity/server";
import { DEPARTMENT_P } from "@/features/department";
import { CURRICULUM_P } from "@/features/curriculum";

export default async function AdminManagementPage() {
  const ctx = await requireSession();
  if (hasPermission(ctx, DEPARTMENT_P.departmentRead)) {
    redirect("/admin/departments");
  }
  if (hasPermission(ctx, CURRICULUM_P.curriculumRead)) {
    redirect("/admin/curriculum");
  }
  redirect("/dashboard");
}
