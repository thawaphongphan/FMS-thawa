"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Search, GraduationCap, Check, X } from "lucide-react";
import { useLocale, useT } from "@/shared/lib/i18n/client";
import type { StaffProfileDto, DepartmentDto } from "@/features/staff";
import { createStaffAction, updateStaffAction, deleteStaffAction } from "@/features/staff/actions";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface StaffClientProps {
  initialStaff: StaffProfileDto[];
  departments: DepartmentDto[];
  canManage: boolean;
}

export function StaffClient({ initialStaff, departments, canManage }: StaffClientProps) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [staffList, setStaffList] = useState<StaffProfileDto[]>(initialStaff);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<string>("ALL");

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffProfileDto | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    departmentId: departments[0]?.id ?? "",
    academicTitleTh: "อ.ดร.",
    academicTitleEn: "Dr.",
    firstNameTh: "",
    lastNameTh: "",
    firstNameEn: "",
    lastNameEn: "",
    email: "",
    phoneNumber: "",
    officeRoom: "",
    avatarUrl: "",
    adminPositionTh: "",
    adminPositionEn: "",
    bioTh: "",
    bioEn: "",
    researchInterestsInput: "",
    orderIndex: 0,
    status: "ACTIVE" as "ACTIVE" | "ON_LEAVE" | "RETIRED",
  });

  const openCreateDialog = () => {
    setEditingStaff(null);
    setFormData({
      departmentId: departments[0]?.id ?? "",
      academicTitleTh: "อ.ดร.",
      academicTitleEn: "Dr.",
      firstNameTh: "",
      lastNameTh: "",
      firstNameEn: "",
      lastNameEn: "",
      email: "",
      phoneNumber: "",
      officeRoom: "",
      avatarUrl: "",
      adminPositionTh: "",
      adminPositionEn: "",
      bioTh: "",
      bioEn: "",
      researchInterestsInput: "",
      orderIndex: (initialStaff.length + 1) * 10,
      status: "ACTIVE",
    });
    setDialogOpen(true);
  };

  const openEditDialog = (staff: StaffProfileDto) => {
    setEditingStaff(staff);
    setFormData({
      departmentId: staff.departmentId,
      academicTitleTh: staff.academicTitleTh,
      academicTitleEn: staff.academicTitleEn,
      firstNameTh: staff.firstNameTh,
      lastNameTh: staff.lastNameTh,
      firstNameEn: staff.firstNameEn,
      lastNameEn: staff.lastNameEn,
      email: staff.email,
      phoneNumber: staff.phoneNumber ?? "",
      officeRoom: staff.officeRoom ?? "",
      avatarUrl: staff.avatarUrl ?? "",
      adminPositionTh: staff.adminPositionTh ?? "",
      adminPositionEn: staff.adminPositionEn ?? "",
      bioTh: staff.bioTh ?? "",
      bioEn: staff.bioEn ?? "",
      researchInterestsInput: staff.researchInterests.join(", "),
      orderIndex: staff.orderIndex,
      status: staff.status,
    });
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstNameTh || !formData.lastNameTh || !formData.departmentId) {
      toast.error(t("common.requiredFields"));
      return;
    }

    const researchInterests = formData.researchInterestsInput
      ? formData.researchInterestsInput.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    startTransition(async () => {
      if (editingStaff) {
        const res = await updateStaffAction({
          id: editingStaff.id,
          departmentId: formData.departmentId,
          academicTitleTh: formData.academicTitleTh,
          academicTitleEn: formData.academicTitleEn,
          firstNameTh: formData.firstNameTh,
          lastNameTh: formData.lastNameTh,
          firstNameEn: formData.firstNameEn,
          lastNameEn: formData.lastNameEn,
          email: formData.email,
          phoneNumber: formData.phoneNumber || null,
          officeRoom: formData.officeRoom || null,
          avatarUrl: formData.avatarUrl || null,
          adminPositionTh: formData.adminPositionTh || null,
          adminPositionEn: formData.adminPositionEn || null,
          bioTh: formData.bioTh || null,
          bioEn: formData.bioEn || null,
          researchInterests,
          educationHistory: editingStaff.educationHistory,
          orderIndex: Number(formData.orderIndex),
          status: formData.status,
        });
        if (res.ok) {
          toast.success(t("staff.saveSuccess"));
          setDialogOpen(false);
          router.refresh();
        } else {
          toast.error(res.error.message);
        }
      } else {
        const res = await createStaffAction({
          departmentId: formData.departmentId,
          academicTitleTh: formData.academicTitleTh,
          academicTitleEn: formData.academicTitleEn,
          firstNameTh: formData.firstNameTh,
          lastNameTh: formData.lastNameTh,
          firstNameEn: formData.firstNameEn,
          lastNameEn: formData.lastNameEn,
          email: formData.email,
          phoneNumber: formData.phoneNumber || null,
          officeRoom: formData.officeRoom || null,
          avatarUrl: formData.avatarUrl || null,
          adminPositionTh: formData.adminPositionTh || null,
          adminPositionEn: formData.adminPositionEn || null,
          bioTh: formData.bioTh || null,
          bioEn: formData.bioEn || null,
          researchInterests,
          educationHistory: [],
          orderIndex: Number(formData.orderIndex),
          status: formData.status,
        });
        if (res.ok) {
          toast.success(t("staff.saveSuccess"));
          setDialogOpen(false);
          router.refresh();
        } else {
          toast.error(res.error.message);
        }
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("staff.deleteConfirm"))) return;
    startTransition(async () => {
      const res = await deleteStaffAction(id);
      if (res.ok) {
        toast.success(t("staff.deleteSuccess"));
        setStaffList((prev) => prev.filter((s) => s.id !== id));
        router.refresh();
      } else {
        toast.error(res.error.message);
      }
    });
  };

  // Filter staff list
  const filtered = (staffList.length ? staffList : initialStaff).filter((s) => {
    const matchesSearch =
      s.fullNameTh.toLowerCase().includes(search.toLowerCase()) ||
      s.fullNameEn.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === "ALL" || s.departmentCode === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            {t("staff.adminTitle")}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {t("staff.adminSubtitle")}
          </p>
        </div>
        {canManage && (
          <Button onClick={openCreateDialog} className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            {t("staff.create")}
          </Button>
        )}
      </div>

      {/* Controls: Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("staff.searchPlaceholder")}
            className="w-full rounded-lg border border-input bg-background pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setDeptFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              deptFilter === "ALL"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {t("staff.allDepartments")}
          </button>
          {departments.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setDeptFilter(d.code)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                deptFilter === d.code
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {locale === "th" ? d.nameTh : d.nameEn}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold w-12 text-center">#</th>
                <th className="px-4 py-3 font-semibold">{t("staff.firstNameTh")}</th>
                <th className="px-4 py-3 font-semibold">{t("staff.department")}</th>
                <th className="px-4 py-3 font-semibold">{t("staff.adminPositionTh")}</th>
                <th className="px-4 py-3 font-semibold">{t("staff.email")}</th>
                <th className="px-4 py-3 font-semibold">{t("staff.status")}</th>
                {canManage && <th className="px-4 py-3 font-semibold text-right">{t("common.actions")}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <GraduationCap className="mx-auto h-8 w-8 opacity-40 mb-2" />
                    {t("staff.empty")}
                  </td>
                </tr>
              ) : (
                filtered.map((staff) => (
                  <tr key={staff.id} className="hover:bg-muted/30 transition-colors">
                    {/* Order Index */}
                    <td className="px-4 py-3 text-center text-muted-foreground font-mono">
                      {staff.orderIndex}
                    </td>

                    {/* Name & Avatar */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full overflow-hidden bg-muted shrink-0 border">
                          {staff.avatarUrl ? (
                            <Image src={staff.avatarUrl} alt={staff.fullNameTh} width={32} height={32} unoptimized className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center font-bold text-muted-foreground text-xs">
                              {staff.firstNameEn.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">
                            {locale === "th" ? staff.fullNameTh : staff.fullNameEn}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {locale === "th" ? staff.fullNameEn : staff.fullNameTh}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="px-4 py-3 text-muted-foreground">
                      {locale === "th" ? staff.departmentNameTh : staff.departmentNameEn}
                    </td>

                    {/* Position */}
                    <td className="px-4 py-3">
                      {staff.adminPositionTh ? (
                        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                          {locale === "th" ? staff.adminPositionTh : staff.adminPositionEn}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </td>

                    {/* Contact */}
                    <td className="px-4 py-3 text-muted-foreground">
                      <div>{staff.email}</div>
                      {staff.phoneNumber && <div className="text-[11px] text-muted-foreground/80">{staff.phoneNumber}</div>}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          staff.status === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : staff.status === "ON_LEAVE"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {t(`staff.status${staff.status.charAt(0) + staff.status.slice(1).toLowerCase()}`)}
                      </span>
                    </td>

                    {/* Actions */}
                    {canManage && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(staff)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            title={t("staff.edit")}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(staff.id)}
                            className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                            title={t("staff.delete")}
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

      {/* Create / Edit Dialog Modal */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <h2 className="text-lg font-bold text-foreground">
                {editingStaff ? t("staff.edit") : t("staff.create")}
              </h2>
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Department & Order Index */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    {t("staff.department")} *
                  </label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {locale === "th" ? d.nameTh : d.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    ลำดับการแสดงผล (Order Index)
                  </label>
                  <input
                    type="number"
                    value={formData.orderIndex}
                    onChange={(e) => setFormData({ ...formData, orderIndex: Number(e.target.value) })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Title & Name TH */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    {t("staff.academicTitleTh")} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.academicTitleTh}
                    onChange={(e) => setFormData({ ...formData, academicTitleTh: e.target.value })}
                    placeholder="เช่น ศ.ดร., ผศ."
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    {t("staff.firstNameTh")} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstNameTh}
                    onChange={(e) => setFormData({ ...formData, firstNameTh: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    {t("staff.lastNameTh")} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastNameTh}
                    onChange={(e) => setFormData({ ...formData, lastNameTh: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Title & Name EN */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    {t("staff.academicTitleEn")} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.academicTitleEn}
                    onChange={(e) => setFormData({ ...formData, academicTitleEn: e.target.value })}
                    placeholder="e.g. Prof. Dr., Asst. Prof."
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    {t("staff.firstNameEn")} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstNameEn}
                    onChange={(e) => setFormData({ ...formData, firstNameEn: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    {t("staff.lastNameEn")} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastNameEn}
                    onChange={(e) => setFormData({ ...formData, lastNameEn: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Admin Positions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    {t("staff.adminPositionTh")}
                  </label>
                  <input
                    type="text"
                    value={formData.adminPositionTh}
                    onChange={(e) => setFormData({ ...formData, adminPositionTh: e.target.value })}
                    placeholder="เช่น คณบดี, รองคณบดี"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    {t("staff.adminPositionEn")}
                  </label>
                  <input
                    type="text"
                    value={formData.adminPositionEn}
                    onChange={(e) => setFormData({ ...formData, adminPositionEn: e.target.value })}
                    placeholder="e.g. Dean, Associate Dean"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    {t("staff.email")} *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    {t("staff.phoneNumber")}
                  </label>
                  <input
                    type="text"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    {t("staff.officeRoom")}
                  </label>
                  <input
                    type="text"
                    value={formData.officeRoom}
                    onChange={(e) => setFormData({ ...formData, officeRoom: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Avatar URL & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    {t("staff.avatar")}
                  </label>
                  <input
                    type="url"
                    value={formData.avatarUrl}
                    onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    {t("staff.status")}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as "ACTIVE" | "ON_LEAVE" | "RETIRED" })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="ACTIVE">{t("staff.statusActive")}</option>
                    <option value="ON_LEAVE">{t("staff.statusOnLeave")}</option>
                    <option value="RETIRED">{t("staff.statusRetired")}</option>
                  </select>
                </div>
              </div>

              {/* Research Interests */}
              <div>
                <label className="block font-semibold text-foreground mb-1">
                  {t("staff.researchInterests")} (คั่นด้วยเครื่องหมายจุลภาค ,)
                </label>
                <input
                  type="text"
                  value={formData.researchInterestsInput}
                  onChange={(e) => setFormData({ ...formData, researchInterestsInput: e.target.value })}
                  placeholder="e.g. Artificial Intelligence, Cloud Computing, Big Data"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Short Bio TH & EN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    {t("staff.bioTh")}
                  </label>
                  <textarea
                    rows={2}
                    value={formData.bioTh}
                    onChange={(e) => setFormData({ ...formData, bioTh: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    {t("staff.bioEn")}
                  </label>
                  <textarea
                    rows={2}
                    value={formData.bioEn}
                    onChange={(e) => setFormData({ ...formData, bioEn: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={pending}
                >
                  {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={pending} className="gap-2">
                  <Check className="h-4 w-4" />
                  {t("common.save")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
