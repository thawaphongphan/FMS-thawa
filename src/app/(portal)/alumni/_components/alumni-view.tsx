"use client";

import { useState, useMemo, useTransition } from "react";
import { toast } from "sonner";
import { useLocale, useT } from "@/shared/lib/i18n/client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Briefcase,
  Building2,
  Search,
  Award,
  Linkedin,
  Mail,
  UserPlus,
  Quote,
  X,
} from "lucide-react";
import type { EmploymentStatus } from "@/generated/prisma";
import { registerAlumniAction } from "@/features/alumni/actions";

export interface AlumniItem {
  id: string;
  studentId: string;
  titleTh: string;
  titleEn: string;
  firstNameTh: string;
  lastNameTh: string;
  firstNameEn: string;
  lastNameEn: string;
  graduationYear: number;
  generation?: number | null;
  employmentStatus: EmploymentStatus;
  jobTitle?: string | null;
  company?: string | null;
  industry?: string | null;
  salaryRange?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  linkedinUrl?: string | null;
  avatarUrl?: string | null;
  isFeatured: boolean;
  featuredStoryTh?: string | null;
  featuredStoryEn?: string | null;
  curriculum: {
    id: string;
    programCode: string;
    nameTh: string;
    nameEn?: string;
  };
}

interface AlumniViewProps {
  alumniList: AlumniItem[];
  featuredList: AlumniItem[];
  curricula: { id: string; programCode: string; nameTh: string }[];
  graduationYears: number[];
}

