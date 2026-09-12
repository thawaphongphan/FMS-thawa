"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Building2,
  BookOpen,
  GraduationCap,
  AlertTriangle,
} from "lucide-react";
import { useT } from "@/shared/lib/i18n/client";
import type { DepartmentDto } from "@/features/department";
import {
  createDepartmentAction,
  updateDepartmentAction,
  deleteDepartmentAction,
} from "@/features/department/actions";
import { Button } from "@/components/ui/button";
import {
  LiyonCard,
  StatusPill,
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
} from "@/shared/components/liyon";

interface DepartmentClientProps {
  initialDepartments: DepartmentDto[];
  canManage: boolean;
}

export function DepartmentClient({ initialDepartments, canManage }: DepartmentClientProps) {
  const t = useT();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [departments, setDepartments] = useState<DepartmentDto[]>(initialDepartments);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  // Create / Edit Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentDto | null>(null);

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState<DepartmentDto | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    code: "",
    nameTh: "",
    nameEn: "",
    description: "",
    orderIndex: 0,
    isActive: true,
  });

  const openCreateDialog = () => {
    setEditingDept(null);
    setFormData({
      code: "",
      nameTh: "",
      nameEn: "",
      description: "",
      orderIndex: departments.length + 1,
      isActive: true,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (item: DepartmentDto) => {
    setEditingDept(item);
    setFormData({
      code: item.code,
      nameTh: item.nameTh,
      nameEn: item.nameEn,
      description: item.description || "",
      orderIndex: item.orderIndex,
      isActive: item.isActive,
    });
    setDialogOpen(true);
  };

  const openDeleteDialog = (item: DepartmentDto) => {
    setDeptToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      if (editingDept) {
        const res = await updateDepartmentAction({
          id: editingDept.id,
          ...formData,
        });
        if (res.ok) {
          toast.success(t("department.saveSuccess"));
          setDepartments((prev) =>
            prev.map((d) => (d.id === editingDept.id ? { ...d, ...res.data } : d))
          );
          setDialogOpen(false);
          router.refresh();
        } else {
          toast.error(res.error.message || "Failed to save department");
        }
      } else {
        const res = await createDepartmentAction(formData);
        if (res.ok) {
          toast.success(t("department.saveSuccess"));
          setDepartments((prev) => [...prev, { ...res.data, curriculaCount: 0, staffCount: 0 }]);
          setDialogOpen(false);
          router.refresh();
        } else {
          toast.error(res.error.message || "Failed to create department");
        }
      }
    });
  };

  const handleDelete = () => {
    if (!deptToDelete) return;
    startTransition(async () => {
      const res = await deleteDepartmentAction({ id: deptToDelete.id });
      if (res.ok) {
        toast.success(t("department.deleteSuccess"));
        setDepartments((prev) => prev.filter((d) => d.id !== deptToDelete.id));
        setDeleteDialogOpen(false);
        setDeptToDelete(null);
        router.refresh();
      } else {
        const msg =
          res.error.message === "department.deleteHasCurricula"
            ? t("department.deleteHasCurricula")
            : res.error.message === "department.deleteHasStaff"
            ? t("department.deleteHasStaff")
            : res.error.message || "Failed to delete department";
        toast.error(msg);
      }
    });
  };

  // Filtered list
  const filteredDepartments = departments.filter((d) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      d.code.toLowerCase().includes(q) ||
      d.nameTh.toLowerCase().includes(q) ||
      d.nameEn.toLowerCase().includes(q) ||
      (d.description && d.description.toLowerCase().includes(q));

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && d.isActive) ||
      (statusFilter === "INACTIVE" && !d.isActive);

    return matchesSearch && matchesStatus;
  });

  // KPI calculations
  const totalDepts = departments.length;
  const activeDepts = departments.filter((d) => d.isActive).length;
  const totalCurricula = departments.reduce((acc, d) => acc + (d.curriculaCount || 0), 0);
  const totalStaff = departments.reduce((acc, d) => acc + (d.staffCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {t("department.adminTitle")}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {t("department.adminSubtitle")}
          </p>
        </div>

        {canManage && (
          <Button onClick={openCreateDialog} className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            {t("department.create")}
          </Button>
        )}
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <LiyonCard className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{t("department.title")}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{totalDepts}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Building2 className="h-5 w-5" />
          </div>
        </LiyonCard>

        <LiyonCard className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{t("department.active")}</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{activeDepts}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <StatusPill tone="ok">{t("department.active")}</StatusPill>
          </div>
        </LiyonCard>

        <LiyonCard className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{t("department.curriculaCount")}</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{totalCurricula}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
            <BookOpen className="h-5 w-5" />
          </div>
        </LiyonCard>

        <LiyonCard className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{t("department.staffCount")}</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">{totalStaff}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600">
            <GraduationCap className="h-5 w-5" />
          </div>
        </LiyonCard>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-card p-4 rounded-xl border border-border">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("department.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "ALL" | "ACTIVE" | "INACTIVE")}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="ALL">-- ทุกสถานะ --</option>
            <option value="ACTIVE">{t("department.active")}</option>
            <option value="INACTIVE">{t("department.inactive")}</option>
          </select>
        </div>
      </div>

      {/* Departments Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs font-medium text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3 w-16 text-center">{t("department.orderIndex")}</th>
                <th className="px-4 py-3 w-28">{t("department.code")}</th>
                <th className="px-4 py-3">{t("department.nameTh")}</th>
                <th className="px-4 py-3">{t("department.nameEn")}</th>
                <th className="px-4 py-3 text-center w-36">{t("department.curriculaCount")}</th>
                <th className="px-4 py-3 text-center w-32">{t("department.staffCount")}</th>
                <th className="px-4 py-3 text-center w-28">{t("department.status")}</th>
                {canManage && <th className="px-4 py-3 text-right w-24">จัดการ</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredDepartments.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 8 : 7} className="px-4 py-12 text-center text-muted-foreground">
                    {t("department.empty")}
                  </td>
                </tr>
              ) : (
                filteredDepartments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3.5 text-center font-mono text-xs text-muted-foreground">
                      {dept.orderIndex}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md font-mono text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                        {dept.code}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-foreground">
                      <div>{dept.nameTh}</div>
                      {dept.description && (
                        <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {dept.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">{dept.nameEn}</td>
                    <td className="px-4 py-3.5 text-center">
                      <Link
                        href={`/admin/curriculum?departmentId=${dept.id}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 hover:bg-blue-100 transition-colors"
                        title={t("department.viewCurricula")}
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>{dept.curriculaCount || 0} หลักสูตร</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Link
                        href={`/admin/staff?departmentId=${dept.id}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 hover:bg-purple-100 transition-colors"
                      >
                        <GraduationCap className="h-3.5 w-3.5" />
                        <span>{dept.staffCount || 0} คน</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <StatusPill tone={dept.isActive ? "ok" : "off"}>
                        {dept.isActive ? t("department.active") : t("department.inactive")}
                      </StatusPill>
                    </td>
                    {canManage && (
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(dept)}
                            className="h-8 w-8 p-0"
                            title={t("department.edit")}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(dept)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            title={t("department.delete")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Dialog */}
      <LiyonDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <div className="p-6 max-w-lg w-full bg-background rounded-2xl border border-border shadow-xl">
          <LiyonDialogHeader
            title={editingDept ? t("department.edit") : t("department.create")}
            description={t("department.adminSubtitle")}
          />
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <LiyonDialogBody>
              <div className="space-y-4">
                {/* Department Code */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t("department.code")} <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น CS, SE, DS, ACADEMIC"
                    value={formData.code}
                    onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {t("department.codeHelp")}
                  </p>
                </div>

                {/* Name TH */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t("department.nameTh")} <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ภาควิชาวิทยาการคอมพิวเตอร์"
                    value={formData.nameTh}
                    onChange={(e) => setFormData((prev) => ({ ...prev, nameTh: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Name EN */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t("department.nameEn")} <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Department of Computer Science"
                    value={formData.nameEn}
                    onChange={(e) => setFormData((prev) => ({ ...prev, nameEn: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t("department.description")}
                  </label>
                  <textarea
                    rows={3}
                    placeholder="คำอธิบายรายละเอียด พันธกิจ หรือขอบเขตของภาควิชา..."
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Order Index & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      {t("department.orderIndex")}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.orderIndex}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, orderIndex: parseInt(e.target.value, 10) || 0 }))
                      }
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      {t("department.status")}
                    </label>
                    <select
                      value={formData.isActive ? "ACTIVE" : "INACTIVE"}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, isActive: e.target.value === "ACTIVE" }))
                      }
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="ACTIVE">{t("department.active")}</option>
                      <option value="INACTIVE">{t("department.inactive")}</option>
                    </select>
                  </div>
                </div>
              </div>
            </LiyonDialogBody>

            <LiyonDialogFooter>
              <div className="flex items-center justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={pending}
                >
                  ยกเลิก
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                </Button>
              </div>
            </LiyonDialogFooter>
          </form>
        </div>
      </LiyonDialog>

      {/* Delete Confirmation Dialog */}
      <LiyonDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <div className="p-6 max-w-md w-full bg-background rounded-2xl border border-border shadow-xl">
          <LiyonDialogHeader
            title={t("department.delete")}
            description={t("department.deleteConfirm")}
          />
          <LiyonDialogBody>
            {deptToDelete && (
              <div className="space-y-4 my-3">
                <div className="p-3 bg-muted rounded-lg text-sm">
                  <div className="font-semibold text-foreground">{deptToDelete.nameTh}</div>
                  <div className="text-xs text-muted-foreground font-mono mt-0.5">
                    Code: {deptToDelete.code} ({deptToDelete.nameEn})
                  </div>
                </div>

                {(deptToDelete.curriculaCount || 0) > 0 && (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>
                      {t("department.deleteHasCurricula")} ({deptToDelete.curriculaCount} หลักสูตร)
                    </span>
                  </div>
                )}

                {(deptToDelete.staffCount || 0) > 0 && (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>
                      {t("department.deleteHasStaff")} ({deptToDelete.staffCount} บุคลากร)
                    </span>
                  </div>
                )}
              </div>
            )}
          </LiyonDialogBody>
          <LiyonDialogFooter>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={pending}
              >
                ยกเลิก
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={
                  pending ||
                  (deptToDelete ? (deptToDelete.curriculaCount || 0) > 0 || (deptToDelete.staffCount || 0) > 0 : false)
                }
              >
                {pending ? "กำลังลบ..." : "ยืนยันการลบ"}
              </Button>
            </div>
          </LiyonDialogFooter>
        </div>
      </LiyonDialog>
    </div>
  );
}
