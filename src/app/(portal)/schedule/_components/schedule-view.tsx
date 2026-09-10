"use client";

import { useState, useMemo } from "react";
import { useLocale, useT } from "@/shared/lib/i18n/client";
import { formatDate } from "@/shared/lib/format";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Search,
  Grid,
  List,
  GraduationCap,
  CalendarDays,
  FileSpreadsheet,
} from "lucide-react";
import type { DayOfWeek, ExamType } from "@/generated/prisma";

export interface ScheduleItem {
  id: string;
  section: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  room: string;
  building?: string | null;
  instructorName?: string | null;
  targetYear?: number | null;
  notes?: string | null;
  course: {
    id: string;
    courseCode: string;
    nameTh: string;
    nameEn: string;
    credits: string;
  };
  instructor?: {
    id: string;
    academicTitleTh: string;
    academicTitleEn: string;
    firstNameTh: string;
    lastNameTh: string;
    firstNameEn: string;
    lastNameEn: string;
  } | null;
  curriculum?: {
    id: string;
    programCode: string;
    nameTh: string;
  } | null;
}

export interface ExamItem {
  id: string;
  section: string;
  examType: ExamType;
  examDate: Date | string;
  startTime: string;
  endTime: string;
  room: string;
  seatRange?: string | null;
  invigilatorName?: string | null;
  notes?: string | null;
  course: {
    id: string;
    courseCode: string;
    nameTh: string;
    nameEn: string;
    credits: string;
  };
  invigilator?: {
    id: string;
    academicTitleTh: string;
    academicTitleEn: string;
    firstNameTh: string;
    lastNameTh: string;
    firstNameEn: string;
    lastNameEn: string;
  } | null;
}

export interface TermItem {
  id: string;
  year: number;
  term: number;
  nameTh: string;
  nameEn: string;
  isCurrent: boolean;
}

interface ScheduleViewProps {
  terms: TermItem[];
  selectedTermId: string;
  classes: ScheduleItem[];
  exams: ExamItem[];
  instructors: {
    id: string;
    nameTh: string;
    nameEn: string;
  }[];
  curricula: {
    id: string;
    programCode: string;
    nameTh: string;
  }[];
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

const DAY_COLORS: Record<DayOfWeek, { bg: string; border: string; text: string; badge: string }> = {
  MONDAY: {
    bg: "bg-amber-500/10 dark:bg-amber-500/15",
    border: "border-amber-300 dark:border-amber-700/60",
    text: "text-amber-800 dark:text-amber-300",
    badge: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border-amber-300",
  },
  TUESDAY: {
    bg: "bg-rose-500/10 dark:bg-rose-500/15",
    border: "border-rose-300 dark:border-rose-700/60",
    text: "text-rose-800 dark:text-rose-300",
    badge: "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-300 border-rose-300",
  },
  WEDNESDAY: {
    bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    border: "border-emerald-300 dark:border-emerald-700/60",
    text: "text-emerald-800 dark:text-emerald-300",
    badge: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300",
  },
  THURSDAY: {
    bg: "bg-orange-500/10 dark:bg-orange-500/15",
    border: "border-orange-300 dark:border-orange-700/60",
    text: "text-orange-800 dark:text-orange-300",
    badge: "bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-300 border-orange-300",
  },
  FRIDAY: {
    bg: "bg-sky-500/10 dark:bg-sky-500/15",
    border: "border-sky-300 dark:border-sky-700/60",
    text: "text-sky-800 dark:text-sky-300",
    badge: "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-300 border-sky-300",
  },
  SATURDAY: {
    bg: "bg-purple-500/10 dark:bg-purple-500/15",
    border: "border-purple-300 dark:border-purple-700/60",
    text: "text-purple-800 dark:text-purple-300",
    badge: "bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300 border-purple-300",
  },
  SUNDAY: {
    bg: "bg-red-500/10 dark:bg-red-500/15",
    border: "border-red-300 dark:border-red-700/60",
    text: "text-red-800 dark:text-red-300",
    badge: "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-300 border-red-300",
  },
};

const TIME_SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

export function ScheduleView({
  terms,
  selectedTermId,
  classes,
  exams,
  instructors,
  curricula,
}: ScheduleViewProps) {
  const locale = useLocale();
  const t = useT();

  const [activeTab, setActiveTab] = useState<"class" | "midterm" | "final">("class");
  const [viewMode, setViewMode] = useState<"matrix" | "list">("matrix");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDay, setSelectedDay] = useState<string>("ALL");
  const [selectedInstructorId, setSelectedInstructorId] = useState<string>("ALL");
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<string>("ALL");
  const [activeTermId, setActiveTermId] = useState(selectedTermId);

