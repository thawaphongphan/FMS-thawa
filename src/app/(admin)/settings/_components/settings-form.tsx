"use client";
import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Upload, X, Loader2, GraduationCap, Mail, Send, Eye, EyeOff, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiyonCard, LiyonField, PalettePicker } from "@/shared/components/liyon";
import { useT } from "@/shared/lib/i18n/client";
import type { PaletteId } from "@/shared/lib/palette";
import type { TenantSettings } from "@/features/identity";
import { updateSettingsAction, uploadLogoAction, testGmailSmtpAction } from "@/features/identity/actions";

export function SettingsForm({ initial }: { initial: TenantSettings }) {
  const t = useT();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [testRecipient, setTestRecipient] = useState("");
  const hasExistingPass = Boolean(initial.smtp?.pass);

  const [form, setForm] = useState({
    nameTh: initial.nameTh,
    nameEn: initial.nameEn,
    logoUrl: initial.logoUrl ?? "",
    palette: initial.palette as PaletteId,
    smtp: {
      enabled: initial.smtp?.enabled ?? false,
      user: initial.smtp?.user ?? "",
      pass: "",
      fromName: initial.smtp?.fromName ?? "",
    },
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, start] = useTransition();

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast.error(t("settings.invalidFileType"));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("settings.fileTooLarge"));
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const res = await uploadLogoAction(formData);
      if (!res.ok) {
        if (res.error.message === "invalid_file_type") {
          toast.error(t("settings.invalidFileType"));
        } else if (res.error.message === "file_too_large") {
          toast.error(t("settings.fileTooLarge"));
        } else {
          toast.error(t(`error.${res.error.code}`));
        }
        return;
      }
      setForm((prev) => ({ ...prev, logoUrl: res.data.url }));
      toast.success(t("settings.uploadSuccess"));
    } catch {
      toast.error(t("error.internal"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function save() {
    start(async () => {
      const r = await updateSettingsAction(form);
      if (!r.ok) { setErrors(r.error.fieldErrors ?? {}); if (!r.error.fieldErrors) toast.error(t(`error.${r.error.code}`)); return; }
      setErrors({});
      toast.success(t("settings.saveOk"));
      router.refresh();
    });
  }

  async function handleTestEmail() {
    if (!form.smtp.user || (!form.smtp.pass && !hasExistingPass)) {
      toast.error(t("settings.smtpTestMissing"));
      return;
    }
    if (!testRecipient) {
      toast.error(t("settings.smtpTestMissing"));
      return;
    }
    setTestingSmtp(true);
    try {
      const res = await testGmailSmtpAction({
        user: form.smtp.user,
        pass: form.smtp.pass || initial.smtp?.pass,
        fromName: form.smtp.fromName || undefined,
        recipientEmail: testRecipient,
      });
      if (!res.ok) {
        toast.error(`${t("settings.smtpTestFail")}: ${res.error.message}`);
        return;
      }
      toast.success(t("settings.smtpTestSuccess"));
    } catch {
      toast.error(t("settings.smtpTestFail"));
    } finally {
      setTestingSmtp(false);
    }
  }

  return (
    <>
      <header className="ph"><h1>{t("settings.title")}</h1></header>
      <div className="set-cards">
        <LiyonCard>
          <h2>{t("settings.orgTitle")}</h2>
          <div className="fields">
            <LiyonField label={t("settings.nameTh")} htmlFor="s-name-th" error={errors.nameTh?.[0]}><input id="s-name-th" value={form.nameTh} onChange={(e) => setForm({ ...form, nameTh: e.target.value })} /></LiyonField>
            <LiyonField label={t("settings.nameEn")} htmlFor="s-name-en" error={errors.nameEn?.[0]}><input id="s-name-en" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} /></LiyonField>
            <LiyonField label={t("settings.logoUrl")} htmlFor="s-logo" hint={t("common.optional")} error={errors.logoUrl?.[0]}>
              <div className="space-y-3">
                <div className="logo-up">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 overflow-hidden shadow-sm border border-primary/20 shrink-0">
                    {form.logoUrl ? (
                      <Image
                        src={form.logoUrl}
                        alt="Logo"
                        width={64}
                        height={64}
                        unoptimized
                        className="h-full w-full object-contain p-1"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground">
                        <GraduationCap className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="gap-1.5"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>{t("settings.uploading")}</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          <span>{t("settings.uploadLogo")}</span>
                        </>
                      )}
                    </Button>
                    {form.logoUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setForm({ ...form, logoUrl: "" })}
                        className="text-muted-foreground hover:text-destructive gap-1"
                      >
                        <X className="h-4 w-4" />
                        <span>{t("settings.removeLogo")}</span>
                      </Button>
                    )}
                  </div>
                </div>
                <input
                  id="s-logo"
                  type="text"
                  placeholder="https://... หรือ /uploads/..."
                  value={form.logoUrl}
                  onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  {t("settings.uploadHint")}
                </p>

                {/* Live Brand Preview matching front page header */}
                <div className="rounded-xl border border-border/60 bg-muted/30 p-3 space-y-2 mt-2">
                  <span className="text-xs font-medium text-muted-foreground block">
                    {t("settings.previewBrand")}
                  </span>
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-background/90 border border-border/40 shadow-xs max-w-md">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 overflow-hidden shadow-sm shrink-0">
                      {form.logoUrl ? (
                        <Image
                          src={form.logoUrl}
                          alt={form.nameTh || "Logo"}
                          width={40}
                          height={40}
                          unoptimized
                          className="h-full w-full object-contain p-0.5"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground">
                          <GraduationCap className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold tracking-tight text-foreground text-sm leading-tight truncate">
                        {form.nameTh || t("portal.brand.name")}
                      </div>
                      <div className="text-[11px] text-muted-foreground leading-tight mt-0.5 truncate">
                        {form.nameEn || t("portal.brand.subtitle")}
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {t("settings.logoDefaultHint")}
                  </p>
                </div>
              </div>
            </LiyonField>
          </div>
        </LiyonCard>
        <LiyonCard>
          <h2>{t("settings.brandTitle")}</h2>
          <p>{t("settings.brandDesc")}</p>
          <PalettePicker value={form.palette} onChange={(p) => setForm({ ...form, palette: p })} label={t("settings.paletteLabel")} />
          {form.palette === "coral" && <p className="warn" role="note">{t("settings.coralWarn")}</p>}
        </LiyonCard>

        {/* Gmail SMTP Configuration Card */}
        <LiyonCard>
          <div className="flex items-center gap-2 mb-1">
            <Mail className="h-5 w-5 text-primary" />
            <h2 className="mb-0">{t("settings.smtpTitle")}</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">{t("settings.smtpDesc")}</p>

          <div className="space-y-4">
            {/* Enable/Disable switch */}
            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-border/80 bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.smtp.enabled}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    smtp: { ...prev.smtp, enabled: e.target.checked },
                  }))
                }
                className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary shrink-0"
              />
              <div className="min-w-0">
                <span className="text-sm font-semibold text-foreground block">
                  {t("settings.smtpEnable")}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t("settings.smtpDesc")}
                </span>
              </div>
            </label>

            {form.smtp.enabled && (
              <div className="fields space-y-4 pt-1">
                <LiyonField
                  label={t("settings.smtpUser")}
                  htmlFor="s-smtp-user"
                  error={errors["smtp.user"]?.[0]}
                >
                  <input
                    id="s-smtp-user"
                    type="email"
                    placeholder={t("settings.smtpUserPh")}
                    value={form.smtp.user}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        smtp: { ...prev.smtp, user: e.target.value },
                      }))
                    }
                  />
                </LiyonField>

                <LiyonField
                  label={t("settings.smtpPass")}
                  htmlFor="s-smtp-pass"
                  hint={hasExistingPass && !form.smtp.pass ? t("settings.smtpPassKeep") : undefined}
                  error={errors["smtp.pass"]?.[0]}
                >
                  <div className="space-y-1.5">
                    <div className="relative flex items-center">
                      <input
                        id="s-smtp-pass"
                        type={showPassword ? "text" : "password"}
                        placeholder={hasExistingPass ? "••••••••••••••••" : t("settings.smtpPassPh")}
                        value={form.smtp.pass}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            smtp: { ...prev.smtp, pass: e.target.value },
                          }))
                        }
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <div className="flex items-start gap-1.5 text-xs text-muted-foreground bg-primary/5 p-2.5 rounded-lg border border-primary/10">
                      <span className="leading-relaxed">
                        {t("settings.smtpPassHelp")}{" "}
                        <a
                          href="https://myaccount.google.com/apppasswords"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 text-primary underline font-medium hover:opacity-80"
                        >
                          Google App Passwords
                          <ExternalLink className="h-3 w-3 inline" />
                        </a>
                      </span>
                    </div>
                  </div>
                </LiyonField>

                <LiyonField
                  label={t("settings.smtpFromName")}
                  htmlFor="s-smtp-from-name"
                  hint={t("common.optional")}
                  error={errors["smtp.fromName"]?.[0]}
                >
                  <input
                    id="s-smtp-from-name"
                    type="text"
                    placeholder={t("settings.smtpFromNamePh")}
                    value={form.smtp.fromName}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        smtp: { ...prev.smtp, fromName: e.target.value },
                      }))
                    }
                  />
                </LiyonField>

                {/* Test Connection Box */}
                <div className="rounded-xl border border-border/70 bg-muted/30 p-4 space-y-3 mt-4">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      <Send className="h-3.5 w-3.5 text-primary" />
                      {t("settings.smtpTestTitle")}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t("settings.smtpTestDesc")}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="email"
                      placeholder={t("settings.smtpTestRecipient")}
                      value={testRecipient}
                      onChange={(e) => setTestRecipient(e.target.value)}
                      className="flex-1 text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={testingSmtp}
                      onClick={handleTestEmail}
                      className="gap-1.5 shrink-0"
                    >
                      {testingSmtp ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>{t("settings.smtpTesting")}</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" />
                          <span>{t("settings.smtpTestBtn")}</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </LiyonCard>

        <div className="savebar"><Button type="button" onClick={save} disabled={pending}>{t("common.save")}</Button></div>
      </div>
    </>
  );
}
