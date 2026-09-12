"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Search, BookOpen, Check, X, Building2 } from "lucide-react";
import { useLocale, useT } from "@/shared/lib/i18n/client";
import type { CurriculumDto } from "@/features/curriculum";
import {
  createCurriculumAction,
  updateCurriculumAction,
  deleteCurriculumAction,
} from "@/features/curriculum/actions";
import { Button } from "@/components/ui/button";

export interface DepartmentOption {
  id: string;
  code: string;
  nameTh: string;
  nameEn: string;
}

interface CurriculumClientProps {
  initialCurricula: CurriculumDto[];
  departments?: DepartmentOption[];
  canManage: boolean;
}

export function CurriculumClient({
  initialCurricula,
  departments = [],
  canManage,
}: CurriculumClientProps) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const [curricula, setCurricula] = useState<CurriculumDto[]>(initialCurricula);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [departmentFilter, setDepartmentFilter] = useState<string>(
    searchParams.get("departmentId") || "ALL"
  );

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCurriculum, setEditingCurriculum] = useState<CurriculumDto | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    departmentId: "",
    degreeLevel: "BACHELOR" as "BACHELOR" | "MASTER" | "DOCTORATE" | "CERTIFICATE" | "TRAINING",
    programCode: "",
    nameTh: "",
    nameEn: "",
    degreeTitleTh: "",
    degreeTitleEn: "",
    totalCredits: 130,
    durationYears: 4,
    revisedYear: 2569,
    brochureUrl: "",
    isActive: true,
  });

  const openCreateDialog = () => {
    setEditingCurriculum(null);
    setFormData({
      departmentId: "",
      degreeLevel: "BACHELOR",
      programCode: "",
      nameTh: "",
      nameEn: "",
      degreeTitleTh: "",
      degreeTitleEn: "",
      totalCredits: 130,
      durationYears: 4,
      revisedYear: 2569,
      brochureUrl: "",
      isActive: true,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (item: CurriculumDto) => {
    setEditingCurriculum(item);
    setFormData({
      departmentId: item.departmentId || "",
      degreeLevel: item.degreeLevel,
      programCode: item.programCode,
      nameTh: item.nameTh,
      nameEn: item.nameEn,
      degreeTitleTh: item.degreeTitleTh,
      degreeTitleEn: item.degreeTitleEn,
      totalCredits: item.totalCredits,
      durationYears: item.durationYears,
      revisedYear: item.revisedYear,
      brochureUrl: item.brochureUrl || "",
      isActive: item.isActive,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      if (editingCurriculum) {
        const res = await updateCurriculumAction({
          id: editingCurriculum.id,
          ...formData,
        });
        if (res.ok) {
          toast.success(t("curriculum.saveSuccess"));
          setCurricula((prev) =>
            prev.map((c) => (c.id === editingCurriculum.id ? res.data : c))
          );
          setDialogOpen(false);
          router.refresh();
        } else {
          toast.error(res.error.message || "Failed to update");
        }
      } else {
        const res = await createCurriculumAction(formData);
        if (res.ok) {
          toast.success(t("curriculum.saveSuccess"));
          setCurricula((prev) => [res.data, ...prev]);
          setDialogOpen(false);
          router.refresh();
        } else {
          toast.error(res.error.message || "Failed to create");
        }
      }
    });
  };

  const handleDelete = (item: CurriculumDto) => {
    if (!confirm(t("curriculum.deleteConfirm"))) return;
    startTransition(async () => {
      const res = await deleteCurriculumAction(item.id);
      if (res.ok) {
        toast.success(t("curriculum.deleteSuccess"));
        setCurricula((prev) => prev.filter((c) => c.id !== item.id));
        router.refresh();
      } else {
        toast.error(res.error.message || "Failed to delete");
      }
    });
  };

  const filteredCurricula = curricula.filter((item) => {
    const matchesSearch =
      search === "" ||
      item.nameTh.toLowerCase().includes(search.toLowerCase()) ||
      item.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      item.programCode.toLowerCase().includes(search.toLowerCase());

    const matchesLevel = levelFilter === "ALL" || item.degreeLevel === levelFilter;
    const matchesDept =
      departmentFilter === "ALL" ||
      (departmentFilter === "NONE" && !item.departmentId) ||
      item.departmentId === departmentFilter;

    return matchesSearch && matchesLevel && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span>{t("curriculum.adminTitle")}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("curriculum.adminSubtitle")}
          </p>
        </div>

        {canManage && (
          <Button onClick={openCreateDialog} className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            <span>{t("curriculum.create")}</span>
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={locale === "th" ? "ค้นหารหัสหรือชื่อหลักสูตร..." : "Search program code or name..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="ALL">{t("curriculum.allLevels")}</option>
          <option value="BACHELOR">{t("curriculum.bachelor")}</option>
          <option value="MASTER">{t("curriculum.master")}</option>
          <option value="DOCTORATE">{t("curriculum.doctorate")}</option>
          <option value="CERTIFICATE">{t("curriculum.certificate")}</option>
          <option value="TRAINING">{t("curriculum.training")}</option>
        </select>

        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="ALL">{t("curriculum.allDepartments")}</option>
          <option value="NONE">{t("curriculum.noDepartment")}</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.code} - {locale === "th" ? dept.nameTh : dept.nameEn}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">{t("curriculum.degreeLevel")}</th>
                <th className="px-4 py-3">{t("curriculum.programCode")}</th>
                <th className="px-4 py-3">{t("curriculum.nameTh")}</th>
                <th className="px-4 py-3">{t("curriculum.department")}</th>
                <th className="px-4 py-3 text-center">{t("curriculum.totalCredits")}</th>
                <th className="px-4 py-3 text-center">{t("curriculum.status")}</th>
                {canManage && <th className="px-4 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCurricula.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 7 : 6} className="px-4 py-8 text-center text-muted-foreground">
                    {t("curriculum.empty")}
                  </td>
                </tr>
              ) : (
                filteredCurricula.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        {item.degreeLevel}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-mono font-medium text-foreground">
                      {item.programCode}
                      <span className="ml-1.5 text-xs text-muted-foreground">({item.revisedYear})</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground">{item.nameTh}</div>
                      <div className="text-xs text-muted-foreground">{item.nameEn}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {item.department ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                          <Building2 className="h-3 w-3" />
                          <span className="font-mono font-semibold">{item.department.code}</span>
                          <span className="text-[11px] text-muted-foreground hidden md:inline">
                            ({item.department.nameTh})
                          </span>
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          {t("curriculum.noDepartment")}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span className="font-semibold">{item.totalCredits}</span> {t("curriculum.creditsUnit")}
                      <div className="text-[11px] text-muted-foreground">
                        {item.durationYears} {item.degreeLevel === "TRAINING" ? t("curriculum.months") : t("curriculum.years")}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                          item.isActive
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {item.isActive ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        <span>{item.isActive ? t("curriculum.active") : t("curriculum.inactive")}</span>
                      </span>
                    </td>
                    {canManage && (
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => openEditDialog(item)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(item)}
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

      {/* Create / Edit Dialog Modal */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-lg font-bold text-foreground">
                {editingCurriculum ? t("curriculum.edit") : t("curriculum.create")}
              </h2>
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Department selection */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  {t("curriculum.department")}
                </label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">{t("curriculum.selectDepartment")}</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.code} - {locale === "th" ? dept.nameTh : dept.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t("curriculum.degreeLevel")}
                  </label>
                  <select
                    value={formData.degreeLevel}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        degreeLevel: e.target.value as "BACHELOR" | "MASTER" | "DOCTORATE" | "CERTIFICATE" | "TRAINING",
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                  >
                    <option value="BACHELOR">{t("curriculum.bachelor")}</option>
                    <option value="MASTER">{t("curriculum.master")}</option>
                    <option value="DOCTORATE">{t("curriculum.doctorate")}</option>
                    <option value="CERTIFICATE">{t("curriculum.certificate")}</option>
                    <option value="TRAINING">{t("curriculum.training")}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t("curriculum.programCode")}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.programCode}
                    onChange={(e) => setFormData({ ...formData, programCode: e.target.value })}
                    placeholder="e.g. CS-2569"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  {t("curriculum.nameTh")}
                </label>
                <input
                  type="text"
                  required
                  value={formData.nameTh}
                  onChange={(e) => setFormData({ ...formData, nameTh: e.target.value })}
                  placeholder="หลักสูตรวิทยาศาสตรบัณฑิต..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  {t("curriculum.nameEn")}
                </label>
                <input
                  type="text"
                  required
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  placeholder="Bachelor of Science Program in..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t("curriculum.degreeTitleTh")}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.degreeTitleTh}
                    onChange={(e) => setFormData({ ...formData, degreeTitleTh: e.target.value })}
                    placeholder="วท.บ. (วิทยาการคอมพิวเตอร์)"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t("curriculum.degreeTitleEn")}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.degreeTitleEn}
                    onChange={(e) => setFormData({ ...formData, degreeTitleEn: e.target.value })}
                    placeholder="B.Sc. (Computer Science)"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t("curriculum.totalCredits")}
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formData.totalCredits}
                    onChange={(e) => setFormData({ ...formData, totalCredits: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {formData.degreeLevel === "TRAINING"
                      ? t("curriculum.durationMonths")
                      : t("curriculum.durationYears")}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={formData.degreeLevel === "TRAINING" ? 120 : 10}
                    required
                    value={formData.durationYears}
                    onChange={(e) => setFormData({ ...formData, durationYears: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t("curriculum.revisedYear")}
                  </label>
                  <input
                    type="number"
                    min={2500}
                    max={2650}
                    required
                    value={formData.revisedYear}
                    onChange={(e) => setFormData({ ...formData, revisedYear: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  {t("curriculum.brochure")}
                </label>
                <input
                  type="url"
                  value={formData.brochureUrl}
                  onChange={(e) => setFormData({ ...formData, brochureUrl: e.target.value })}
                  placeholder="https://.../brochure.pdf"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-input"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-foreground">
                  {t("curriculum.active")}
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