export function AlumniView({
  alumniList,
  featuredList,
  curricula,
  graduationYears,
}: AlumniViewProps) {
  const locale = useLocale();
  const t = useT();
  const [pending, startTransition] = useTransition();

  const [search, setSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("ALL");
  const [selectedCurriculum, setSelectedCurriculum] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Registration Modal State
  const [registerOpen, setRegisterOpen] = useState(false);
  const [regForm, setRegForm] = useState({
    studentId: "",
    titleTh: "นาย",
    titleEn: "Mr.",
    firstNameTh: "",
    lastNameTh: "",
    firstNameEn: "",
    lastNameEn: "",
    gender: "MALE" as const,
    curriculumId: curricula[0]?.id || "",
    degreeLevel: "BACHELOR" as const,
    graduationYear: 2568,
    generation: 28,
    employmentStatus: "EMPLOYED" as EmploymentStatus,
    jobTitle: "",
    company: "",
    industry: "",
    email: "",
    phoneNumber: "",
    linkedinUrl: "",
    isFeatured: false,
  });

  const filteredAlumni = useMemo(() => {
    return alumniList.filter((item) => {
      if (selectedYear !== "ALL" && item.graduationYear !== Number(selectedYear)) return false;
      if (selectedCurriculum !== "ALL" && item.curriculum.id !== selectedCurriculum) return false;
      if (selectedStatus !== "ALL" && item.employmentStatus !== selectedStatus) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const code = item.studentId.toLowerCase();
        const nameTh = `${item.firstNameTh} ${item.lastNameTh}`.toLowerCase();
        const nameEn = `${item.firstNameEn} ${item.lastNameEn}`.toLowerCase();
        const comp = (item.company || "").toLowerCase();
        const job = (item.jobTitle || "").toLowerCase();
        if (!code.includes(q) && !nameTh.includes(q) && !nameEn.includes(q) && !comp.includes(q) && !job.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [alumniList, selectedYear, selectedCurriculum, selectedStatus, search]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await registerAlumniAction({
        ...regForm,
        email: regForm.email || undefined,
        phoneNumber: regForm.phoneNumber || undefined,
        linkedinUrl: regForm.linkedinUrl || undefined,
        jobTitle: regForm.jobTitle || undefined,
        company: regForm.company || undefined,
        industry: regForm.industry || undefined,
      });

      if (res.ok) {
        toast.success(t("alumni.saveSuccess"));
        setRegisterOpen(false);
      } else {
        toast.error(res.error.message || "Failed to submit profile");
      }
    });
  };

  const getStatusBadge = (status: EmploymentStatus) => {
    switch (status) {
      case "EMPLOYED":
        return {
          label: t("alumni.status.EMPLOYED"),
          color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800",
        };
      case "STUDYING":
        return {
          label: t("alumni.status.STUDYING"),
          color: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800",
        };
      case "ENTREPRENEUR":
        return {
          label: t("alumni.status.ENTREPRENEUR"),
          color: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800",
        };
      case "JOB_SEEKING":
        return {
          label: t("alumni.status.JOB_SEEKING"),
          color: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800",
        };
      default:
        return {
          label: t("alumni.status.OTHER"),
          color: "bg-muted text-muted-foreground border-border",
        };
    }
  };

  return (
    <div className="space-y-12">
      {/* 1. Alumni Spotlight / Featured Success Stories */}
      {featuredList.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300 mb-2">
                <Award className="h-3.5 w-3.5" />
                <span>{t("alumni.tabSpotlight")}</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {locale === "th" ? "เรื่องราวความสำเร็จของศิษย์เก่า" : "Alumni Success Stories"}
              </h2>
            </div>

            <Button
              onClick={() => setRegisterOpen(true)}
              variant="outline"
              className="hidden sm:flex items-center gap-2 rounded-xl"
            >
              <UserPlus className="h-4 w-4 text-primary" />
              <span>{t("alumni.tabRegister")}</span>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredList.map((item) => (
              <div
                key={item.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-primary/40"
              >
                <div>
                  <div className="flex items-start gap-4">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-primary/20 bg-muted">
                      {item.avatarUrl ? (
                        <Image
                          src={item.avatarUrl}
                          alt={item.firstNameTh}
                          width={56}
                          height={56}
                          unoptimized
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary font-bold text-lg">
                          {item.firstNameTh[0]}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-base">
                        {locale === "th"
                          ? `${item.titleTh} ${item.firstNameTh} ${item.lastNameTh}`
                          : `${item.titleEn} ${item.firstNameEn} ${item.lastNameEn}`}
                      </h3>
                      <div className="text-xs text-primary font-semibold flex items-center gap-1 mt-0.5">
                        <Briefcase className="h-3 w-3" />
                        <span>{item.jobTitle || "-"}</span>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        <span>{item.company || "-"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Story / Quote */}
                  {(item.featuredStoryTh || item.featuredStoryEn) && (
                    <div className="mt-4 rounded-xl bg-muted/40 p-3.5 text-xs text-muted-foreground italic relative">
                      <Quote className="h-4 w-4 text-primary/30 absolute top-2 right-2" />
                      &ldquo;{locale === "th" ? item.featuredStoryTh : item.featuredStoryEn}&rdquo;
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-medium">
                    {item.curriculum.programCode} (จบปี {item.graduationYear})
                  </span>
                  {item.linkedinUrl && (
                    <a
                      href={item.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      <Linkedin className="h-3.5 w-3.5" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2. Main Directory & Filter Toolbar */}
      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {t("alumni.tabDirectory")}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {locale === "th"
                ? `พบข้อมูลศิษย์เก่าทั้งหมด ${filteredAlumni.length} ท่าน`
                : `Found ${filteredAlumni.length} alumni records`}
            </p>
          </div>

          <Button
            onClick={() => setRegisterOpen(true)}
            size="sm"
            className="sm:hidden flex items-center gap-2 rounded-xl"
          >
            <UserPlus className="h-4 w-4" />
            <span>{t("alumni.tabRegister")}</span>
          </Button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("alumni.searchPlaceholder")}
              className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Year Filter */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="rounded-xl border border-border bg-card px-3 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary"
            >
              <option value="ALL">{t("alumni.allYears")}</option>
              {graduationYears.map((yr) => (
                <option key={yr} value={yr}>
                  พ.ศ. {yr}
                </option>
              ))}
            </select>

            {/* Curriculum Filter */}
            <select
              value={selectedCurriculum}
              onChange={(e) => setSelectedCurriculum(e.target.value)}
              className="rounded-xl border border-border bg-card px-3 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary max-w-[180px] truncate"
            >
              <option value="ALL">{t("alumni.allCurricula")}</option>
              {curricula.map((curr) => (
                <option key={curr.id} value={curr.id}>
                  {curr.programCode}
                </option>
              ))}
            </select>

            {/* Employment Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-xl border border-border bg-card px-3 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary"
            >
              <option value="ALL">{t("alumni.allStatuses")}</option>
              <option value="EMPLOYED">{t("alumni.status.EMPLOYED")}</option>
              <option value="STUDYING">{t("alumni.status.STUDYING")}</option>
              <option value="ENTREPRENEUR">{t("alumni.status.ENTREPRENEUR")}</option>
              <option value="JOB_SEEKING">{t("alumni.status.JOB_SEEKING")}</option>
            </select>
          </div>
        </div>

        {/* Directory Grid */}
        {filteredAlumni.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <h3 className="mt-4 text-base font-semibold text-foreground">
              {t("alumni.empty")}
            </h3>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAlumni.map((item) => {
              const badge = getStatusBadge(item.employmentStatus);
              return (
                <div
                  key={item.id}
                  className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-bold ${badge.color}`}>
                        {badge.label}
                      </span>
                      <span className="text-xs font-bold bg-muted px-2 py-0.5 rounded text-foreground">
                        จบ พ.ศ. {item.graduationYear}
                      </span>
                    </div>

                    <div>
                      <div className="text-xs font-mono font-bold text-muted-foreground">
                        {item.studentId}
                      </div>
                      <h4 className="text-base font-bold text-foreground mt-0.5">
                        {locale === "th"
                          ? `${item.titleTh} ${item.firstNameTh} ${item.lastNameTh}`
                          : `${item.titleEn} ${item.firstNameEn} ${item.lastNameEn}`}
                      </h4>
                      <div className="text-xs text-primary font-medium mt-1">
                        {item.curriculum.programCode} - {item.curriculum.nameTh}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border/60 space-y-2 text-xs text-muted-foreground">
                    {item.jobTitle && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Briefcase className="h-3.5 w-3.5 text-primary" />
                          <span>{t("alumni.jobTitle")}</span>
                        </span>
                        <span className="font-semibold text-foreground truncate max-w-[170px]">
                          {item.jobTitle}
                        </span>
                      </div>
                    )}

                    {item.company && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-primary" />
                          <span>{t("alumni.company")}</span>
                        </span>
                        <span className="font-semibold text-foreground truncate max-w-[170px]">
                          {item.company}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-2">
                      {item.email && (
                        <a
                          href={`mailto:${item.email}`}
                          className="text-muted-foreground hover:text-foreground"
                          title={item.email}
                        >
                          <Mail className="h-4 w-4" />
                        </a>
                      )}
                      {item.linkedinUrl && (
                        <a
                          href={item.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#0A66C2] hover:opacity-80"
                        >
                          <Linkedin className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. Register / Update Profile Modal */}
      {registerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  {t("alumni.tabRegister")}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {locale === "th"
                    ? "กรอกข้อมูลเพื่อเชื่อมต่อเครือข่ายศิษย์เก่าและอัปเดตสถานะการทำงาน"
                    : "Update your profile and employment records with the faculty"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRegisterOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t("alumni.studentId")}
                  </label>
                  <input
                    type="text"
                    value={regForm.studentId}
                    onChange={(e) => setRegForm({ ...regForm, studentId: e.target.value })}
                    placeholder="เช่น 64010123"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t("alumni.graduationYear")}
                  </label>
                  <input
                    type="number"
                    value={regForm.graduationYear}
                    onChange={(e) => setRegForm({ ...regForm, graduationYear: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    คำนำหน้า
                  </label>
                  <input
                    type="text"
                    value={regForm.titleTh}
                    onChange={(e) => setRegForm({ ...regForm, titleTh: e.target.value })}
                    placeholder="นาย / นางสาว"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    ชื่อ (ไทย)
                  </label>
                  <input
                    type="text"
                    value={regForm.firstNameTh}
                    onChange={(e) => setRegForm({ ...regForm, firstNameTh: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    นามสกุล (ไทย)
                  </label>
                  <input
                    type="text"
                    value={regForm.lastNameTh}
                    onChange={(e) => setRegForm({ ...regForm, lastNameTh: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Title (Eng)
                  </label>
                  <input
                    type="text"
                    value={regForm.titleEn}
                    onChange={(e) => setRegForm({ ...regForm, titleEn: e.target.value })}
                    placeholder="Mr. / Ms."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    First Name (Eng)
                  </label>
                  <input
                    type="text"
                    value={regForm.firstNameEn}
                    onChange={(e) => setRegForm({ ...regForm, firstNameEn: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Last Name (Eng)
                  </label>
                  <input
                    type="text"
                    value={regForm.lastNameEn}
                    onChange={(e) => setRegForm({ ...regForm, lastNameEn: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  {t("alumni.curriculum")}
                </label>
                <select
                  value={regForm.curriculumId}
                  onChange={(e) => setRegForm({ ...regForm, curriculumId: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                  required
                >
                  {curricula.map((curr) => (
                    <option key={curr.id} value={curr.id}>
                      {curr.programCode} - {curr.nameTh}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t("alumni.employmentStatus")}
                  </label>
                  <select
                    value={regForm.employmentStatus}
                    onChange={(e) => setRegForm({ ...regForm, employmentStatus: e.target.value as EmploymentStatus })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                  >
                    <option value="EMPLOYED">{t("alumni.status.EMPLOYED")}</option>
                    <option value="STUDYING">{t("alumni.status.STUDYING")}</option>
                    <option value="ENTREPRENEUR">{t("alumni.status.ENTREPRENEUR")}</option>
                    <option value="JOB_SEEKING">{t("alumni.status.JOB_SEEKING")}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t("alumni.jobTitle")}
                  </label>
                  <input
                    type="text"
                    value={regForm.jobTitle}
                    onChange={(e) => setRegForm({ ...regForm, jobTitle: e.target.value })}
                    placeholder="เช่น Senior Software Engineer"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t("alumni.company")}
                  </label>
                  <input
                    type="text"
                    value={regForm.company}
                    onChange={(e) => setRegForm({ ...regForm, company: e.target.value })}
                    placeholder="เช่น Agoda, SCB TechX"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t("alumni.linkedin")}
                  </label>
                  <input
                    type="text"
                    value={regForm.linkedinUrl}
                    onChange={(e) => setRegForm({ ...regForm, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-border pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRegisterOpen(false)}
                >
                  ยกเลิก
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? "กำลังบันทึก..." : "ส่งข้อมูล"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
