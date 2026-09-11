"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Briefcase,
  Star,
  GraduationCap,
  Building,
} from "lucide-react";
import { useLocale, useT } from "@/shared/lib/i18n/client";
import type { AlumniRow, AlumniOptions } from "@/features/alumni/server";
import {
  createAlumniAction,
  updateAlumniAction,
  deleteAlumniAction,
} from "@/features/alumni/actions";
import { Button } from "@/components/ui/button";
import type { Gender, DegreeLevel, EmploymentStatus } from "@/generated/prisma";

interface AlumniClientProps {
  initialAlumni: AlumniRow[];
  options: AlumniOptions;
  canManage: boolean;
}

export function AlumniClient({ initialAlumni, options, canManage }: AlumniClientProps) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [alumniList, setAlumniList] = useState<AlumniRow[]>(initialAlumni);
  const [search, setSearch] = useState("");
  const [selectedCurriculum, setSelectedCurriculum] = useState("ALL");
  const [selectedYear, setSelectedYear] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [onlyFeatured, setOnlyFeatured] = useState(false);

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAlumni, setEditingAlumni] = useState<AlumniRow | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    studentId: "",
    titleTh: "นาย",
    titleEn: "Mr.",
    firstNameTh: "",
    lastNameTh: "",
    firstNameEn: "",
    lastNameEn: "",
    gender: "MALE" as Gender,
    curriculumId: options.curricula[0]?.id ?? "",
    degreeLevel: "BACHELOR" as DegreeLevel,
    graduationYear: 2567,
    generation: 25,
    gpa: "3.50",
    employmentStatus: "EMPLOYED" as EmploymentStatus,
    jobTitle: "",
    company: "",
    industry: "",
    salaryRange: "30,000 - 50,000 บาท",
    email: "",
    phoneNumber: "",
    linkedinUrl: "",
    avatarUrl: "",
    isFeatured: false,
    featuredStoryTh: "",
    featuredStoryEn: "",
  });

  const openCreateDialog = () => {
    setEditingAlumni(null);
    setFormData({
      studentId: "",
      titleTh: "นาย",
      titleEn: "Mr.",
      firstNameTh: "",
      lastNameTh: "",
      firstNameEn: "",
      lastNameEn: "",
      gender: "MALE",
      curriculumId: options.curricula[0]?.id ?? "",
      degreeLevel: "BACHELOR",
      graduationYear: new Date().getFullYear() + 543 - 1,
      generation: 25,
      gpa: "",
      employmentStatus: "EMPLOYED",
      jobTitle: "",
      company: "",
      industry: "",
      salaryRange: "",
      email: "",
      phoneNumber: "",
      linkedinUrl: "",
      avatarUrl: "",
      isFeatured: false,
      featuredStoryTh: "",
      featuredStoryEn: "",
    });
    setDialogOpen(true);
  };

  const openEditDialog = (alumni: AlumniRow) => {
    setEditingAlumni(alumni);
    setFormData({
      studentId: alumni.studentId,
      titleTh: alumni.titleTh,
      titleEn: alumni.titleEn,
      firstNameTh: alumni.firstNameTh,
      lastNameTh: alumni.lastNameTh,
      firstNameEn: alumni.firstNameEn,
      lastNameEn: alumni.lastNameEn,
      gender: alumni.gender,
      curriculumId: alumni.curriculumId,
      degreeLevel: alumni.degreeLevel,
      graduationYear: alumni.graduationYear,
      generation: alumni.generation ?? 0,
      gpa: alumni.gpa ? String(alumni.gpa) : "",
      employmentStatus: alumni.employmentStatus,
      jobTitle: alumni.jobTitle ?? "",
      company: alumni.company ?? "",
      industry: alumni.industry ?? "",
      salaryRange: alumni.salaryRange ?? "",
      email: alumni.email ?? "",
      phoneNumber: alumni.phoneNumber ?? "",
      linkedinUrl: alumni.linkedinUrl ?? "",
      avatarUrl: alumni.avatarUrl ?? "",
      isFeatured: alumni.isFeatured,
      featuredStoryTh: alumni.featuredStoryTh ?? "",
      featuredStoryEn: alumni.featuredStoryEn ?? "",
    });
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId || !formData.firstNameTh || !formData.lastNameTh || !formData.curriculumId) {
      toast.error(t("common.requiredFields"));
      return;
    }

    startTransition(async () => {
      const payload = {
        studentId: formData.studentId,
        titleTh: formData.titleTh,
        titleEn: formData.titleEn,
        firstNameTh: formData.firstNameTh,
        lastNameTh: formData.lastNameTh,
        firstNameEn: formData.firstNameEn,
        lastNameEn: formData.lastNameEn,
        gender: formData.gender,
        curriculumId: formData.curriculumId,
        degreeLevel: formData.degreeLevel,
        graduationYear: Number(formData.graduationYear),
        generation: formData.generation ? Number(formData.generation) : null,
        gpa: formData.gpa ? Number(formData.gpa) : null,
        employmentStatus: formData.employmentStatus,
        jobTitle: formData.jobTitle || null,
        company: formData.company || null,
        industry: formData.industry || null,
        salaryRange: formData.salaryRange || null,
        email: formData.email || null,
        phoneNumber: formData.phoneNumber || null,
        linkedinUrl: formData.linkedinUrl || null,
        avatarUrl: formData.avatarUrl || null,
        isFeatured: formData.isFeatured,
        featuredStoryTh: formData.featuredStoryTh || null,
        featuredStoryEn: formData.featuredStoryEn || null,
      };

      if (editingAlumni) {
        const res = await updateAlumniAction({
          id: editingAlumni.id,
          ...payload,
        });
        if (res.ok) {
          toast.success(t("alumni.saveSuccess"));
          setDialogOpen(false);
          router.refresh();
        } else {
          toast.error(res.error.message);
        }
      } else {
        const res = await createAlumniAction(payload);
        if (res.ok) {
          toast.success(t("alumni.saveSuccess"));
          setDialogOpen(false);
          router.refresh();
        } else {
          toast.error(res.error.message);
        }
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("alumni.deleteConfirm"))) return;
    startTransition(async () => {
      const res = await deleteAlumniAction(id);
      if (res.ok) {
        toast.success(t("alumni.deleteSuccess"));
        setAlumniList((prev) => prev.filter((a) => a.id !== id));
        router.refresh();
      } else {
        toast.error(res.error.message);
      }
    });
  };

  // Filter alumni
  const filtered = (alumniList.length ? alumniList : initialAlumni).filter((a) => {
    const q = search.toLowerCase();
    const matchesSearch =
      a.studentId.toLowerCase().includes(q) ||
      a.firstNameTh.toLowerCase().includes(q) ||
      a.lastNameTh.toLowerCase().includes(q) ||
      a.firstNameEn.toLowerCase().includes(q) ||
      a.lastNameEn.toLowerCase().includes(q) ||
      (a.company && a.company.toLowerCase().includes(q)) ||
      (a.jobTitle && a.jobTitle.toLowerCase().includes(q));

    const matchesCurriculum = selectedCurriculum === "ALL" || a.curriculumId === selectedCurriculum;
    const matchesYear = selectedYear === "ALL" || String(a.graduationYear) === selectedYear;
    const matchesStatus = selectedStatus === "ALL" || a.employmentStatus === selectedStatus;
    const matchesFeatured = !onlyFeatured || a.isFeatured;

    return matchesSearch && matchesCurriculum && matchesYear && matchesStatus && matchesFeatured;
  });

  const getStatusBadge = (status: EmploymentStatus) => {
    switch (status) {
      case "EMPLOYED":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">{t("alumni.status.EMPLOYED")}</span>;
      case "ENTREPRENEUR":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">{t("alumni.status.ENTREPRENEUR")}</span>;
      case "STUDYING":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">{t("alumni.status.STUDYING")}</span>;
      case "JOB_SEEKING":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">{t("alumni.status.JOB_SEEKING")}</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">{t("alumni.status.OTHER")}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            {t("alumni.adminTitle")}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {t("alumni.adminSubtitle")}
          </p>
        </div>
        {canManage && (
          <Button onClick={openCreateDialog} className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            {t("alumni.addAlumni")}
          </Button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col lg:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("alumni.searchPlaceholder")}
            className="w-full rounded-lg border border-input bg-background pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Curriculum */}
          <select
            value={selectedCurriculum}
            onChange={(e) => setSelectedCurriculum(e.target.value)}
            aria-label="Filter by curriculum"
            className="rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="ALL">{t("alumni.allCurricula")}</option>
            {options.curricula.map((c) => (
              <option key={c.id} value={c.id}>
                {c.programCode} - {c.nameTh}
              </option>
            ))}
          </select>

          {/* Year */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            aria-label="Filter by graduation year"
            className="rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="ALL">{t("alumni.allYears")}</option>
            {options.graduationYears.map((yr) => (
              <option key={yr} value={String(yr)}>
                {locale === "th" ? `พ.ศ. ${yr}` : yr}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            aria-label="Filter by employment status"
            className="rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="ALL">{t("alumni.allStatuses")}</option>
            <option value="EMPLOYED">{t("alumni.status.EMPLOYED")}</option>
            <option value="ENTREPRENEUR">{t("alumni.status.ENTREPRENEUR")}</option>
            <option value="STUDYING">{t("alumni.status.STUDYING")}</option>
            <option value="JOB_SEEKING">{t("alumni.status.JOB_SEEKING")}</option>
            <option value="OTHER">{t("alumni.status.OTHER")}</option>
          </select>

          {/* Featured Toggle */}
          <button
            type="button"
            onClick={() => setOnlyFeatured(!onlyFeatured)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
              onlyFeatured
                ? "bg-amber-500/10 border-amber-500/40 text-amber-700 dark:text-amber-400"
                : "border-input bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            <Star className={`h-3.5 w-3.5 ${onlyFeatured ? "fill-amber-500 text-amber-500" : ""}`} />
            <span>{t("alumni.featured")}</span>
          </button>
        </div>
      </div>

      {/* Alumni Data Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
              <tr>
                <th className="py-3 px-4">{t("alumni.studentId")}</th>
                <th className="py-3 px-4">{locale === "th" ? "ชื่อ-นามสกุล" : "Full Name"}</th>
                <th className="py-3 px-4">{t("alumni.curriculum")}</th>
                <th className="py-3 px-3 text-center">{t("alumni.graduationYear")}</th>
                <th className="py-3 px-4">{t("alumni.employmentStatus")}</th>
                <th className="py-3 px-4">{t("alumni.company")} / {t("alumni.jobTitle")}</th>
                <th className="py-3 px-3 text-center">{t("alumni.featuredStory")}</th>
                {canManage && <th className="py-3 px-4 text-right">{locale === "th" ? "การกระทำ" : "Actions"}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 8 : 7} className="py-10 text-center text-muted-foreground">
                    <GraduationCap className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                    {t("alumni.empty")}
                  </td>
                </tr>
              ) : (
                filtered.map((alumni) => (
                  <tr key={alumni.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-foreground">
                      {alumni.studentId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground">
                        {alumni.titleTh} {alumni.firstNameTh} {alumni.lastNameTh}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {alumni.titleEn} {alumni.firstNameEn} {alumni.lastNameEn}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-primary font-bold">
                        {alumni.curriculum.programCode}
                      </span>
                      <div className="text-[11px] text-muted-foreground line-clamp-1 max-w-[200px]">
                        {alumni.curriculum.nameTh}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-medium text-foreground">
                      {alumni.graduationYear}
                      {alumni.generation && (
                        <div className="text-[10px] text-muted-foreground">
                          {t("alumni.generation")} {alumni.generation}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(alumni.employmentStatus)}
                    </td>
                    <td className="py-3 px-4">
                      {alumni.company ? (
                        <div>
                          <div className="font-medium text-foreground flex items-center gap-1">
                            <Building className="h-3 w-3 text-muted-foreground" />
                            <span>{alumni.company}</span>
                          </div>
                          {alumni.jobTitle && (
                            <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Briefcase className="h-3 w-3" />
                              <span>{alumni.jobTitle}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {alumni.isFeatured ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-400">
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                          <span>{locale === "th" ? "ดีเด่น" : "Featured"}</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    {canManage && (
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(alumni)}
                            className="h-7 w-7 p-0"
                            title={t("alumni.editAlumni")}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(alumni.id)}
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            title={t("alumni.deleteAlumni")}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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

      {/* Modal Dialog for Add / Edit */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-xl my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-foreground mb-4">
              {editingAlumni ? t("alumni.editAlumni") : t("alumni.addAlumni")}
            </h2>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Row 1: Student ID & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    {t("alumni.studentId")} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    {locale === "th" ? "เพศ" : "Gender"}
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2"
                  >
                    <option value="MALE">{locale === "th" ? "ชาย" : "Male"}</option>
                    <option value="FEMALE">{locale === "th" ? "หญิง" : "Female"}</option>
                    <option value="OTHER">{locale === "th" ? "อื่นๆ" : "Other"}</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    {t("alumni.degreeLevel")}
                  </label>
                  <select
                    value={formData.degreeLevel}
                    onChange={(e) => setFormData({ ...formData, degreeLevel: e.target.value as DegreeLevel })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2"
                  >
                    <option value="BACHELOR">{locale === "th" ? "ปริญญาตรี" : "Bachelor's"}</option>
                    <option value="MASTER">{locale === "th" ? "ปริญญาโท" : "Master's"}</option>
                    <option value="DOCTORATE">{locale === "th" ? "ปริญญาเอก" : "Doctorate"}</option>
                    <option value="CERTIFICATE">{locale === "th" ? "ประกาศนียบัตร" : "Certificate"}</option>
                    <option value="TRAINING">{locale === "th" ? "โครงการอบรม" : "Training"}</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Name TH */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    {locale === "th" ? "คำนำหน้า (ไทย)" : "Title (TH)"}
                  </label>
                  <input
                    type="text"
                    value={formData.titleTh}
                    onChange={(e) => setFormData({ ...formData, titleTh: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    {locale === "th" ? "ชื่อจริง (ไทย)" : "First Name (TH)"} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstNameTh}
                    onChange={(e) => setFormData({ ...formData, firstNameTh: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    {locale === "th" ? "นามสกุล (ไทย)" : "Last Name (TH)"} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastNameTh}
                    onChange={(e) => setFormData({ ...formData, lastNameTh: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2"
                  />
                </div>
              </div>

              {/* Row 3: Name EN */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    {locale === "th" ? "คำนำหน้า (EN)" : "Title (EN)"}
                  </label>
                  <input
                    type="text"
                    value={formData.titleEn}
                    onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    {locale === "th" ? "ชื่อจริง (EN)" : "First Name (EN)"}
                  </label>
                  <input
                    type="text"
                    value={formData.firstNameEn}
                    onChange={(e) => setFormData({ ...formData, firstNameEn: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    {locale === "th" ? "นามสกุล (EN)" : "Last Name (EN)"}
                  </label>
                  <input
                    type="text"
                    value={formData.lastNameEn}
                    onChange={(e) => setFormData({ ...formData, lastNameEn: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2"
                  />
                </div>
              </div>

              {/* Row 4: Curriculum, Year, Gen */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    {t("alumni.curriculum")} *
                  </label>
                  <select
                    required
                    value={formData.curriculumId}
                    onChange={(e) => setFormData({ ...formData, curriculumId: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2"
                  >
                    {options.curricula.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.programCode} - {c.nameTh}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    {t("alumni.graduationYear")} *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.graduationYear}
                    onChange={(e) => setFormData({ ...formData, graduationYear: Number(e.target.value) })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    {t("alumni.generation")}
                  </label>
                  <input
                    type="number"
                    value={formData.generation}
                    onChange={(e) => setFormData({ ...formData, generation: Number(e.target.value) })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2"
                  />
                </div>
              </div>

              {/* Row 5: Employment & Career */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    {t("alumni.employmentStatus")}
                  </label>
                  <select
                    value={formData.employmentStatus}
                    onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value as EmploymentStatus })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2"
                  >
                    <option value="EMPLOYED">{t("alumni.status.EMPLOYED")}</option>
                    <option value="ENTREPRENEUR">{t("alumni.status.ENTREPRENEUR")}</option>
                    <option value="STUDYING">{t("alumni.status.STUDYING")}</option>
                    <option value="JOB_SEEKING">{t("alumni.status.JOB_SEEKING")}</option>
                    <option value="OTHER">{t("alumni.status.OTHER")}</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    {t("alumni.company")}
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Google Thailand, Agoda"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    {t("alumni.jobTitle")}
                  </label>
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    {locale === "th" ? "อัตราเงินเดือนโดยประมาณ" : "Salary Range"}
                  </label>
                  <input
                    type="text"
                    value={formData.salaryRange}
                    onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                    placeholder="e.g. 40,000 - 60,000 บาท"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2"
                  />
                </div>
              </div>

              {/* Row 6: Contact & Social */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    {locale === "th" ? "อีเมล" : "Email"}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    {locale === "th" ? "เบอร์โทรศัพท์" : "Phone"}
                  </label>
                  <input
                    type="text"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full rounded-lg border border-input bg-background px-3 py-2"
                  />
                </div>
              </div>

              {/* Row 7: Featured & Spotlight Story */}
              <div className="pt-2 border-t border-border space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                  />
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    <span>{locale === "th" ? "เลือกให้แสดงเป็นศิษย์เก่าดีเด่น (Spotlight)" : "Feature in Alumni Spotlight Carousel"}</span>
                  </span>
                </label>

                {formData.isFeatured && (
                  <div className="space-y-3 pl-6 border-l-2 border-amber-500/30">
                    <div>
                      <label className="block font-medium text-foreground mb-1">
                        {locale === "th" ? "เรื่องราวความสำเร็จ / คติประจำใจ (ภาษาไทย)" : "Featured Story / Quote (TH)"}
                      </label>
                      <textarea
                        rows={2}
                        value={formData.featuredStoryTh}
                        onChange={(e) => setFormData({ ...formData, featuredStoryTh: e.target.value })}
                        placeholder="ความประทับใจ หรือข้อคิดในการทำงานสำหรับรุ่นน้อง..."
                        className="w-full rounded-lg border border-input bg-background px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-foreground mb-1">
                        {locale === "th" ? "เรื่องราวความสำเร็จ / คติประจำใจ (ภาษาอังกฤษ)" : "Featured Story / Quote (EN)"}
                      </label>
                      <textarea
                        rows={2}
                        value={formData.featuredStoryEn}
                        onChange={(e) => setFormData({ ...formData, featuredStoryEn: e.target.value })}
                        placeholder="Words of inspiration for future graduates..."
                        className="w-full rounded-lg border border-input bg-background px-3 py-2"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  {locale === "th" ? "ยกเลิก" : "Cancel"}
                </Button>
                <Button type="submit" disabled={pending}>
                  {locale === "th" ? "บันทึกข้อมูล" : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
