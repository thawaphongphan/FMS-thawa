"use client";

import { useState, useTransition, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Check,
  X,
  Shield,
  Key,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useLocale, useT } from "@/shared/lib/i18n/client";
import {
  validateUsersImportAction,
  executeUsersImportAction,
} from "@/features/identity/actions";
import type { ValidatedUserRow } from "@/features/identity";

interface RoleItem {
  id: string;
  code: string;
  nameTh: string;
  nameEn: string;
}

interface UserImportClientProps {
  roles: RoleItem[];
  isSuperAdmin: boolean;
}

export function UserImportClient({ roles }: UserImportClientProps) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();

  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<ValidatedUserRow[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [importResult, setImportResult] = useState<{
    successCount: number;
    failedCount: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const validRows = rows.filter((r) => r.isValid && r.roleId);
  const invalidRows = rows.filter((r) => !r.isValid || !r.roleId);

  // Download template CSV with UTF-8 BOM
  const handleDownloadTemplate = () => {
    const BOM = "\uFEFF";
    const header = "name,email,role,password";
    const sampleRows = [
      "อาจารย์สมชาย รักดี,somchai.r@faculty.local,STAFF,Passw0rd!vibe",
      "เจ้าหน้าที่สมหญิง ใจงาม,somying.j@faculty.local,VIEWER,",
      "นักวิชาการกิตติพงษ์,kittipong.k@faculty.local,STAFF,CustomPass!2026",
    ];
    const csvContent = BOM + [header, ...sampleRows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users_import_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Simple pure TS CSV Parser handling quoted fields
  const parseCsvText = (text: string) => {
    const cleanText = text.replace(/^\uFEFF/, "");
    const lines = cleanText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];

    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === "," && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headerLine = parseLine(lines[0]);
    const headers = headerLine.map((h) => h.toLowerCase().trim());

    const nameIdx = headers.findIndex(
      (h) => h === "name" || h === "fullname" || h === "ชื่อ" || h === "ชื่อ-นามสกุล"
    );
    const emailIdx = headers.findIndex(
      (h) => h === "email" || h === "อีเมล" || h === "e-mail"
    );
    const roleIdx = headers.findIndex(
      (h) => h === "role" || h === "บทบาท" || h === "รหัสบทบาท" || h === "rolecode"
    );
    const passwordIdx = headers.findIndex(
      (h) => h === "password" || h === "รหัสผ่าน" || h === "pass"
    );

    const parsedRows = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = parseLine(lines[i]);
      if (cols.length === 0 || cols.every((c) => c === "")) continue;

      const name = nameIdx !== -1 ? cols[nameIdx] || "" : cols[0] || "";
      const email = emailIdx !== -1 ? cols[emailIdx] || "" : cols[1] || "";
      const role = roleIdx !== -1 ? cols[roleIdx] || "" : cols[2] || "";
      const password = passwordIdx !== -1 ? cols[passwordIdx] || "" : cols[3] || "";

      parsedRows.push({ name, email, role, password });
    }

    return parsedRows;
  };

  const handleFileChange = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      toast.error(
        locale === "th"
          ? "กรุณาเลือกไฟล์นามสกุล .csv เท่านั้น"
          : "Please select a .csv file only"
      );
      return;
    }

    setFileName(file.name);
    setIsValidating(true);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = (e.target?.result as string) || "";
        const rawRows = parseCsvText(text);

        if (rawRows.length === 0) {
          toast.error(
            locale === "th"
              ? "ไม่พบข้อมูลในไฟล์ หรือไฟล์ไม่มีแถวข้อมูล"
              : "No valid rows found in the CSV file"
          );
          setRows([]);
          setIsValidating(false);
          return;
        }

        const res = await validateUsersImportAction(rawRows);
        if (res.ok) {
          setRows(res.data);
          const validCount = res.data.filter((r) => r.isValid).length;
          toast.success(
            locale === "th"
              ? `ตรวจสอบข้อมูลเสร็จสิ้น: พร้อมนำเข้า ${validCount} จาก ${res.data.length} รายการ`
              : `Validation completed: ${validCount} of ${res.data.length} items ready`
          );
        } else {
          toast.error(res.error.message || "Validation failed");
        }
      } catch {
        toast.error(
          locale === "th"
            ? "เกิดข้อผิดพลาดในการอ่านไฟล์"
            : "Failed to read CSV file"
        );
      } finally {
        setIsValidating(false);
      }
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleConfirmImport = () => {
    if (validRows.length === 0) {
      toast.warning(t("users.importNoValidRows"));
      return;
    }

    startTransition(async () => {
      const payload = validRows.map((r) => ({
        name: r.name,
        email: r.email,
        roleId: r.roleId!,
        password: r.password,
      }));

      const res = await executeUsersImportAction(payload);
      if (res.ok) {
        setImportResult(res.data);
        toast.success(t("users.importSuccess", { count: res.data.successCount }));
      } else {
        toast.error(res.error.message || "Import failed");
      }
    });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header with back navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Link
              href="/users"
              className="hover:text-foreground inline-flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{t("users.importBackBtn")}</span>
            </Link>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-primary" />
            {t("users.importTitle")}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("users.importSubtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownloadTemplate}
            className="gap-1.5 text-xs shadow-xs"
          >
            <Download className="h-4 w-4" />
            {t("users.downloadTemplate")}
          </Button>
        </div>
      </div>

      {/* Guidelines & Role Reference Card */}
      <div className="rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 p-4 space-y-3">
        <div className="flex items-start gap-2.5">
          <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <div className="text-xs text-blue-900 dark:text-blue-200 space-y-1">
            <div className="font-semibold">{t("users.importGuideTitle")}</div>
            <p className="leading-relaxed opacity-90">{t("users.importGuideDesc")}</p>
          </div>
        </div>
        <div className="pt-2 border-t border-blue-200/60 dark:border-blue-900/40 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-medium text-blue-900 dark:text-blue-200">
            {locale === "th" ? "รหัสบทบาทที่รองรับ:" : "Supported Role Codes:"}
          </span>
          {roles.map((r) => (
            <span
              key={r.id}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-blue-900/60 border border-blue-200 dark:border-blue-800 text-[11px] font-mono font-semibold text-blue-800 dark:text-blue-200"
            >
              {r.code}
              <span className="text-[10px] font-sans font-normal text-muted-foreground">
                ({locale === "th" ? r.nameTh : r.nameEn})
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Success Result View */}
      {importResult && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center space-y-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">
              {t("users.importSuccess", { count: importResult.successCount })}
            </h3>
            {importResult.failedCount > 0 && (
              <p className="text-xs text-rose-500 mt-1">
                {locale === "th"
                  ? `ไม่สามารถนำเข้าได้ ${importResult.failedCount} รายการ`
                  : `Failed to import ${importResult.failedCount} items`}
              </p>
            )}
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <Button
              type="button"
              onClick={() => router.push("/users")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("users.importBackBtn")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setRows([]);
                setFileName(null);
                setImportResult(null);
              }}
            >
              {locale === "th" ? "นำเข้าไฟล์ใหม่อีกครั้ง" : "Import Another File"}
            </Button>
          </div>
        </div>
      )}

      {/* File Upload Dropzone */}
      {!importResult && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="group relative cursor-pointer rounded-2xl border-2 border-dashed border-border hover:border-primary/50 bg-card hover:bg-muted/30 p-8 text-center transition-all shadow-xs"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFileChange(f);
            }}
          />
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <div className="text-sm font-semibold text-foreground">
                {fileName ? (
                  <span className="text-primary font-mono">{fileName}</span>
                ) : (
                  t("users.dropzoneTitle")
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {t("users.dropzoneHint")}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Validator Spinner */}
      {isValidating && (
        <div className="p-8 text-center text-sm text-muted-foreground animate-pulse">
          {locale === "th"
            ? "กำลังตรวจสอบข้อมูลในไฟล์ CSV กับฐานข้อมูล..."
            : "Validating CSV rows against database..."}
        </div>
      )}

      {/* Preview & Validation Table */}
      {!importResult && rows.length > 0 && !isValidating && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-foreground">
                {t("users.importPreview", {
                  valid: validRows.length,
                  total: rows.length,
                })}
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Check className="h-3 w-3" />
                {validRows.length} {t("users.importReady")}
              </span>
              {invalidRows.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <X className="h-3 w-3" />
                  {invalidRows.length} {t("users.importInvalid")}
                </span>
              )}
            </div>

            <Button
              type="button"
              disabled={validRows.length === 0 || isPending}
              onClick={handleConfirmImport}
              className="gap-2 shadow-sm"
            >
              {isPending ? (
                <span>{t("users.importProcessing")}</span>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  {t("users.importConfirmBtn", { count: validRows.length })}
                </>
              )}
            </Button>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/50 text-xs font-semibold uppercase text-muted-foreground sticky top-0 bg-card z-10">
                  <tr>
                    <th className="px-4 py-3 w-12 text-center">#</th>
                    <th className="px-4 py-3">{t("users.csvColName")}</th>
                    <th className="px-4 py-3">{t("users.csvColEmail")}</th>
                    <th className="px-4 py-3">{t("users.csvColRole")}</th>
                    <th className="px-4 py-3">{t("users.csvColPassword")}</th>
                    <th className="px-4 py-3 text-right">
                      {t("users.csvColStatus")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((row) => (
                    <tr
                      key={row.rowNumber}
                      className={`transition-colors ${
                        row.isValid
                          ? "hover:bg-muted/30"
                          : "bg-rose-500/5 hover:bg-rose-500/10"
                      }`}
                    >
                      <td className="px-4 py-3 text-center text-xs text-muted-foreground font-mono">
                        {row.rowNumber}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        {row.name || (
                          <span className="text-rose-500 italic text-xs">
                            {locale === "th" ? "(ไม่ได้ระบุชื่อ)" : "(No name)"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-foreground">
                        {row.email || (
                          <span className="text-rose-500 italic">
                            {locale === "th" ? "(ไม่ได้ระบุอีเมล)" : "(No email)"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded bg-muted font-medium">
                          {row.roleCode}
                          {row.roleNameTh && (
                            <span className="text-[11px] font-sans text-muted-foreground">
                              ({row.roleNameTh})
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {row.password ? (
                          <span className="inline-flex items-center gap-1 font-mono">
                            <Key className="h-3 w-3 text-amber-500" />
                            ••••••••
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic">
                            {locale === "th" ? "Passw0rd!vibe (เริ่มต้น)" : "Default"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {row.isValid ? (
                          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <Check className="h-3.5 w-3.5" />
                            <span>{t("users.importReady")}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span>
                              {row.errorKey
                                ? t(row.errorKey as Parameters<typeof t>[0])
                                : t("users.importInvalid")}
                            </span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
