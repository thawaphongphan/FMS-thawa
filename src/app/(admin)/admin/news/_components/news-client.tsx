"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Pin, Search, Newspaper, Check, X, Sparkles, Loader2 } from "lucide-react";
import { useLocale, useT } from "@/shared/lib/i18n/client";
import { formatDate } from "@/shared/lib/format";
import type { ArticleDto, ArticleCategoryDto } from "@/features/news";
import {
  createArticleAction,
  updateArticleAction,
  deleteArticleAction,
  translateNewsWithAiAction,
} from "@/features/news/actions";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

interface NewsClientProps {
  initialArticles: ArticleDto[];
  categories: ArticleCategoryDto[];
  canManage: boolean;
}

export function NewsClient({ initialArticles, categories, canManage }: NewsClientProps) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [articles, setArticles] = useState<ArticleDto[]>(initialArticles);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ArticleDto | null>(null);
  const [translating, setTranslating] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    titleTh: "",
    titleEn: "",
    slug: "",
    categoryId: categories[0]?.id ?? "",
    summaryTh: "",
    summaryEn: "",
    contentTh: "",
    contentEn: "",
    coverImageUrl: "",
    status: "PUBLISHED" as "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED",
    pinned: false,
  });

  const openCreateDialog = () => {
    setEditingArticle(null);
    setFormData({
      titleTh: "",
      titleEn: "",
      slug: "",
      categoryId: categories[0]?.id ?? "",
      summaryTh: "",
      summaryEn: "",
      contentTh: "",
      contentEn: "",
      coverImageUrl: "",
      status: "PUBLISHED",
      pinned: false,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (article: ArticleDto) => {
    setEditingArticle(article);
    setFormData({
      titleTh: article.titleTh,
      titleEn: article.titleEn,
      slug: article.slug,
      categoryId: article.categoryId,
      summaryTh: article.summaryTh ?? "",
      summaryEn: article.summaryEn ?? "",
      contentTh: article.contentTh,
      contentEn: article.contentEn,
      coverImageUrl: article.coverImageUrl ?? "",
      status: article.status,
      pinned: article.pinned,
    });
    setDialogOpen(true);
  };

  const handleAiTranslate = async () => {
    const cleanContentTh = formData.contentTh.replace(/<[^>]*>/g, "").trim();
    if (!formData.titleTh.trim() || !cleanContentTh) {
      toast.error(t("news.aiTranslateRequireThai"));
      return;
    }

    setTranslating(true);
    try {
      const res = await translateNewsWithAiAction({
        titleTh: formData.titleTh,
        summaryTh: formData.summaryTh.trim() || undefined,
        contentTh: formData.contentTh,
      });

      if (res.ok) {
        setFormData((prev) => ({
          ...prev,
          titleEn: res.data.titleEn,
          summaryEn: res.data.summaryEn,
          contentEn: res.data.contentEn,
          slug: res.data.slug || prev.slug,
        }));
        toast.success(t("news.aiTranslateSuccess"));
      } else {
        if (res.error.message === "gemini_not_configured") {
          toast.error(t("news.aiTranslateNoApiKey"));
        } else {
          toast.error(res.error.message || t("news.aiTranslateFailed"));
        }
      }
    } catch {
      toast.error(t("news.aiTranslateFailed"));
    } finally {
      setTranslating(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanContentTh = formData.contentTh.replace(/<[^>]*>/g, "").trim();
    if (!formData.titleTh || !formData.titleEn || !formData.slug || !cleanContentTh) {
      toast.error(t("common.requiredFields"));
      return;
    }

    startTransition(async () => {
      if (editingArticle) {
        const res = await updateArticleAction({
          id: editingArticle.id,
          ...formData,
        });
        if (res.ok) {
          toast.success(t("news.saveSuccess"));
          setDialogOpen(false);
          router.refresh();
        } else {
          toast.error(res.error.message);
        }
      } else {
        const res = await createArticleAction(formData);
        if (res.ok) {
          toast.success(t("news.saveSuccess"));
          setDialogOpen(false);
          router.refresh();
        } else {
          toast.error(res.error.message);
        }
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("news.deleteConfirm"))) return;
    startTransition(async () => {
      const res = await deleteArticleAction(id);
      if (res.ok) {
        toast.success(t("news.deleteSuccess"));
        setArticles((prev) => prev.filter((a) => a.id !== id));
        router.refresh();
      } else {
        toast.error(res.error.message);
      }
    });
  };

  const handleTogglePin = async (article: ArticleDto) => {
    startTransition(async () => {
      const res = await updateArticleAction({
        id: article.id,
        titleTh: article.titleTh,
        titleEn: article.titleEn,
        slug: article.slug,
        categoryId: article.categoryId,
        summaryTh: article.summaryTh,
        summaryEn: article.summaryEn,
        contentTh: article.contentTh,
        contentEn: article.contentEn,
        coverImageUrl: article.coverImageUrl,
        status: article.status,
        pinned: !article.pinned,
      });
      if (res.ok) {
        toast.success(locale === "th" ? "ปรับสถานะการปักหมุดแล้ว" : "Pin status updated");
        router.refresh();
      } else {
        toast.error(res.error.message);
      }
    });
  };

  // Filter articles
  const filtered = (articles.length ? articles : initialArticles).filter((a) => {
    const matchesSearch =
      a.titleTh.toLowerCase().includes(search.toLowerCase()) ||
      a.titleEn.toLowerCase().includes(search.toLowerCase()) ||
      a.slug.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            {t("news.adminTitle")}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {t("news.adminSubtitle")}
          </p>
        </div>
        {canManage && (
          <Button onClick={openCreateDialog} className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            {t("news.create")}
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
            placeholder={t("news.searchPlaceholder")}
            className="w-full rounded-lg border border-input bg-background pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {["ALL", "PUBLISHED", "DRAFT", "ARCHIVED"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === st
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {st === "ALL" ? t("common.all") : t(`news.status${st.charAt(0) + st.slice(1).toLowerCase()}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold w-16 text-center">Pin</th>
                <th className="px-4 py-3 font-semibold">{t("news.titleTh")}</th>
                <th className="px-4 py-3 font-semibold">{t("news.category")}</th>
                <th className="px-4 py-3 font-semibold">{t("news.status")}</th>
                <th className="px-4 py-3 font-semibold text-center">{t("news.viewCount")}</th>
                <th className="px-4 py-3 font-semibold">{t("news.publishedAt")}</th>
                {canManage && <th className="px-4 py-3 font-semibold text-right">{t("common.actions")}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <Newspaper className="mx-auto h-8 w-8 opacity-40 mb-2" />
                    {t("news.empty")}
                  </td>
                </tr>
              ) : (
                filtered.map((article) => (
                  <tr key={article.id} className="hover:bg-muted/30 transition-colors">
                    {/* Pin button */}
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleTogglePin(article)}
                        disabled={pending || !canManage}
                        className={`p-1.5 rounded-md transition-colors ${
                          article.pinned
                            ? "text-primary hover:bg-primary/10"
                            : "text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted"
                        }`}
                        title={article.pinned ? "Unpin" : "Pin"}
                      >
                        <Pin className="h-4 w-4" />
                      </button>
                    </td>

                    {/* Title & Slug */}
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground line-clamp-1">
                        {locale === "th" ? article.titleTh : article.titleEn}
                      </div>
                      <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                        /{article.slug}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-foreground">
                        {locale === "th" ? article.categoryNameTh : article.categoryNameEn}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          article.status === "PUBLISHED"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : article.status === "DRAFT"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {t(`news.status${article.status.charAt(0) + article.status.slice(1).toLowerCase()}`)}
                      </span>
                    </td>

                    {/* View Count */}
                    <td className="px-4 py-3 text-center font-mono">
                      {article.viewCount}
                    </td>

                    {/* Published Date */}
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(article.publishedAt, locale)}
                    </td>

                    {/* Actions */}
                    {canManage && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(article)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            title={t("news.edit")}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(article.id)}
                            className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                            title={t("news.delete")}
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
          <div className="w-full max-w-4xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <h2 className="text-lg font-bold text-foreground">
                {editingArticle ? t("news.edit") : t("news.create")}
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
              {/* Gemini AI Assistant Banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl bg-primary/5 border border-primary/20 p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-primary shrink-0" />
                  <span>
                    {locale === "th"
                      ? "กรอกหัวข้อและเนื้อหาภาษาไทย แล้วกดปุ่มเพื่อให้ Gemini AI แปลเป็นภาษาอังกฤษให้อัตโนมัติ"
                      : "Fill in Thai title & content, then click to auto-translate into English using Gemini AI"}
                  </span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAiTranslate}
                  disabled={translating || pending}
                  className="h-8 gap-1.5 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary shrink-0 font-medium cursor-pointer"
                >
                  {translating ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>{t("news.aiTranslating")}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      <span>{t("news.aiTranslate")}</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Title TH */}
              <div>
                <label className="block font-semibold text-foreground mb-1">
                  {t("news.titleTh")} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.titleTh}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      titleTh: e.target.value,
                      slug: formData.slug || e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-"),
                    });
                  }}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Title EN */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-foreground">
                    {t("news.titleEn")} *
                  </label>
                  <button
                    type="button"
                    onClick={handleAiTranslate}
                    disabled={translating || pending}
                    className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline disabled:opacity-50 cursor-pointer"
                  >
                    <Sparkles className="h-3 w-3" />
                    {translating ? t("news.aiTranslating") : t("news.aiTranslate")}
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={formData.titleEn}
                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Slug & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    {t("news.slug")} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    {t("news.category")} *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {locale === "th" ? c.nameTh : c.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cover Image & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    {t("news.coverImage")}
                  </label>
                  <input
                    type="url"
                    value={formData.coverImageUrl}
                    onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    {t("news.status")}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED" })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="PUBLISHED">{t("news.statusPublished")}</option>
                    <option value="DRAFT">{t("news.statusDraft")}</option>
                    <option value="SCHEDULED">{t("news.statusScheduled")}</option>
                    <option value="ARCHIVED">{t("news.statusArchived")}</option>
                  </select>
                </div>
              </div>

              {/* Pinned toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pinned"
                  checked={formData.pinned}
                  onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
                  className="h-4 w-4 rounded border-input text-primary focus:ring-primary/20"
                />
                <label htmlFor="pinned" className="font-semibold text-foreground cursor-pointer">
                  {t("news.pinned")} ({locale === "th" ? "แสดงบนสุดของหน้าแรก" : "Highlight on top of portal"})
                </label>
              </div>

              {/* Summary TH */}
              <div>
                <label className="block font-semibold text-foreground mb-1">
                  {t("news.summaryTh")}
                </label>
                <textarea
                  rows={2}
                  value={formData.summaryTh}
                  onChange={(e) => setFormData({ ...formData, summaryTh: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Summary EN */}
              <div>
                <label className="block font-semibold text-foreground mb-1">
                  {t("news.summaryEn")}
                </label>
                <textarea
                  rows={2}
                  value={formData.summaryEn}
                  onChange={(e) => setFormData({ ...formData, summaryEn: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Content TH (TinyMCE Rich Text Editor) */}
              <div>
                <label className="block font-semibold text-foreground mb-1">
                  {t("news.contentTh")} *
                </label>
                <RichTextEditor
                  value={formData.contentTh}
                  onChange={(val) => setFormData((prev) => ({ ...prev, contentTh: val }))}
                  placeholder={
                    locale === "th"
                      ? "พิมพ์เนื้อหาข่าว จัดรูปแบบข้อความ แทรกรูปภาพ หรือตารางได้ที่นี่..."
                      : "Enter article content, format typography, insert images or tables..."
                  }
                  height={380}
                />
              </div>

              {/* Content EN */}
              <div>
                <label className="block font-semibold text-foreground mb-1">
                  {t("news.contentEn")} *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.contentEn}
                  onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
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