  // Filtered classes
  const filteredClasses = useMemo(() => {
    return classes.filter((item) => {
      if (selectedDay !== "ALL" && item.dayOfWeek !== selectedDay) return false;
      if (selectedInstructorId !== "ALL" && item.instructor?.id !== selectedInstructorId) return false;
      if (selectedCurriculumId !== "ALL" && item.curriculum?.id !== selectedCurriculumId) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const code = item.course.courseCode.toLowerCase();
        const nameTh = item.course.nameTh.toLowerCase();
        const nameEn = item.course.nameEn.toLowerCase();
        const room = item.room.toLowerCase();
        const instTh = item.instructor
          ? `${item.instructor.academicTitleTh} ${item.instructor.firstNameTh} ${item.instructor.lastNameTh}`.toLowerCase()
          : (item.instructorName ?? "").toLowerCase();
        if (
          !code.includes(q) &&
          !nameTh.includes(q) &&
          !nameEn.includes(q) &&
          !room.includes(q) &&
          !instTh.includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [classes, selectedDay, selectedInstructorId, selectedCurriculumId, searchQuery]);

  // Filtered exams
  const filteredExams = useMemo(() => {
    const examTypeFilter = activeTab === "midterm" ? "MIDTERM" : "FINAL";
    return exams.filter((item) => {
      if (item.examType !== examTypeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const code = item.course.courseCode.toLowerCase();
        const nameTh = item.course.nameTh.toLowerCase();
        const nameEn = item.course.nameEn.toLowerCase();
        const room = item.room.toLowerCase();
        if (!code.includes(q) && !nameTh.includes(q) && !nameEn.includes(q) && !room.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [exams, activeTab, searchQuery]);

  const getInstructorName = (item: ScheduleItem) => {
    if (item.instructor) {
      return locale === "th"
        ? `${item.instructor.academicTitleTh} ${item.instructor.firstNameTh} ${item.instructor.lastNameTh}`
        : `${item.instructor.academicTitleEn} ${item.instructor.firstNameEn} ${item.instructor.lastNameEn}`;
    }
    return item.instructorName ?? "-";
  };

  const getInvigilatorName = (item: ExamItem) => {
    if (item.invigilator) {
      return locale === "th"
        ? `${item.invigilator.academicTitleTh} ${item.invigilator.firstNameTh} ${item.invigilator.lastNameTh}`
        : `${item.invigilator.academicTitleEn} ${item.invigilator.firstNameEn} ${item.invigilator.lastNameEn}`;
    }
    return item.invigilatorName ?? "-";
  };

  // Calculate grid position for matrix view
  const parseHour = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h + m / 60;
  };

  return (
    <div className="space-y-8">
      {/* Term Selector & Navigation Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("schedule.term")}
            </div>
            <div className="flex items-center gap-2">
              <select
                value={activeTermId}
                onChange={(e) => {
                  const newTermId = e.target.value;
                  setActiveTermId(newTermId);
                  window.location.href = `/schedule?termId=${newTermId}`;
                }}
                className="bg-transparent font-bold text-foreground text-base sm:text-lg cursor-pointer focus:outline-none focus:underline"
              >
                {terms.map((term) => (
                  <option key={term.id} value={term.id} className="bg-popover text-popover-foreground">
                    {locale === "th" ? term.nameTh : term.nameEn} {term.isCurrent ? `(${t("schedule.currentTerm")})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tab Switcher (Classes / Midterm / Final) */}
        <div className="flex rounded-xl bg-muted/70 p-1 border border-border/50">
          <button
            onClick={() => setActiveTab("class")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "class"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>{t("schedule.tabClass")}</span>
          </button>
          <button
            onClick={() => setActiveTab("midterm")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "midterm"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>{t("schedule.tabMidterm")}</span>
          </button>
          <button
            onClick={() => setActiveTab("final")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "final"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>{t("schedule.tabFinal")}</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("schedule.searchPlaceholder")}
            className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        {/* Secondary filters for class schedule */}
        {activeTab === "class" ? (
          <div className="flex flex-wrap items-center gap-2">
            {/* Day Filter */}
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="rounded-xl border border-border bg-card px-3 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary"
            >
              <option value="ALL">{t("schedule.filterAllDays")}</option>
              {DAY_ORDER.map((day) => (
                <option key={day} value={day}>
                  {t(`schedule.day.${day}`)}
                </option>
              ))}
            </select>

            {/* Instructor Filter */}
            <select
              value={selectedInstructorId}
              onChange={(e) => setSelectedInstructorId(e.target.value)}
              className="rounded-xl border border-border bg-card px-3 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary max-w-[180px] truncate"
            >
              <option value="ALL">{t("schedule.filterAllInstructors")}</option>
              {instructors.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {locale === "th" ? inst.nameTh : inst.nameEn}
                </option>
              ))}
            </select>

            {/* Curriculum Filter */}
            {curricula.length > 0 && (
              <select
                value={selectedCurriculumId}
                onChange={(e) => setSelectedCurriculumId(e.target.value)}
                className="rounded-xl border border-border bg-card px-3 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary max-w-[180px] truncate"
              >
                <option value="ALL">{t("schedule.filterAllCurricula")}</option>
                {curricula.map((curr) => (
                  <option key={curr.id} value={curr.id}>
                    {curr.programCode}
                  </option>
                ))}
              </select>
            )}

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl bg-muted/70 p-1 border border-border/50">
              <button
                onClick={() => setViewMode("matrix")}
                title={t("schedule.viewMatrix")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "matrix"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                title={t("schedule.viewList")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "list"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Content Rendering: Classes or Exams */}
      {activeTab === "class" ? (
        filteredClasses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <h3 className="mt-4 text-base font-semibold text-foreground">
              {t("schedule.empty")}
            </h3>
          </div>
        ) : viewMode === "matrix" ? (
          /* Weekly Timetable Matrix */
          <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm p-4">
            <div className="min-w-[900px]">
              {/* Header Time Columns (08:00 - 18:00) */}
              <div className="grid grid-cols-11 border-b border-border pb-3 text-center text-xs font-semibold text-muted-foreground">
                <div className="text-left pl-2 font-bold text-foreground">
                  {locale === "th" ? "วัน / เวลา" : "Day / Time"}
                </div>
                {TIME_SLOTS.map((time) => (
                  <div key={time} className="border-l border-border/40">
                    {time}
                  </div>
                ))}
              </div>

              {/* Rows for Days */}
              <div className="divide-y divide-border/60">
                {DAY_ORDER.map((day) => {
                  const dayClasses = filteredClasses.filter((c) => c.dayOfWeek === day);
                  if (dayClasses.length === 0 && selectedDay !== "ALL") return null;

                  const color = DAY_COLORS[day];

                  return (
                    <div key={day} className="grid grid-cols-11 py-3 items-stretch min-h-[90px]">
                      {/* Day Label Column */}
                      <div className="flex items-center pl-2 pr-3">
                        <span className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-bold ${color.badge}`}>
                          {t(`schedule.day.${day}`)}
                        </span>
                      </div>

                      {/* Schedule Slots Canvas (10 cols wide) */}
                      <div className="col-span-10 relative h-full min-h-[75px] grid grid-cols-10 border-l border-border/40">
                        {/* Background guide lines for each hour */}
                        {TIME_SLOTS.map((_, i) => (
                          <div key={i} className="border-r border-border/20 h-full pointer-events-none" />
                        ))}

                        {/* Class Cards overlaid */}
                        {dayClasses.map((item) => {
                          const start = parseHour(item.startTime);
                          const end = parseHour(item.endTime);
                          const leftCol = Math.max(0, start - 8);
                          const colSpan = Math.max(1, end - start);

                          return (
                            <div
                              key={item.id}
                              style={{
                                gridColumnStart: Math.floor(leftCol) + 1,
                                gridColumnEnd: `span ${Math.ceil(colSpan)}`,
                              }}
                              className={`m-1 p-2 rounded-xl border ${color.bg} ${color.border} flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md transition-shadow group`}
                            >
                              <div>
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-mono text-xs font-bold text-primary">
                                    {item.course.courseCode}
                                  </span>
                                  <span className="text-[10px] font-semibold bg-background/80 px-1.5 py-0.5 rounded border border-border/60 text-muted-foreground">
                                    Sec {item.section}
                                  </span>
                                </div>
                                <div className="text-xs font-semibold text-foreground truncate mt-0.5" title={locale === "th" ? item.course.nameTh : item.course.nameEn}>
                                  {locale === "th" ? item.course.nameTh : item.course.nameEn}
                                </div>
                              </div>

                              <div className="mt-1 pt-1 border-t border-border/30 flex items-center justify-between text-[11px] text-muted-foreground">
                                <span className="flex items-center gap-1 font-medium">
                                  <Clock className="h-3 w-3 text-primary" />
                                  <span>{item.startTime}-{item.endTime}</span>
                                </span>
                                <span className="flex items-center gap-1 font-semibold text-foreground">
                                  <MapPin className="h-3 w-3 text-primary" />
                                  <span>{item.room}</span>
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* List / Cards View */
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredClasses.map((item) => {
              const color = DAY_COLORS[item.dayOfWeek];
              return (
                <div
                  key={item.id}
                  className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-bold ${color.badge}`}>
                        {t(`schedule.day.${item.dayOfWeek}`)}
                      </span>
                      <span className="text-xs font-bold bg-muted px-2 py-0.5 rounded text-foreground">
                        Sec {item.section}
                      </span>
                    </div>

                    <div>
                      <div className="font-mono text-sm font-bold text-primary">
                        {item.course.courseCode}
                      </div>
                      <div className="text-base font-semibold text-foreground mt-0.5">
                        {locale === "th" ? item.course.nameTh : item.course.nameEn}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {locale === "th" ? item.course.nameEn : item.course.nameTh}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border/60 space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        <span>{t("schedule.time")}</span>
                      </span>
                      <span className="font-bold text-foreground">
                        {item.startTime} - {item.endTime} น.
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        <span>{t("schedule.room")}</span>
                      </span>
                      <span className="font-semibold text-foreground">
                        {item.room} {item.building ? `(${item.building})` : ""}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-primary" />
                        <span>{t("schedule.filterInstructor")}</span>
                      </span>
                      <span className="font-semibold text-foreground truncate max-w-[160px]">
                        {getInstructorName(item)}
                      </span>
                    </div>

                    {item.curriculum && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <GraduationCap className="h-3.5 w-3.5 text-primary" />
                          <span>{t("schedule.filterCurriculum")}</span>
                        </span>
                        <span className="font-medium text-foreground">
                          {item.curriculum.programCode} {item.targetYear ? `(ปี ${item.targetYear})` : ""}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Exam Schedule View */
        filteredExams.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <Clock className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <h3 className="mt-4 text-base font-semibold text-foreground">
              {t("schedule.empty")}
            </h3>
          </div>
        ) : (
          <div className="divide-y divide-border rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            {filteredExams.map((exam) => {
              const formattedDate = formatDate(new Date(exam.examDate), locale);

              return (
                <div key={exam.id} className="p-5 hover:bg-muted/20 transition-colors">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Left: Date & Time Badge */}
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 px-4 py-3 min-w-[100px] text-center">
                        <Calendar className="h-5 w-5 mb-1" />
                        <span className="text-xs font-bold leading-tight">
                          {formattedDate}
                        </span>
                      </div>

                      {/* Course details */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm font-bold text-primary">
                            {exam.course.courseCode}
                          </span>
                          <span className="rounded bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                            Sec {exam.section}
                          </span>
                          <span className="rounded-full bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 text-[11px] font-bold">
                            {t(`schedule.examType.${exam.examType}`)}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-foreground">
                          {locale === "th" ? exam.course.nameTh : exam.course.nameEn}
                        </h4>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {locale === "th" ? exam.course.nameEn : exam.course.nameTh}
                        </div>
                      </div>
                    </div>

                    {/* Right: Room, Seat, Time */}
                    <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm">
                      <div className="flex items-center gap-1.5 rounded-lg bg-muted/60 px-3 py-1.5 text-foreground">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="font-semibold">
                          {exam.startTime} - {exam.endTime} น.
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 rounded-lg bg-muted/60 px-3 py-1.5 text-foreground">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="font-semibold">
                          {exam.room}
                        </span>
                        {exam.seatRange && (
                          <span className="text-muted-foreground text-xs">
                            ({exam.seatRange})
                          </span>
                        )}
                      </div>

                      {(exam.invigilator || exam.invigilatorName) && (
                        <div className="flex items-center gap-1.5 rounded-lg bg-muted/60 px-3 py-1.5 text-foreground">
                          <User className="h-4 w-4 text-primary" />
                          <span className="text-muted-foreground text-xs">{t("schedule.invigilator")}:</span>
                          <span className="font-semibold">
                            {getInvigilatorName(exam)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
