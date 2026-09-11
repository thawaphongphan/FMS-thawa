"use client";
import { LiyonDialog, LiyonDialogHeader, LiyonDialogFooter, LiyonDialogCloseButton, LiyonDialogBody } from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import { useT } from "@/shared/lib/i18n/client";
import type { UserListItem } from "./types";

export function DeleteUserDialog({
  open,
  onOpenChange,
  users,
  isSubmitting,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  users: UserListItem[];
  isSubmitting: boolean;
  onConfirm: () => void;
}) {
  const t = useT();
  const description =
    users.length > 1
      ? t("users.deleteDescMultiple", { count: users.length })
      : t("users.deleteDesc", { name: users[0]?.name ?? "" });

  return (
    <LiyonDialog open={open} onOpenChange={onOpenChange} danger>
      <LiyonDialogCloseButton label={t("common.close")} />
      <LiyonDialogHeader title={t("users.deleteTitle")} description={description} />
      <LiyonDialogBody>
        <p className="text-sm text-destructive font-medium">{t("users.deleteWarning")}</p>
      </LiyonDialogBody>
      <LiyonDialogFooter>
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
        <Button type="button" variant="destructive" disabled={isSubmitting} onClick={onConfirm}>{t("common.confirm")}</Button>
      </LiyonDialogFooter>
    </LiyonDialog>
  );
}
