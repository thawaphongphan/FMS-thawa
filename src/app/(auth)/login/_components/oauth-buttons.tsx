"use client";
import * as React from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { useT } from "@/shared/lib/i18n/client";
import {
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonDialogCloseButton,
} from "@/shared/components/liyon";
import type { OAuthProviderId, OAuthProviderItem } from "@/features/identity";

const PROVIDER_ID = { google: "google", microsoft: "microsoft-entra-id", line: "line" } as const;

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" className="shrink-0" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
      />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 21 21" width="18" height="18" className="shrink-0" aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" fill="#f25022" />
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
      <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
    </svg>
  );
}

function LineIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" className="shrink-0" aria-hidden="true">
      <path
        fill="#06C755"
        d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.019 9.577.39.084.922.258 1.057.592.121.302.079.775.039 1.08l-.17 1.026c-.052.312-.246 1.22.846.665 1.09-.554 5.889-3.468 8.038-5.937C22.684 14.887 24 12.723 24 10.304Z"
      />
      <path
        fill="#FFFFFF"
        d="M6.865 13.06h-1.63a.476.476 0 0 1-.476-.475V8.583c0-.263.213-.475.476-.475h.682c.263 0 .476.212.476.475v3.526h.472c.263 0 .476.213.476.476v.475zm2.846 0h-.682a.476.476 0 0 1-.475-.475V8.583c0-.263.212-.475.475-.475h.682c.263 0 .476.212.476.475v4.002a.476.476 0 0 1-.476.475zm4.847 0h-.705a.477.477 0 0 1-.41-.234l-2.074-2.825v2.584c0 .263-.213.475-.476.475h-.682a.476.476 0 0 1-.475-.475V8.583c0-.263.212-.475.475-.475h.706c.164 0 .317.085.41.234l2.074 2.825V8.583c0-.263.212-.475.476-.475h.681c.263 0 .476.212.476.475v4.002a.476.476 0 0 1-.475.475zm3.83-3.051h-1.428v.809h1.428c.263 0 .476.213.476.476v.475a.476.476 0 0 1-.476.476h-2.11a.476.476 0 0 1-.475-.475V8.583c0-.263.212-.475.475-.475h2.11c.263 0 .476.212.476.475v.476a.476.476 0 0 1-.476.475h-1.428v.794h1.428c.263 0 .476.213.476.476v.475a.476.476 0 0 1-.476.476z"
      />
    </svg>
  );
}

export function OAuthButtons({
  providers,
}: {
  providers: (OAuthProviderId | OAuthProviderItem)[];
}) {
  const t = useT();
  const [modalProvider, setModalProvider] = React.useState<OAuthProviderId | null>(null);
  const [email, setEmail] = React.useState("");
  const [name, setName] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSignIn = (p: OAuthProviderId | OAuthProviderItem) => {
    const item: OAuthProviderItem = typeof p === "string" ? { id: p, configured: true } : p;
    if (item.configured) {
      signIn(PROVIDER_ID[item.id], { callbackUrl: "/dashboard" });
      return;
    }
    const defaultEmail = item.id === "line" ? "user@line.me" : "user@gmail.com";
    const defaultName = item.id === "line" ? "LINE User" : "Google User";
    setEmail(defaultEmail);
    setName(defaultName);
    setModalProvider(item.id);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalProvider) return;
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        simProvider: modalProvider,
        email,
        name,
        redirect: false,
      });
      if (res?.error) {
        toast.error(t("auth.errorRetry"));
        setLoading(false);
        return;
      }
      toast.success(t("auth.signInSuccess"));
      window.location.href = "/dashboard";
    } catch {
      toast.error(t("auth.errorRetry"));
      setLoading(false);
    }
  };

  return (
    <>
      <div className="oauth">
        {providers.map((p) => {
          const id = typeof p === "string" ? p : p.id;
          return (
            <button
              key={id}
              type="button"
              className="btn-oauth cursor-pointer"
              onClick={() => handleSignIn(p)}
            >
              {id === "google" && <GoogleIcon />}
              {id === "microsoft" && <MicrosoftIcon />}
              {id === "line" && <LineIcon />}
              <span>{t(`auth.provider.${id}`)}</span>
            </button>
          );
        })}
      </div>

      <LiyonDialog open={!!modalProvider} onOpenChange={(open) => !open && setModalProvider(null)}>
        {modalProvider && (
          <>
            <LiyonDialogCloseButton label={t("auth.simModal.cancel")} />
            <LiyonDialogHeader
              title={t(`auth.simModal.title.${modalProvider}`)}
              description={t("auth.simModal.desc")}
            />
            <form onSubmit={handleModalSubmit}>
              <LiyonDialogBody className="space-y-4 pt-2">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="sim-email" className="text-xs font-semibold text-text-muted">
                    {t("auth.simModal.email")}
                  </label>
                  <input
                    id="sim-email"
                    type="email"
                    className="w-full h-10 px-3 rounded-lg border border-glass-border bg-glass text-sm text-text focus:outline-none focus:border-brand"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="sim-name" className="text-xs font-semibold text-text-muted">
                    {t("auth.simModal.name")}
                  </label>
                  <input
                    id="sim-name"
                    type="text"
                    className="w-full h-10 px-3 rounded-lg border border-glass-border bg-glass text-sm text-text focus:outline-none focus:border-brand"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </LiyonDialogBody>
              <LiyonDialogFooter className="mt-6 flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-glass-border hover:bg-glass text-text-2 cursor-pointer"
                  onClick={() => setModalProvider(null)}
                >
                  {t("auth.simModal.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-brand text-on-brand hover:opacity-90 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {modalProvider === "google" && <GoogleIcon />}
                  {modalProvider === "line" && <LineIcon />}
                  <span>{loading ? t("auth.signingIn") : t("auth.simModal.submit")}</span>
                </button>
              </LiyonDialogFooter>
            </form>
          </>
        )}
      </LiyonDialog>
    </>
  );
}
