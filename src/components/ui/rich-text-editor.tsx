"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { Loader2 } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
  disabled?: boolean;
}

const TinyEditor = dynamic(
  () => import("@tinymce/tinymce-react").then((mod) => mod.Editor),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[360px] w-full items-center justify-center rounded-lg border border-input bg-muted/20 text-muted-foreground">
        <div className="flex items-center gap-2 text-xs">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>กำลังโหลดตัวแก้ไขข้อความ (TinyMCE)...</span>
        </div>
      </div>
    ),
  }
);

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  height = 360,
  disabled = false,
}: RichTextEditorProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="rich-text-editor-container overflow-hidden rounded-lg border border-input shadow-xs">
      <TinyEditor
        tinymceScriptSrc="https://cdn.jsdelivr.net/npm/tinymce@7/tinymce.min.js"
        licenseKey="gpl"
        value={value}
        onEditorChange={(newContent) => onChange(newContent)}
        disabled={disabled}
        init={{
          height,
          menubar: false,
          placeholder,
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "wordcount",
          ],
          toolbar:
            "undo redo | blocks | bold italic underline strikethrough | " +
            "forecolor backcolor | alignleft aligncenter alignright alignjustify | " +
            "bullist numlist | outdent indent | table link image media | " +
            "code fullscreen preview",
          skin: isDark ? "oxide-dark" : "oxide",
          content_css: isDark ? "dark" : "default",
          content_style: `
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans Thai', sans-serif;
              font-size: 14px;
              line-height: 1.6;
              margin: 12px;
            }
            img { max-width: 100%; height: auto; border-radius: 8px; }
            table { width: 100%; border-collapse: collapse; }
            table td, table th { border: 1px solid #ddd; padding: 8px; }
          `,
          branding: false,
          promotion: false,
        }}
      />
    </div>
  );
}
