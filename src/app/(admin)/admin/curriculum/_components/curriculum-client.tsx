"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  BookOpen,
  Check,
  X,
  Building2,
  Target,
  Briefcase,
  FileText,
  Users,
  Download,
  Upload,
} from "lucide-react";
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

type TabType = "basic" | "philosophy" | "careers" | "plans";

const initialFormDetails = {
  philosophyTh: "",
  philosophyEn: "",
  objectivesTh: "",
  objectivesEn: "",
  careerPathsTh: "",
  careerPathsEn: "",
  admissionCriteriaTh: "",
  admissionCriteriaEn: "",
  englishProficiencyRequirements: "",
  studyPlansSummaryTh: "",
  studyPlansSummaryEn: "",
  tuitionFeeEstimate: "",
};

const initialFormData = {
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
  details: { ...initialFormDetails },
};

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

  // Dialog State & Active Tab
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("basic");
  const [editingCurriculum, setEditingCurriculum] = useState<CurriculumDto | null>(null);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState(initialFormData);

  const openCreateDialog = () => {
    setEditingCurriculum(null);
    setActiveTab("basic");
    setFormData({
      ...initialFormData,
      details: { ...initialFormDetails },
    });
    setDialogOpen(true);
  };

  const openEditDialog = (item: CurriculumDto) => {
    setEditingCurriculum(item);
    setActiveTab("basic");
    const d = item.details || {};
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
      details: {
        philosophyTh: d.philosophyTh || "",
        philosophyEn: d.philosophyEn || "",
        objectivesTh: Array.isArray(d.objectivesTh)
          ? d.objectivesTh.join("\n")
          : typeof d.objectivesTh === "string"
          ? d.objectivesTh
          : "",
        objectivesEn: Array.isArray(d.objectivesEn)
          ? d.objectivesEn.join("\n")
          : typeof d.objectivesEn === "string"
          ? d.objectivesEn
          : "",
        careerPathsTh: Array.isArray(d.careerPathsTh)
          ? d.careerPathsTh.join("\n")
          : typeof d.careerPathsTh === "string"
          ? d.careerPathsTh
          : "",
        careerPathsEn: Array.isArray(d.careerPathsEn)
          ? d.careerPathsEn.join("\n")
          : typeof d.careerPathsEn === "string"
          ? d.careerPathsEn
          : "",
        admissionCriteriaTh: d.admissionCriteriaTh || "",
        admissionCriteriaEn: d.admissionCriteriaEn || "",
        englishProficiencyRequirements: (d.englishProficiencyRequirements as string) || "",
        studyPlansSummaryTh: d.studyPlansSummaryTh || "",
        studyPlansSummaryEn: d.studyPlansSummaryEn || "",
        tuitionFeeEstimate: d.tuitionFeeEstimate || "",
      },
    });
    setDialogOpen(true);
  };

  const parseLines = (text: string) =>
    text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

  const handleExportCurriculumJson = () => {
    const exportObject = {
      programCode: formData.programCode,
      degreeLevel: formData.degreeLevel,
      nameTh: formData.nameTh,
      nameEn: formData.nameEn,
      degreeTitleTh: formData.degreeTitleTh,
      degreeTitleEn: formData.degreeTitleEn,
      totalCredits: formData.totalCredits,
      durationYears: formData.durationYears,
      revisedYear: formData.revisedYear,
      departmentId: formData.departmentId || null,
      brochureUrl: formData.brochureUrl || null,
      isActive: formData.isActive,
      details: {
        philosophyTh: formData.details.philosophyTh,
        philosophyEn: formData.details.philosophyEn,
        objectivesTh: parseLines(formData.details.objectivesTh),
        objectivesEn: parseLines(formData.details.objectivesEn),
        careerPathsTh: parseLines(formData.details.careerPathsTh),
        careerPathsEn: parseLines(formData.details.careerPathsEn),
        admissionCriteriaTh: formData.details.admissionCriteriaTh,
        admissionCriteriaEn: formData.details.admissionCriteriaEn,
        englishProficiencyRequirements: formData.details.englishProficiencyRequirements,
        studyPlansSummaryTh: formData.details.studyPlansSummaryTh,
        studyPlansSummaryEn: formData.details.studyPlansSummaryEn,
        tuitionFeeEstimate: formData.details.tuitionFeeEstimate,
      },
    };

    const jsonStr = JSON.stringify(exportObject, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const code = (formData.programCode || "curriculum").trim().replace(/[^a-zA-Z0-9_-]/g, "_");
    const year = formData.revisedYear || "tqf2";
    a.href = url;
    a.download = `${code}_${year}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportCurriculumJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = (e.target?.result as string) || "";
        const data = JSON.parse(text);

        if (!data || typeof data !== "object") {
          toast.error(t("curriculum.importJsonError"));
          return;
        }

        const d = (data.details && typeof data.details === "object" ? data.details : {}) as Record<string, unknown>;
        const toMultiline = (val: unknown): string => {
          if (Array.isArray(val)) return val.join("\n");
          if (typeof val === "string") return val;
          return "";
        };

        setFormData((prev) => ({
          ...prev,
          departmentId: typeof data.departmentId === "string" ? data.departmentId : prev.departmentId,
          degreeLevel: data.degreeLevel || prev.degreeLevel,
          programCode: data.programCode !== undefined ? String(data.programCode) : prev.programCode,
          nameTh: data.nameTh !== undefined ? String(data.nameTh) : prev.nameTh,
          nameEn: data.nameEn !== undefined ? String(data.nameEn) : prev.nameEn,
          degreeTitleTh: data.degreeTitleTh !== undefined ? String(data.degreeTitleTh) : prev.degreeTitleTh,
          degreeTitleEn: data.degreeTitleEn !== undefined ? String(data.degreeTitleEn) : prev.degreeTitleEn,
          totalCredits: data.totalCredits !== undefined ? Number(data.totalCredits) || prev.totalCredits : prev.totalCredits,
          durationYears: data.durationYears !== undefined ? Number(data.durationYears) || prev.durationYears : prev.durationYears,
          revisedYear: data.revisedYear !== undefined ? Number(data.revisedYear) || prev.revisedYear : prev.revisedYear,
          brochureUrl: data.brochureUrl !== undefined ? String(data.brochureUrl || "") : prev.brochureUrl,
          isActive: typeof data.isActive === "boolean" ? data.isActive : prev.isActive,
          details: {
            philosophyTh: d.philosophyTh !== undefined ? String(d.philosophyTh) : prev.details.philosophyTh,
            philosophyEn: d.philosophyEn !== undefined ? String(d.philosophyEn) : prev.details.philosophyEn,
            objectivesTh: d.objectivesTh !== undefined ? toMultiline(d.objectivesTh) : prev.details.objectivesTh,
            objectivesEn: d.objectivesEn !== undefined ? toMultiline(d.objectivesEn) : prev.details.objectivesEn,
            careerPathsTh: d.careerPathsTh !== undefined ? toMultiline(d.careerPathsTh) : prev.details.careerPathsTh,
            careerPathsEn: d.careerPathsEn !== undefined ? toMultiline(d.careerPathsEn) : prev.details.careerPathsEn,
            admissionCriteriaTh: d.admissionCriteriaTh !== undefined ? String(d.admissionCriteriaTh) : prev.details.admissionCriteriaTh,
            admissionCriteriaEn: d.admissionCriteriaEn !== undefined ? String(d.admissionCriteriaEn) : prev.details.admissionCriteriaEn,
            englishProficiencyRequirements: d.englishProficiencyRequirements !== undefined ? String(d.englishProficiencyRequirements) : prev.details.englishProficiencyRequirements,
            studyPlansSummaryTh: d.studyPlansSummaryTh !== undefined ? String(d.studyPlansSummaryTh) : prev.details.studyPlansSummaryTh,
            studyPlansSummaryEn: d.studyPlansSummaryEn !== undefined ? String(d.studyPlansSummaryEn) : prev.details.studyPlansSummaryEn,
            tuitionFeeEstimate: d.tuitionFeeEstimate !== undefined ? String(d.tuitionFeeEstimate) : prev.details.tuitionFeeEstimate,
          },
        }));

        toast.success(t("curriculum.importJsonSuccess"));
      } catch {
        toast.error(t("curriculum.importJsonError"));
      }
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const payload = {
        ...formData,
        details: {
          philosophyTh: formData.details.philosophyTh.trim(),
          philosophyEn: formData.details.philosophyEn.trim(),
          objectivesTh: parseLines(formData.details.objectivesTh),
          objectivesEn: parseLines(formData.details.objectivesEn),
          careerPathsTh: parseLines(formData.details.careerPathsTh),
          careerPathsEn: parseLines(formData.details.careerPathsEn),
          admissionCriteriaTh: formData.details.admissionCriteriaTh.trim(),
          admissionCriteriaEn: formData.details.admissionCriteriaEn.trim(),
          englishProficiencyRequirements: formData.details.englishProficiencyRequirements.trim(),
          studyPlansSummaryTh: formData.details.studyPlansSummaryTh.trim(),
          studyPlansSummaryEn: formData.details.studyPlansSummaryEn.trim(),
          tuitionFeeEstimate: formData.details.tuitionFeeEstimate.trim(),
        },
      };

      if (editingCurriculum) {
        const res = await updateCurriculumAction({
          id: editingCurriculum.id,
          ...payload,
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
        const res = await createCurriculumAction(payload);
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
    const studentCount = item._count?.studentProfiles ?? 0;
    const alumniCount = item._count?.alumniProfiles ?? 0;
    const hasEnrolled = studentCount > 0 || alumniCount > 0;

    if (hasEnrolled) {
      const details: string[] = [];
      if (studentCount > 0) {
        details.push(locale === "th" ? `นิสิตปัจจุบัน ${studentCount} คน` : `${studentCount} current students`);
      }
      if (alumniCount > 0) {
        details.push(locale === "th" ? `ศิษย์เก่า ${alumniCount} คน` : `${alumniCount} alumni`);
      }

      toast.error(
        locale === "th"
          ? `ไม่สามารถลบหลักสูตร "${item.nameTh}" ได้ เนื่องจากมีข้อมูล${details.join(" และ ")}สังกัดอยู่ กรุณาย้ายหรือลบข้อมูลดังกล่าวก่อน หรือเลือกปิดสถานะการเปิดสอนแทน`
          : `Cannot delete "${item.nameEn}": ${details.join(" and ")} are enrolled. Please reassign or delete them first, or deactivate the curriculum instead.`
      );
      return;
    }

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
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
                        <span className="text-xs text-muted-foreground">{item.nameEn}</span>
                        {((item._count?.studentProfiles ?? 0) > 0 || (item._count?.alumniProfiles ?? 0) > 0) && (
                          <div className="flex items-center gap-1.5 text-[11px]">
                            {(item._count?.studentProfiles ?? 0) > 0 && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 font-medium">
                                <Users className="h-3 w-3" />
                                {item._count?.studentProfiles} {t("curriculum.students")}
                              </span>
                            )}
                            {(item._count?.alumniProfiles ?? 0) > 0 && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60 font-medium">
                                <Users className="h-3 w-3" />
                                {item._count?.alumniProfiles} {t("curriculum.alumni")}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
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
                          {(() => {
                            const studentCount = item._count?.studentProfiles ?? 0;
                            const alumniCount = item._count?.alumniProfiles ?? 0;
                            const hasEnrolled = studentCount > 0 || alumniCount > 0;
                            const tooltipText = hasEnrolled
                              ? locale === "th"
                                ? `ไม่สามารถลบได้เนื่องจากมีข้อมูลผูกอยู่ (นิสิต ${studentCount} คน, ศิษย์เก่า ${alumniCount} คน)`
                                : `Cannot delete: ${studentCount} students, ${alumniCount} alumni enrolled`
                              : t("curriculum.delete");

                            return (
                              <Button
                                variant="ghost"
                                size="icon"
                                title={tooltipText}
                                className={`h-8 w-8 transition-colors ${
                                  hasEnrolled
                                    ? "text-muted-foreground/40 hover:text-amber-600 hover:bg-amber-500/10 cursor-not-allowed"
                                    : "text-destructive hover:bg-destructive/10"
                                }`}
                                onClick={() => handleDelete(item)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            );
                          })()}
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
          <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4 bg-muted/20">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  {editingCurriculum ? t("curriculum.edit") : t("curriculum.create")}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {locale === "th"
                    ? "กรอกรายละเอียดหลักสูตรตามโครงสร้าง มคอ. 2 เพื่อเผยแพร่บนหน้า Portal"
                    : "Fill curriculum information following TQF 2 structure for portal publication"}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  ref={jsonFileInputRef}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImportCurriculumJson(file);
                    e.target.value = "";
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleExportCurriculumJson}
                  className="h-8 gap-1.5 text-xs bg-background shadow-xs hover:bg-muted"
                  title={t("curriculum.exportJson")}
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>{t("curriculum.exportJson")}</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => jsonFileInputRef.current?.click()}
                  className="h-8 gap-1.5 text-xs bg-background shadow-xs hover:bg-muted"
                  title={t("curriculum.importJson")}
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>{t("curriculum.importJson")}</span>
                </Button>
                <button
                  type="button"
                  onClick={() => setDialogOpen(false)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors ml-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-border bg-muted/10 px-6 space-x-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab("basic")}
                className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "basic"
                    ? "border-primary text-primary bg-background shadow-xs rounded-t-lg"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>{t("curriculum.tabBasic")}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("philosophy")}
                className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "philosophy"
                    ? "border-primary text-primary bg-background shadow-xs rounded-t-lg"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Target className="h-3.5 w-3.5" />
                <span>{t("curriculum.tabPhilosophy")}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("careers")}
                className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "careers"
                    ? "border-primary text-primary bg-background shadow-xs rounded-t-lg"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Briefcase className="h-3.5 w-3.5" />
                <span>{t("curriculum.tabCareers")}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("plans")}
                className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "plans"
                    ? "border-primary text-primary bg-background shadow-xs rounded-t-lg"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>{t("curriculum.tabPlans")}</span>
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* TAB 1: BASIC INFO */}
                {activeTab === "basic" && (
                  <div className="space-y-4">
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
                              degreeLevel: e.target.value as
                                | "BACHELOR"
                                | "MASTER"
                                | "DOCTORATE"
                                | "CERTIFICATE"
                                | "TRAINING",
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
                          {t("curriculum.programCode")} <span className="text-destructive">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.programCode}
                          onChange={(e) => setFormData({ ...formData, programCode: e.target.value })}
                          placeholder="e.g. 629-MBD หรือ CS-2569"
                          className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        {t("curriculum.nameTh")} <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.nameTh}
                        onChange={(e) => setFormData({ ...formData, nameTh: e.target.value })}
                        placeholder="เช่น หลักสูตรพุทธศาสตรมหาบัณฑิต สาขาวิชาพระธรรมทูต"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        {t("curriculum.nameEn")} <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.nameEn}
                        onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                        placeholder="e.g. Master of Buddhism Program in Dhammaduta"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1">
                          {t("curriculum.degreeTitleTh")} <span className="text-destructive">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.degreeTitleTh}
                          onChange={(e) => setFormData({ ...formData, degreeTitleTh: e.target.value })}
                          placeholder="เช่น พุทธศาสตรมหาบัณฑิต (พระธรรมทูต) / พธ.ม. (พระธรรมทูต)"
                          className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1">
                          {t("curriculum.degreeTitleEn")} <span className="text-destructive">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.degreeTitleEn}
                          onChange={(e) => setFormData({ ...formData, degreeTitleEn: e.target.value })}
                          placeholder="e.g. Master of Buddhism (Dhammaduta) / M.B. (Dhammaduta)"
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
                  </div>
                )}

                {/* TAB 2: PHILOSOPHY & OBJECTIVES */}
                {activeTab === "philosophy" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        {t("curriculum.philosophyTh")}
                      </label>
                      <textarea
                        rows={3}
                        value={formData.details.philosophyTh}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            details: { ...formData.details, philosophyTh: e.target.value },
                          })
                        }
                        placeholder="มุ่งสร้างบัณฑิตให้มีความรู้ความเข้าใจหลักพุทธธรรมและศาสตร์สมัยใหม่..."
                        className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background resize-y"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        {t("curriculum.philosophyEn")}
                      </label>
                      <textarea
                        rows={3}
                        value={formData.details.philosophyEn}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            details: { ...formData.details, philosophyEn: e.target.value },
                          })
                        }
                        placeholder="Aims to produce graduates who possess knowledge and understanding of Buddhist teachings..."
                        className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background resize-y"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-foreground">
                          {t("curriculum.objectives")} (ไทย)
                        </label>
                        <span className="text-[11px] text-muted-foreground">1 บรรทัด = 1 ข้อ</span>
                      </div>
                      <textarea
                        rows={5}
                        value={formData.details.objectivesTh}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            details: { ...formData.details, objectivesTh: e.target.value },
                          })
                        }
                        placeholder="1. เพื่อผลิตมหาบัณฑิตที่มีความรู้ความเข้าใจพระไตรปิฎกและหลักพุทธธรรมอย่างลึกซึ้ง&#10;2. เพื่อพัฒนาทักษะการเผยแผ่พระพุทธศาสนาในระดับสากล&#10;3. เพื่อสร้างนักวิจัยและนวัตกรรมการเผยแผ่สู่สังคมสันติสุข"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background resize-y font-mono text-xs leading-relaxed"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-foreground">
                          {t("curriculum.objectives")} (English)
                        </label>
                        <span className="text-[11px] text-muted-foreground">1 line per item</span>
                      </div>
                      <textarea
                        rows={4}
                        value={formData.details.objectivesEn}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            details: { ...formData.details, objectivesEn: e.target.value },
                          })
                        }
                        placeholder="1. To produce graduates with profound knowledge of Tipitaka and Dhamma.&#10;2. To cultivate Dhammaduta leadership skills in international contexts."
                        className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background resize-y font-mono text-xs leading-relaxed"
                      />
                    </div>
                  </div>
                )}

                {/* TAB 3: CAREERS & ADMISSIONS */}
                {activeTab === "careers" && (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-foreground">
                          {t("curriculum.careerPaths")} (ไทย)
                        </label>
                        <span className="text-[11px] text-muted-foreground">1 บรรทัด = 1 อาชีพ</span>
                      </div>
                      <textarea
                        rows={6}
                        value={formData.details.careerPathsTh}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            details: { ...formData.details, careerPathsTh: e.target.value },
                          })
                        }
                        placeholder="พระธรรมทูตทั้งในและต่างประเทศ&#10;นักวิชาการศาสนา / อาจารย์ประจำสาขาวิชาพระพุทธศาสนา&#10;นักเผยแผ่พระพุทธศาสนาและวิปัสสนาจารย์&#10;เจ้าหน้าที่องค์กรพระพุทธศาสนาระดับนานาชาติ"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background resize-y font-mono text-xs leading-relaxed"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-foreground">
                          {t("curriculum.careerPaths")} (English)
                        </label>
                        <span className="text-[11px] text-muted-foreground">1 line per career</span>
                      </div>
                      <textarea
                        rows={4}
                        value={formData.details.careerPathsEn}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            details: { ...formData.details, careerPathsEn: e.target.value },
                          })
                        }
                        placeholder="Dhammaduta Monk / Buddhist Missionary overseas&#10;Buddhist Academic / University Lecturer&#10;Meditation Teacher / Spiritual Counselor"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background resize-y font-mono text-xs leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        {t("curriculum.admissionCriteriaTh")}
                      </label>
                      <textarea
                        rows={3}
                        value={formData.details.admissionCriteriaTh}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            details: { ...formData.details, admissionCriteriaTh: e.target.value },
                          })
                        }
                        placeholder="สำเร็จการศึกษาระดับปริญญาตรี มีเกรดเฉลี่ยสะสมไม่ต่ำกว่า 2.50 หรือมีประสบการณ์ทำงานที่เกี่ยวข้องอย่างน้อย 2 ปี หรือเปรียญธรรม 9 ประโยค..."
                        className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background resize-y"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        {t("curriculum.admissionCriteriaEn")}
                      </label>
                      <textarea
                        rows={3}
                        value={formData.details.admissionCriteriaEn}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            details: { ...formData.details, admissionCriteriaEn: e.target.value },
                          })
                        }
                        placeholder="Hold a Bachelor's degree with a minimum GPA of 2.50 or at least 2 years of relevant experience..."
                        className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background resize-y"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        {t("curriculum.englishProficiency")}
                      </label>
                      <textarea
                        rows={2}
                        value={formData.details.englishProficiencyRequirements}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            details: { ...formData.details, englishProficiencyRequirements: e.target.value },
                          })
                        }
                        placeholder="MCU-GET >= 240, TOEFL PBT >= 550, IELTS >= 5.5, CU-TEP >= 70 หรือ TU-GET >= 550"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background resize-y"
                      />
                    </div>
                  </div>
                )}

                {/* TAB 4: STUDY PLANS & DOCUMENTS */}
                {activeTab === "plans" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        {t("curriculum.studyPlansSummaryTh")}
                      </label>
                      <textarea
                        rows={4}
                        value={formData.details.studyPlansSummaryTh}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            details: { ...formData.details, studyPlansSummaryTh: e.target.value },
                          })
                        }
                        placeholder="แผน 1 แบบ 1.1: ทำวิทยานิพนธ์อย่างเดียว 39 หน่วยกิต&#10;แผน 1 แบบ 1.2: ศึกษารายวิชา 27 หน่วยกิต และทำวิทยานิพนธ์ 12 หน่วยกิต&#10;แผน 2: ศึกษารายวิชา 33 หน่วยกิต และสารนิพนธ์ 6 หน่วยกิต"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background resize-y font-mono text-xs leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        {t("curriculum.studyPlansSummaryEn")}
                      </label>
                      <textarea
                        rows={3}
                        value={formData.details.studyPlansSummaryEn}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            details: { ...formData.details, studyPlansSummaryEn: e.target.value },
                          })
                        }
                        placeholder="Plan 1.1: Thesis only 39 credits&#10;Plan 1.2: Coursework 27 credits + Thesis 12 credits&#10;Plan 2: Coursework 33 credits + Independent Study 6 credits"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background resize-y font-mono text-xs leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        {t("curriculum.tuitionFeeEstimate")}
                      </label>
                      <input
                        type="text"
                        value={formData.details.tuitionFeeEstimate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            details: { ...formData.details, tuitionFeeEstimate: e.target.value },
                          })
                        }
                        placeholder="เช่น ประมาณ 120,000 บาท ตลอดหลักสูตร (ภาคการศึกษาละประมาณ 30,000 บาท)"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        {t("curriculum.brochure")}
                      </label>
                      <input
                        type="url"
                        value={formData.brochureUrl}
                        onChange={(e) => setFormData({ ...formData, brochureUrl: e.target.value })}
                        placeholder="https://.../tqf2-curriculum.pdf"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                      />
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {locale === "th"
                          ? "ลิงก์ไฟล์ PDF เล่มหลักสูตร มคอ. 2 เพื่อให้นิสิตหรือผู้สนใจดาวน์โหลด"
                          : "URL link to official TQF 2 brochure PDF document"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border bg-muted/20">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {activeTab === "basic"
                      ? "1/4 ข้อมูลพื้นฐาน"
                      : activeTab === "philosophy"
                      ? "2/4 ปรัชญาและวัตถุประสงค์"
                      : activeTab === "careers"
                      ? "3/4 อาชีพและคุณสมบัติ"
                      : "4/4 แผนการศึกษาและเอกสาร"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
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
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
