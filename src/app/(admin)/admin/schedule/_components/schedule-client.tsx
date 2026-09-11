"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Calendar,
  Clock,
  Check,
  X,
  CalendarDays,
} from "lucide-react";
import { useLocale, useT } from "@/shared/lib/i18n/client";
import { formatDate } from "@/shared/lib/format";
import { Button } from "@/components/ui/button";
import type { DayOfWeek, ExamType } from "@/generated/prisma";
import type {
  ClassScheduleRow,
  ExamScheduleRow,
  AcademicTermRow,
  ScheduleOptions,
} from "@/features/schedule";
import {
  createClassScheduleAction,
  updateClassScheduleAction,
  deleteClassScheduleAction,
  createExamScheduleAction,
  updateExamScheduleAction,
  deleteExamScheduleAction,
  createAcademicTermAction,
  updateAcademicTermAction,
  setCurrentAcademicTermAction,
  deleteAcademicTermAction,
} from "@/features/schedule/actions";

interface ScheduleClientProps {
  initialTerms: AcademicTermRow[];
  initialClasses: ClassScheduleRow[];
  initialExams: ExamScheduleRow[];
  options: ScheduleOptions;
  canManage: boolean;
}

const DAY_ORDER: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export function ScheduleClient({
  initialTerms,
  initialClasses,
  initialExams,
  options,
  canManage,
}: ScheduleClientProps) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState<"classes" | "exams" | "terms">("classes");
  const [terms, setTerms] = useState<AcademicTermRow[]>(initialTerms);
  const [classes, setClasses] = useState<ClassScheduleRow[]>(initialClasses);
  const [exams, setExams] = useState<ExamScheduleRow[]>(initialExams);

  const [selectedTermId, setSelectedTermId] = useState<string>(
    terms.find((tm) => tm.isCurrent)?.id || terms[0]?.id || ""
  );
  const [search, setSearch] = useState("");

  // Dialog States
  const [classDialogOpen, setClassDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassScheduleRow | null>(null);
  const [classForm, setClassForm] = useState({
    termId: selectedTermId,
    courseId: options.courses[0]?.id || "",
    section: "1",
    dayOfWeek: "MONDAY" as DayOfWeek,
    startTime: "09:00",
    endTime: "12:00",
    room: "",
    building: "",
    instructorId: "",
    instructorName: "",
    curriculumId: "",
    targetYear: 1,
    notes: "",
  });

  const [examDialogOpen, setExamDialogOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamScheduleRow | null>(null);
  const [examForm, setExamForm] = useState({
    termId: selectedTermId,
    courseId: options.courses[0]?.id || "",
    section: "ทุกกลุ่ม",
    examType: "MIDTERM" as ExamType,
    examDate: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "12:00",
    room: "",
    seatRange: "",
    invigilatorId: "",
    invigilatorName: "",
    notes: "",
  });

  const [termDialogOpen, setTermDialogOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<AcademicTermRow | null>(null);
  const [termForm, setTermForm] = useState({
    year: 2569,
    term: 1,
    nameTh: "",
    nameEn: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
  });

  // Open Handlers
  const openCreateClass = () => {
    setEditingClass(null);
    setClassForm({
      termId: selectedTermId || options.terms[0]?.id || "",
      courseId: options.courses[0]?.id || "",
      section: "1",
      dayOfWeek: "MONDAY",
      startTime: "09:00",
      endTime: "12:00",
      room: "",
      building: "",
      instructorId: "",
      instructorName: "",
      curriculumId: "",
      targetYear: 1,
      notes: "",
    });
    setClassDialogOpen(true);
  };

  const openEditClass = (item: ClassScheduleRow) => {
    setEditingClass(item);
    setClassForm({
      termId: item.termId,
      courseId: item.courseId,
      section: item.section,
      dayOfWeek: item.dayOfWeek,
      startTime: item.startTime,
      endTime: item.endTime,
      room: item.room,
      building: item.building || "",
      instructorId: item.instructorId || "",
      instructorName: item.instructorName || "",
      curriculumId: item.curriculumId || "",
      targetYear: item.targetYear || 1,
      notes: item.notes || "",
    });
    setClassDialogOpen(true);
  };

  const openCreateExam = () => {
    setEditingExam(null);
    setExamForm({
      termId: selectedTermId || options.terms[0]?.id || "",
      courseId: options.courses[0]?.id || "",
      section: "ทุกกลุ่ม",
      examType: "MIDTERM",
      examDate: new Date().toISOString().split("T")[0],
      startTime: "09:00",
      endTime: "12:00",
      room: "",
      seatRange: "",
      invigilatorId: "",
      invigilatorName: "",
      notes: "",
    });
    setExamDialogOpen(true);
  };

  const openEditExam = (item: ExamScheduleRow) => {
    setEditingExam(item);
    setExamForm({
      termId: item.termId,
      courseId: item.courseId,
      section: item.section,
      examType: item.examType,
      examDate: new Date(item.examDate).toISOString().split("T")[0],
      startTime: item.startTime,
      endTime: item.endTime,
      room: item.room,
      seatRange: item.seatRange || "",
      invigilatorId: item.invigilatorId || "",
      invigilatorName: item.invigilatorName || "",
      notes: item.notes || "",
    });
    setExamDialogOpen(true);
  };

  const openCreateTerm = () => {
    setEditingTerm(null);
    setTermForm({
      year: 2569,
      term: 1,
      nameTh: "ภาคการศึกษาต้น 2569",
      nameEn: "First Semester 2026",
      startDate: "",
      endDate: "",
      isCurrent: terms.length === 0,
    });
    setTermDialogOpen(true);
  };

  const openEditTerm = (item: AcademicTermRow) => {
    setEditingTerm(item);
    setTermForm({
      year: item.year,
      term: item.term,
      nameTh: item.nameTh,
      nameEn: item.nameEn,
      startDate: item.startDate ? new Date(item.startDate).toISOString().split("T")[0] : "",
      endDate: item.endDate ? new Date(item.endDate).toISOString().split("T")[0] : "",
      isCurrent: item.isCurrent,
    });
    setTermDialogOpen(true);
  };

  // Submit Handlers
  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const payload = {
        ...classForm,
        instructorId: classForm.instructorId || undefined,
        instructorName: classForm.instructorName || undefined,
        curriculumId: classForm.curriculumId || undefined,
        building: classForm.building || undefined,
        notes: classForm.notes || undefined,
      };

      const res = editingClass
        ? await updateClassScheduleAction({ ...payload, id: editingClass.id })
        : await createClassScheduleAction(payload);

      if (res.ok) {
        toast.success(t("schedule.saveSuccess"));
        setClassDialogOpen(false);
        router.refresh();
      } else {
        toast.error(res.error.message || "Failed to save class schedule");
      }
    });
  };

  const handleDeleteClass = async (item: ClassScheduleRow) => {
    if (!confirm(t("schedule.deleteConfirm"))) return;
    startTransition(async () => {
      const res = await deleteClassScheduleAction(item.id);
      if (res.ok) {
        toast.success(t("schedule.deleteSuccess"));
        setClasses((prev) => prev.filter((c) => c.id !== item.id));
        router.refresh();
      } else {
        toast.error(res.error.message);
      }
    });
  };

  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const payload = {
        ...examForm,
        seatRange: examForm.seatRange || undefined,
        invigilatorId: examForm.invigilatorId || undefined,
        invigilatorName: examForm.invigilatorName || undefined,
        notes: examForm.notes || undefined,
      };

      const res = editingExam
        ? await updateExamScheduleAction({ ...payload, id: editingExam.id })
        : await createExamScheduleAction(payload);

      if (res.ok) {
        toast.success(t("schedule.saveSuccess"));
        setExamDialogOpen(false);
        router.refresh();
      } else {
        toast.error(res.error.message || "Failed to save exam schedule");
      }
    });
  };

  const handleDeleteExam = async (item: ExamScheduleRow) => {
    if (!confirm(t("schedule.deleteConfirm"))) return;
    startTransition(async () => {
      const res = await deleteExamScheduleAction(item.id);
      if (res.ok) {
        toast.success(t("schedule.deleteSuccess"));
        setExams((prev) => prev.filter((e) => e.id !== item.id));
        router.refresh();
      } else {
        toast.error(res.error.message);
      }
    });
  };

  const handleSaveTerm = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const payload = {
        ...termForm,
        startDate: termForm.startDate || undefined,
        endDate: termForm.endDate || undefined,
      };

      const res = editingTerm
        ? await updateAcademicTermAction({ ...payload, id: editingTerm.id })
        : await createAcademicTermAction(payload);

      if (res.ok) {
        toast.success(t("schedule.saveSuccess"));
        setTermDialogOpen(false);
        router.refresh();
      } else {
        toast.error(res.error.message || "Failed to save academic term");
      }
    });
  };

  const handleSetCurrentTerm = async (id: string) => {
    startTransition(async () => {
      const res = await setCurrentAcademicTermAction(id);
      if (res.ok) {
        toast.success(t("schedule.saveSuccess"));
        setTerms((prev) => prev.map((tm) => ({ ...tm, isCurrent: tm.id === id })));
        router.refresh();
      } else {
        toast.error(res.error.message);
      }
    });
  };

  const handleDeleteTerm = async (item: AcademicTermRow) => {
    if (!confirm(t("schedule.deleteConfirm"))) return;
    startTransition(async () => {
      const res = await deleteAcademicTermAction(item.id);
      if (res.ok) {
        toast.success(t("schedule.deleteSuccess"));
        setTerms((prev) => prev.filter((tm) => tm.id !== item.id));
        router.refresh();
      } else {
        toast.error(res.error.message);
      }
    });
  };

  // Filtered lists for admin table
  const filteredClasses = classes.filter((item) => {
    if (selectedTermId && item.termId !== selectedTermId) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const code = item.course.courseCode.toLowerCase();
      const name = item.course.nameTh.toLowerCase();
      const room = item.room.toLowerCase();
      if (!code.includes(q) && !name.includes(q) && !room.includes(q)) return false;
    }
    return true;
  });

  const filteredExams = exams.filter((item) => {
    if (selectedTermId && item.termId !== selectedTermId) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const code = item.course.courseCode.toLowerCase();
      const name = item.course.nameTh.toLowerCase();
      const room = item.room.toLowerCase();
      if (!code.includes(q) && !name.includes(q) && !room.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t("schedule.adminTitle")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("schedule.adminSubtitle")}
          </p>
        </div>

        {canManage && (
          <div className="flex items-center gap-2">
            {activeTab === "classes" && (
              <Button onClick={openCreateClass} className="gap-2">
                <Plus className="h-4 w-4" />
                <span>{t("schedule.addClass")}</span>
              </Button>
            )}
            {activeTab === "exams" && (
              <Button onClick={openCreateExam} className="gap-2">
                <Plus className="h-4 w-4" />
                <span>{t("schedule.addExam")}</span>
              </Button>
            )}
            {activeTab === "terms" && (
              <Button onClick={openCreateTerm} className="gap-2">
                <Plus className="h-4 w-4" />
                <span>{t("schedule.addTerm")}</span>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Main Tabs (Classes / Exams / Terms) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab("classes")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
            activeTab === "classes"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>{t("schedule.tabClass")} ({classes.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("exams")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
            activeTab === "exams"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>ตารางสอบ ({exams.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("terms")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
            activeTab === "terms"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <CalendarDays className="h-4 w-4" />
          <span>{t("schedule.tabTerms")} ({terms.length})</span>
        </button>
      </div>

      {/* Filter Toolbar (for Classes & Exams) */}
      {activeTab !== "terms" && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border bg-card p-4 shadow-xs">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("schedule.searchPlaceholder")}
              className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-input bg-background"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">{t("schedule.term")}:</span>
            <select
              value={selectedTermId}
              onChange={(e) => setSelectedTermId(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-lg border border-input bg-background font-medium"
            >
              {terms.map((tm) => (
                <option key={tm.id} value={tm.id}>
                  {locale === "th" ? tm.nameTh : tm.nameEn} {tm.isCurrent ? `[${t("schedule.currentTerm")}]` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Tab 1: Classes Table */}
      {activeTab === "classes" && (
        <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground">
                <tr>
                  <th className="p-4">{t("schedule.time")}</th>
                  <th className="p-4">รหัส-ชื่อวิชา</th>
                  <th className="p-4 text-center">Sec</th>
                  <th className="p-4">{t("schedule.room")}</th>
                  <th className="p-4">{t("schedule.filterInstructor")}</th>
                  <th className="p-4">{t("schedule.filterCurriculum")}</th>
                  {canManage && <th className="p-4 text-right">จัดการ</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredClasses.length === 0 ? (
                  <tr>
                    <td colSpan={canManage ? 7 : 6} className="p-8 text-center text-muted-foreground">
                      {t("schedule.empty")}
                    </td>
                  </tr>
                ) : (
                  filteredClasses.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-4 whitespace-nowrap">
                        <div className="font-bold text-foreground">
                          {t(`schedule.day.${item.dayOfWeek}`)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.startTime} - {item.endTime} น.
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-mono font-bold text-primary text-xs">
                          {item.course.courseCode}
                        </div>
                        <div className="font-medium text-foreground">
                          {locale === "th" ? item.course.nameTh : item.course.nameEn}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {item.course.credits} หน่วยกิต
                        </div>
                      </td>
                      <td className="p-4 text-center font-bold">
                        {item.section}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="font-semibold text-foreground">{item.room}</div>
                        {item.building && (
                          <div className="text-xs text-muted-foreground">{item.building}</div>
                        )}
                      </td>
                      <td className="p-4 text-xs">
                        {item.instructor ? (
                          locale === "th"
                            ? `${item.instructor.academicTitleTh} ${item.instructor.firstNameTh} ${item.instructor.lastNameTh}`
                            : `${item.instructor.academicTitleEn} ${item.instructor.firstNameEn} ${item.instructor.lastNameEn}`
                        ) : (
                          item.instructorName || "-"
                        )}
                      </td>
                      <td className="p-4 text-xs">
                        {item.curriculum ? (
                          <span>{item.curriculum.programCode} {item.targetYear ? `(ปี ${item.targetYear})` : ""}</span>
                        ) : (
                          "-"
                        )}
                      </td>
                      {canManage && (
                        <td className="p-4 text-right whitespace-nowrap">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => openEditClass(item)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteClass(item)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Exams Table */}
      {activeTab === "exams" && (
        <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground">
                <tr>
                  <th className="p-4">{t("schedule.examType")}</th>
                  <th className="p-4">{t("schedule.examDate")} & {t("schedule.time")}</th>
                  <th className="p-4">รหัส-ชื่อวิชา</th>
                  <th className="p-4 text-center">Sec</th>
                  <th className="p-4">{t("schedule.examRoom")}</th>
                  <th className="p-4">{t("schedule.invigilator")}</th>
                  {canManage && <th className="p-4 text-right">จัดการ</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredExams.length === 0 ? (
                  <tr>
                    <td colSpan={canManage ? 7 : 6} className="p-8 text-center text-muted-foreground">
                      {t("schedule.empty")}
                    </td>
                  </tr>
                ) : (
                  filteredExams.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-4 whitespace-nowrap">
                        <span className="inline-flex rounded-md bg-primary/10 text-primary px-2.5 py-1 text-xs font-bold">
                          {t(`schedule.examType.${item.examType}`)}
                        </span>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="font-bold text-foreground">
                          {formatDate(new Date(item.examDate), locale)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.startTime} - {item.endTime} น.
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-mono font-bold text-primary text-xs">
                          {item.course.courseCode}
                        </div>
                        <div className="font-medium text-foreground">
                          {locale === "th" ? item.course.nameTh : item.course.nameEn}
                        </div>
                      </td>
                      <td className="p-4 text-center font-bold">
                        {item.section}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="font-semibold text-foreground">{item.room}</div>
                        {item.seatRange && (
                          <div className="text-xs text-muted-foreground">{item.seatRange}</div>
                        )}
                      </td>
                      <td className="p-4 text-xs">
                        {item.invigilator ? (
                          locale === "th"
                            ? `${item.invigilator.academicTitleTh} ${item.invigilator.firstNameTh} ${item.invigilator.lastNameTh}`
                            : `${item.invigilator.academicTitleEn} ${item.invigilator.firstNameEn} ${item.invigilator.lastNameEn}`
                        ) : (
                          item.invigilatorName || "-"
                        )}
                      </td>
                      {canManage && (
                        <td className="p-4 text-right whitespace-nowrap">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => openEditExam(item)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteExam(item)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Academic Terms Table */}
      {activeTab === "terms" && (
        <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground">
                <tr>
                  <th className="p-4">ปีการศึกษา / ภาคเรียน</th>
                  <th className="p-4">ชื่อภาคการศึกษา (ไทย)</th>
                  <th className="p-4">ชื่อภาคการศึกษา (English)</th>
                  <th className="p-4">ระยะเวลา</th>
                  <th className="p-4 text-center">สถานะ</th>
                  {canManage && <th className="p-4 text-right">จัดการ</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {terms.length === 0 ? (
                  <tr>
                    <td colSpan={canManage ? 6 : 5} className="p-8 text-center text-muted-foreground">
                      {t("schedule.noTerms")}
                    </td>
                  </tr>
                ) : (
                  terms.map((tm) => (
                    <tr key={tm.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-4 font-bold text-foreground">
                        {tm.term}/{tm.year}
                      </td>
                      <td className="p-4 font-medium text-foreground">{tm.nameTh}</td>
                      <td className="p-4 text-muted-foreground">{tm.nameEn}</td>
                      <td className="p-4 text-xs text-muted-foreground">
                        {tm.startDate && tm.endDate ? (
                          `${formatDate(new Date(tm.startDate), locale)} - ${formatDate(new Date(tm.endDate), locale)}`
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {tm.isCurrent ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 px-2.5 py-0.5 text-xs font-bold">
                            <Check className="h-3 w-3" />
                            <span>{t("schedule.currentTerm")}</span>
                          </span>
                        ) : canManage ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => handleSetCurrentTerm(tm.id)}
                          >
                            {t("schedule.setAsCurrentTerm")}
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                      {canManage && (
                        <td className="p-4 text-right whitespace-nowrap">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => openEditTerm(tm)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteTerm(tm)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Class Schedule */}
      {classDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-lg font-bold text-foreground">
                {editingClass ? t("schedule.editClass") : t("schedule.addClass")}
              </h2>
              <button
                type="button"
                onClick={() => setClassDialogOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t("schedule.term")}
                  </label>
                  <select
                    value={classForm.termId}
                    onChange={(e) => setClassForm({ ...classForm, termId: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                    required
                  >
                    {terms.map((tm) => (
                      <option key={tm.id} value={tm.id}>
                        {tm.nameTh}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t("schedule.section")}
                  </label>
                  <input
                    type="text"
                    value={classForm.section}
                    onChange={(e) => setClassForm({ ...classForm, section: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  รายวิชา
                </label>
                <select
                  value={classForm.courseId}
                  onChange={(e) => setClassForm({ ...classForm, courseId: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                  required
                >
                  {options.courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.courseCode} - {locale === "th" ? c.nameTh : c.nameEn} ({c.credits} {t("common.credits")})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t("schedule.filterDay")}
                  </label>
                  <select
                    value={classForm.dayOfWeek}
                    onChange={(e) => setClassForm({ ...classForm, dayOfWeek: e.target.value as DayOfWeek })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                  >
                    {DAY_ORDER.map((d) => (
                      <option key={d} value={d}>
                        {t(`schedule.day.${d}`)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t("schedule.startTime")}
                  </label>
                  <input
                    type="text"
                    value={classForm.startTime}
                    onChange={(e) => setClassForm({ ...classForm, startTime: e.target.value })}
                    placeholder="09:00"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t("schedule.endTime")}
                  </label>
                  <input
                    type="text"
                    value={classForm.endTime}
                    onChange={(e) => setClassForm({ ...classForm, endTime: e.target.value })}
                    placeholder="12:00"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t("schedule.room")}
                  </label>
                  <input
                    type="text"
                    value={classForm.room}
                    onChange={(e) => setClassForm({ ...classForm, room: e.target.value })}
                    placeholder="IT-401 หรือ Online"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t("schedule.building")}
                  </label>
                  <input
                    type="text"
                    value={classForm.building}
                    onChange={(e) => setClassForm({ ...classForm, building: e.target.value })}
                    placeholder="อาคารเรียนรวม"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t("schedule.filterInstructor")} (อาจารย์ในระบบ)
                  </label>
                  <select
                    value={classForm.instructorId}
                    onChange={(e) => setClassForm({ ...classForm, instructorId: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                  >
                    <option value="">-- ไม่ระบุ / ผู้สอนภายนอก --</option>
                    {options.instructors.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.academicTitleTh} {inst.firstNameTh} {inst.lastNameTh}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    ชื่อผู้สอน (กรณีผู้สอนภายนอก/พิเศษ)
                  </label>
                  <input
                    type="text"
                    value={classForm.instructorName}
                    onChange={(e) => setClassForm({ ...classForm, instructorName: e.target.value })}
                    placeholder="ชื่อผู้สอนสำรอง"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t("schedule.filterCurriculum")}
                  </label>
                  <select
                    value={classForm.curriculumId}
                    onChange={(e) => setClassForm({ ...classForm, curriculumId: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                  >
                    <option value="">-- ไม่ระบุหลักสูตร --</option>
                    {options.curricula.map((curr) => (
                      <option key={curr.id} value={curr.id}>
                        {curr.programCode} - {curr.nameTh}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t("schedule.targetYear")}
                  </label>
                  <select
                    value={classForm.targetYear}
                    onChange={(e) => setClassForm({ ...classForm, targetYear: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                  >
                    {[1, 2, 3, 4, 5, 6].map((yr) => (
                      <option key={yr} value={yr}>
                        ชั้นปีที่ {yr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-border pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setClassDialogOpen(false)}
                >
                  ยกเลิก
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Exam Schedule */}
      {examDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-lg font-bold text-foreground">
                {editingExam ? t("schedule.editExam") : t("schedule.addExam")}
              </h2>
              <button
                type="button"
                onClick={() => setExamDialogOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExam} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t("schedule.term")}
                  </label>
                  <select
                    value={examForm.termId}
                    onChange={(e) => setExamForm({ ...examForm, termId: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                    required
                  >
                    {terms.map((tm) => (
                      <option key={tm.id} value={tm.id}>
                        {tm.nameTh}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t("schedule.examType")}
                  </label>
                  <select
                    value={examForm.examType}
                    onChange={(e) => setExamForm({ ...examForm, examType: e.target.value as ExamType })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                  >
                    <option value="MIDTERM">{t("schedule.examType.MIDTERM")}</option>
                    <option value="FINAL">{t("schedule.examType.FINAL")}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    รายวิชา
                  </label>
                  <select
                    value={examForm.courseId}
                    onChange={(e) => setExamForm({ ...examForm, courseId: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                    required
                  >
                    {options.courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.courseCode} - {locale === "th" ? c.nameTh : c.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    กลุ่มเรียน (Section)
                  </label>
                  <input
                    type="text"
                    value={examForm.section}
                    onChange={(e) => setExamForm({ ...examForm, section: e.target.value })}
                    placeholder="ทุกกลุ่ม หรือ 1"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t("schedule.examDate")}
                  </label>
                  <input
                    type="date"
                    value={examForm.examDate}
                    onChange={(e) => setExamForm({ ...examForm, examDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t("schedule.startTime")}
                  </label>
                  <input
                    type="text"
                    value={examForm.startTime}
                    onChange={(e) => setExamForm({ ...examForm, startTime: e.target.value })}
                    placeholder="09:00"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t("schedule.endTime")}
                  </label>
                  <input
                    type="text"
                    value={examForm.endTime}
                    onChange={(e) => setExamForm({ ...examForm, endTime: e.target.value })}
                    placeholder="12:00"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t("schedule.examRoom")}
                  </label>
                  <input
                    type="text"
                    value={examForm.room}
                    onChange={(e) => setExamForm({ ...examForm, room: e.target.value })}
                    placeholder="IT-Auditorium หรือ IT-301"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t("schedule.seatRange")}
                  </label>
                  <input
                    type="text"
                    value={examForm.seatRange}
                    onChange={(e) => setExamForm({ ...examForm, seatRange: e.target.value })}
                    placeholder="ที่นั่ง 01-60"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t("schedule.invigilator")} (อาจารย์ในระบบ)
                  </label>
                  <select
                    value={examForm.invigilatorId}
                    onChange={(e) => setExamForm({ ...examForm, invigilatorId: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                  >
                    <option value="">-- ไม่ระบุ --</option>
                    {options.instructors.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.academicTitleTh} {inst.firstNameTh} {inst.lastNameTh}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    ชื่อกรรมการคุมสอบ (กรณีระบุภายนอก)
                  </label>
                  <input
                    type="text"
                    value={examForm.invigilatorName}
                    onChange={(e) => setExamForm({ ...examForm, invigilatorName: e.target.value })}
                    placeholder="ชื่อกรรมการคุมสอบ"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-border pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setExamDialogOpen(false)}
                >
                  ยกเลิก
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Academic Term */}
      {termDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-lg font-bold text-foreground">
                {editingTerm ? t("schedule.editTerm") : t("schedule.addTerm")}
              </h2>
              <button
                type="button"
                onClick={() => setTermDialogOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTerm} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    ปีการศึกษา (พ.ศ.)
                  </label>
                  <input
                    type="number"
                    value={termForm.year}
                    onChange={(e) => setTermForm({ ...termForm, year: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    ภาคเรียน (1, 2, 3)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={3}
                    value={termForm.term}
                    onChange={(e) => setTermForm({ ...termForm, term: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  ชื่อภาคการศึกษา (ไทย)
                </label>
                <input
                  type="text"
                  value={termForm.nameTh}
                  onChange={(e) => setTermForm({ ...termForm, nameTh: e.target.value })}
                  placeholder="ภาคการศึกษาต้น 2569"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  ชื่อภาคการศึกษา (English)
                </label>
                <input
                  type="text"
                  value={termForm.nameEn}
                  onChange={(e) => setTermForm({ ...termForm, nameEn: e.target.value })}
                  placeholder="First Semester 2026"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    วันเริ่มต้นภาคเรียน
                  </label>
                  <input
                    type="date"
                    value={termForm.startDate}
                    onChange={(e) => setTermForm({ ...termForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    วันสิ้นสุดภาคเรียน
                  </label>
                  <input
                    type="date"
                    value={termForm.endDate}
                    onChange={(e) => setTermForm({ ...termForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isCurrent"
                  checked={termForm.isCurrent}
                  onChange={(e) => setTermForm({ ...termForm, isCurrent: e.target.checked })}
                  className="h-4 w-4 rounded border-input"
                />
                <label htmlFor="isCurrent" className="text-xs font-medium text-foreground cursor-pointer">
                  {t("schedule.setAsCurrentTerm")}
                </label>
              </div>

              <div className="flex justify-end gap-2 border-t border-border pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setTermDialogOpen(false)}
                >
                  ยกเลิก
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
