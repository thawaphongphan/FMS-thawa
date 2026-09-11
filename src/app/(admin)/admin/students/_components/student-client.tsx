"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Users,
} from "lucide-react";
import { useLocale, useT } from "@/shared/lib/i18n/client";
import type { StudentRow, StudentOptions } from "@/features/student-stats/server";
import {
  createStudentAction,
  updateStudentAction,
  deleteStudentAction,
} from "@/features/student-stats/actions";
import { Button } from "@/components/ui/button";
import type { Gender, DegreeLevel, StudentStatus } from "@/generated/prisma";

interface StudentClientProps {
  initialStudents: StudentRow[];
  options: StudentOptions;
  canManage: boolean;
}

export function StudentClient({ initialStudents, options, canManage }: StudentClientProps) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [studentList, setStudentList] = useState<StudentRow[]>(initialStudents);
  const [search, setSearch] = useState("");
  const [selectedCurriculum, setSelectedCurriculum] = useState("ALL");
  const [selectedYear, setSelectedYear] = useState("ALL");
  const [selectedGender, setSelectedGender] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentRow | null>(null);

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
    nationality: "ไทย",
    ethnicity: "ไทย",
    religion: "พุทธ",
    domicileRegion: "ภาคกลาง",
    curriculumId: options.curricula[0]?.id ?? "",
    degreeLevel: "BACHELOR" as DegreeLevel,
    admissionYear: 2567,
    currentYear: 1,
    status: "ENROLLED" as StudentStatus,
    email: "",
    phoneNumber: "",
  });

  const openCreateDialog = () => {
    setEditingStudent(null);
    setFormData({
      studentId: "",
      titleTh: "นาย",
      titleEn: "Mr.",
      firstNameTh: "",
      lastNameTh: "",
      firstNameEn: "",
      lastNameEn: "",
      gender: "MALE",
      nationality: "ไทย",
      ethnicity: "ไทย",
      religion: "พุทธ",
      domicileRegion: "ภาคกลาง",
      curriculumId: options.curricula[0]?.id ?? "",
      degreeLevel: "BACHELOR",
      admissionYear: new Date().getFullYear() + 543,
      currentYear: 1,
      status: "ENROLLED",
      email: "",
      phoneNumber: "",
    });
    setDialogOpen(true);
  };

  const openEditDialog = (student: StudentRow) => {
    setEditingStudent(student);
    setFormData({
      studentId: student.studentId,
      titleTh: student.titleTh,
      titleEn: student.titleEn,
      firstNameTh: student.firstNameTh,
      lastNameTh: student.lastNameTh,
      firstNameEn: student.firstNameEn,
      lastNameEn: student.lastNameEn,
      gender: student.gender,
      nationality: student.nationality,
      ethnicity: student.ethnicity,
      religion: student.religion ?? "",
      domicileRegion: student.domicileRegion ?? "",
      curriculumId: student.curriculumId,
      degreeLevel: student.degreeLevel,
      admissionYear: student.admissionYear,
      currentYear: student.currentYear,
      status: student.status,
      email: student.email ?? "",
      phoneNumber: student.phoneNumber ?? "",
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
        nationality: formData.nationality,
        ethnicity: formData.ethnicity,
        religion: formData.religion || null,
        domicileRegion: formData.domicileRegion || null,
        curriculumId: formData.curriculumId,
        degreeLevel: formData.degreeLevel,
        admissionYear: Number(formData.admissionYear),
        currentYear: Number(formData.currentYear),
        status: formData.status,
        email: formData.email || null,
        phoneNumber: formData.phoneNumber || null,
      };

      if (editingStudent) {
        const res = await updateStudentAction({
          id: editingStudent.id,
          ...payload,
        });
        if (res.ok) {
          toast.success(t("students.saveSuccess"));
          setDialogOpen(false);
          router.refresh();
        } else {
          toast.error(res.error.message);
        }
      } else {
        const res = await createStudentAction(payload);
        if (res.ok) {
          toast.success(t("students.saveSuccess"));
          setDialogOpen(false);
          router.refresh();
        } else {
          toast.error(res.error.message);
        }
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("students.deleteConfirm"))) return;
    startTransition(async () => {
      const res = await deleteStudentAction(id);
      if (res.ok) {
        toast.success(t("students.deleteSuccess"));
        setStudentList((prev) => prev.filter((s) => s.id !== id));
        router.refresh();
      } else {
        toast.error(res.error.message);
      }
    });
  };

  // Filter students
  const filtered = (studentList.length ? studentList : initialStudents).filter((s) => {
    const q = search.toLowerCase();
    const matchesSearch =
      s.studentId.toLowerCase().includes(q) ||
      s.firstNameTh.toLowerCase().includes(q) ||
      s.lastNameTh.toLowerCase().includes(q) ||
      s.firstNameEn.toLowerCase().includes(q) ||
      s.lastNameEn.toLowerCase().includes(q) ||
      s.nationality.toLowerCase().includes(q) ||
      s.ethnicity.toLowerCase().includes(q);

    const matchesCurriculum = selectedCurriculum === "ALL" || s.curriculumId === selectedCurriculum;
    const matchesYear = selectedYear === "ALL" || String(s.admissionYear) === selectedYear;
    const matchesGender = selectedGender === "ALL" || s.gender === selectedGender;
    const matchesStatus = selectedStatus === "ALL" || s.status === selectedStatus;

    return matchesSearch && matchesCurriculum && matchesYear && matchesGender && matchesStatus;
  });

  const getStatusPill = (status: StudentStatus) => {
    switch (status) {
      case "ENROLLED":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">{t("stats.status.ENROLLED")}</span>;
      case "ON_LEAVE":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">{t("stats.status.ON_LEAVE")}</span>;
      case "GRADUATED":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">{t("stats.status.GRADUATED")}</span>;
      case "DISMISSED":
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">{t("stats.status.DISMISSED")}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            {t("students.adminTitle")}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {t("students.adminSubtitle")}
          </p>
        </div>
        {canManage && (
          <Button onClick={openCreateDialog} className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            {t("students.addStudent")}
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
            placeholder={locale === "th" ? "ค้นหาด้วยรหัสนิสิต, ชื่อ-นามสกุล, สัญชาติ..." : "Search student ID, name, nationality..."}
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
            <option value="ALL">{locale === "th" ? "ทุกหลักสูตร" : "All Programs"}</option>
            {options.curricula.map((c) => (
              <option key={c.id} value={c.id}>
                {c.programCode} - {c.nameTh}
              </option>
            ))}
          </select>

          {/* Admission Year */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            aria-label="Filter by admission year"
            className="rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="ALL">{locale === "th" ? "ทุกปีที่เข้าศึกษา" : "All Cohorts"}</option>
            {options.admissionYears.map((yr) => (
              <option key={yr} value={String(yr)}>
                {locale === "th" ? `ปี ${yr}` : yr}
              </option>
            ))}
          </select>

          {/* Gender */}
          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            aria-label="Filter by gender"
            className="rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="ALL">{locale === "th" ? "ทุกเพศ" : "All Genders"}</option>
            <option value="MALE">{t("stats.male")}</option>
            <option value="FEMALE">{t("stats.female")}</option>
            <option value="OTHER">{t("stats.otherGender")}</option>
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            aria-label="Filter by status"
            className="rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="ALL">{locale === "th" ? "ทุกสถานะนิสิต" : "All Statuses"}</option>
            <option value="ENROLLED">{t("stats.status.ENROLLED")}</option>
            <option value="ON_LEAVE">{t("stats.status.ON_LEAVE")}</option>
            <option value="GRADUATED">{t("stats.status.GRADUATED")}</option>
            <option value="DISMISSED">{t("stats.status.DISMISSED")}</option>
          </select>
        </div>
      </div>

      {/* Student Data Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
              <tr>
                <th className="py-3 px-4">{t("stats.admissionYear")} / รหัส</th>
                <th className="py-3 px-4">{locale === "th" ? "ชื่อ-นามสกุล" : "Full Name"}</th>
                <th className="py-3 px-3 text-center">{locale === "th" ? "เพศ" : "Gender"}</th>
                <th className="py-3 px-4">{locale === "th" ? "หลักสูตร / ระดับ" : "Curriculum & Level"}</th>
                <th className="py-3 px-3 text-center">{t("stats.currentYear")}</th>
                <th className="py-3 px-4">{t("stats.nationality")} / {t("stats.ethnicity")}</th>
                <th className="py-3 px-4">{t("stats.status")}</th>
                {canManage && <th className="py-3 px-4 text-right">{locale === "th" ? "การกระทำ" : "Actions"}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 8 : 7} className="py-10 text-center text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                    {t("students.empty")}
                  </td>
                </tr>
              ) : (
                filtered.map((student) => (
                  <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-foreground">
                        {student.studentId}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {locale === "th" ? `เข้าศึกษา ${student.admissionYear}` : `Admitted ${student.admissionYear}`}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground">
                        {student.titleTh} {student.firstNameTh} {student.lastNameTh}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {student.titleEn} {student.firstNameEn} {student.lastNameEn}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                        student.gender === "MALE"
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                          : student.gender === "FEMALE"
                          ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                          : "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300"
                      }`}>
                        {student.gender === "MALE" ? t("stats.male") : student.gender === "FEMALE" ? t("stats.female") : t("stats.otherGender")}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-primary font-bold">
                        {student.curriculum.programCode}
                      </span>
                      <div className="text-[11px] text-muted-foreground line-clamp-1 max-w-[200px]">
                        {student.curriculum.nameTh}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-foreground">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-muted text-xs">
                        {student.currentYear}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-foreground">
                        {student.nationality}
                        {student.nationality !== "ไทย" && (
                          <span className="ml-1.5 rounded-sm bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-1 py-0.2 text-[10px] font-bold">
                            Intl
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        เชื้อชาติ: {student.ethnicity}
                        {student.domicileRegion && ` (${student.domicileRegion})`}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusPill(student.status)}
                    </td>
                    {canManage && (
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(student)}
                            className="h-7 w-7 p-0"
                            title={t("students.editStudent")}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(student.id)}
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            title={t("students.deleteStudent")}
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
              {editingStudent ? t("students.editStudent") : t("students.addStudent")}
            </h2>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Row 1: Student ID & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    รหัสนิสิต *
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
                    <option value="MALE">{t("stats.male")}</option>
                    <option value="FEMALE">{t("stats.female")}</option>
                    <option value="OTHER">{t("stats.otherGender")}</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    ระดับการศึกษา
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

              {/* Row 4: Demographics: Nationality, Ethnicity, Region */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-border">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    {t("stats.nationality")} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    {t("stats.ethnicity")} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.ethnicity}
                    onChange={(e) => setFormData({ ...formData, ethnicity: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    {t("stats.religion")}
                  </label>
                  <input
                    type="text"
                    value={formData.religion}
                    onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    {t("stats.region")}
                  </label>
                  <input
                    type="text"
                    value={formData.domicileRegion}
                    onChange={(e) => setFormData({ ...formData, domicileRegion: e.target.value })}
                    placeholder="เช่น ภาคกลาง, ภาคเหนือ"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2"
                  />
                </div>
              </div>

              {/* Row 5: Curriculum, Admission Year, Current Year, Status */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-border">
                <div className="sm:col-span-2">
                  <label className="block font-medium text-foreground mb-1">
                    หลักสูตร *
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
                    {t("stats.admissionYear")} *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.admissionYear}
                    onChange={(e) => setFormData({ ...formData, admissionYear: Number(e.target.value) })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    {t("stats.currentYear")} *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    required
                    value={formData.currentYear}
                    onChange={(e) => setFormData({ ...formData, currentYear: Number(e.target.value) })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2"
                  />
                </div>
              </div>

              {/* Row 6: Status, Email, Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    {t("stats.status")}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as StudentStatus })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2"
                  >
                    <option value="ENROLLED">{t("stats.status.ENROLLED")}</option>
                    <option value="ON_LEAVE">{t("stats.status.ON_LEAVE")}</option>
                    <option value="GRADUATED">{t("stats.status.GRADUATED")}</option>
                    <option value="DISMISSED">{t("stats.status.DISMISSED")}</option>
                  </select>
                </div>
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
