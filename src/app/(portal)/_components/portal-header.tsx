"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  LogIn,
  LayoutDashboard,
  Menu,
  X,
  GraduationCap,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useAppSession } from "@/hooks/use-session";
import { hasPermission, P } from "@/features/identity";
import { cn } from "@/shared/lib/utils";
import type { PortalTenantInfo } from "@/shared/lib/portal-tenant";

export function PortalHeader({ tenant }: { tenant?: PortalTenantInfo | null }) {
  const pathname = usePathname();
  const t = useT();
  const locale = useLocale();
  const { theme, setTheme } = useTheme();
  const { user, roles, permissions, isSuperAdmin, isLoading } = useAppSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const canManageSettings = hasPermission({ roles, permissions, isSuperAdmin }, P.settingsManage);
  const initials = (user?.name ?? "?").trim().charAt(0).toUpperCase() || "?";

  const brandName = tenant
    ? (locale === "th" ? tenant.nameTh : tenant.nameEn)
    : t("portal.brand.name");

  const brandSubtitle = tenant
    ? (locale === "th" ? tenant.nameEn : tenant.nameTh)
    : t("portal.brand.subtitle");

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/curriculum", label: t("curriculum.nav") },
    { href: "/schedule", label: t("schedule.nav") },
    { href: "/alumni", label: t("alumni.nav") },
    { href: "/statistics", label: t("stats.nav") },
    { href: "/news", label: t("news.title") },
    { href: "/staff", label: t("staff.title") },
  ];

  return (
    <header className="sticky top-0 z-50 w-full h-16 bg-[var(--glass)] backdrop-blur-[18px] backdrop-saturate-[140%] shadow-[var(--shadow)] relative after:content-[''] after:absolute after:inset-x-0 after:bottom-0 after:h-[1px] after:bg-[var(--edge-grad-h)] after:pointer-events-none">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group text-foreground shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-[var(--r-sm)] bg-primary/10 overflow-hidden shadow-xs shrink-0 transition-transform group-hover:scale-105">
            {tenant?.logoUrl ? (
              <Image
                src={tenant.logoUrl}
                alt={brandName}
                width={36}
                height={36}
                unoptimized
                className="h-full w-full object-contain p-0.5"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground">
                <GraduationCap className="h-5 w-5" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="font-bold tracking-tight text-foreground text-sm sm:text-base leading-tight truncate">
              {brandName}
            </div>
            <div className="text-[11px] text-muted-foreground leading-tight mt-0.5 truncate max-w-[150px] sm:max-w-none">
              {brandSubtitle}
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-1.5 rounded-[var(--r-sm)] text-[0.86rem] transition-colors",
                  isActive
                    ? "bg-[var(--rose)] text-[var(--brand-ink)] font-semibold"
                    : "text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--glass-strong)]"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <LanguageSwitcher className="lang" />

          <button
            type="button"
            className="icon-btn"
            aria-label={t("nav.themeToggle")}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <svg className="sun" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="4.2" />
              <path d="M12 2v2.3M12 19.7V22M2 12h2.3M19.7 12H22M5.1 5.1l1.6 1.6M17.3 17.3l1.6 1.6M18.9 5.1l-1.6 1.6M6.7 17.3l-1.6 1.6" />
            </svg>
            <svg className="moon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20.2 14.7A8.3 8.3 0 0 1 9.3 3.8a8.5 8.5 0 1 0 10.9 10.9Z" />
            </svg>
          </button>

          {isLoading ? (
            <div aria-hidden="true" className="h-8 w-8 animate-pulse rounded-full bg-[var(--glass-strong)]" />
          ) : user ? (
            <div className="acct">
              <DropdownMenuPrimitive.Root>
                <DropdownMenuPrimitive.Trigger asChild>
                  <button type="button" className="outline-hidden">
                    <span className="who" aria-hidden="true">
                      {user.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={user.image} alt="" className="h-full w-full rounded-full object-cover" />
                      ) : (
                        initials
                      )}
                    </span>
                    <span className="nm hidden md:inline">{user.name}</span>
                    <svg className="chev" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                </DropdownMenuPrimitive.Trigger>
                <DropdownMenuPrimitive.Portal>
                  <DropdownMenuPrimitive.Content
                    className="menu-list"
                    align="end"
                    sideOffset={8}
                    style={{ position: "static" }}
                  >
                    <DropdownMenuPrimitive.Label asChild>
                      <div className="px-2.5 py-2">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuPrimitive.Label>
                    <DropdownMenuPrimitive.Separator asChild>
                      <hr />
                    </DropdownMenuPrimitive.Separator>
                    <DropdownMenuPrimitive.Item asChild>
                      <Link href="/dashboard">
                        <LayoutDashboard className="h-4 w-4" />
                        {t("nav.dashboard")}
                      </Link>
                    </DropdownMenuPrimitive.Item>
                    <DropdownMenuPrimitive.Item asChild>
                      <Link href="/me">
                        <User className="h-4 w-4" />
                        {t("account.profile")}
                      </Link>
                    </DropdownMenuPrimitive.Item>
                    {canManageSettings && (
                      <DropdownMenuPrimitive.Item asChild>
                        <Link href="/settings">
                          <Settings className="h-4 w-4" />
                          {t("nav.settings")}
                        </Link>
                      </DropdownMenuPrimitive.Item>
                    )}
                    <DropdownMenuPrimitive.Separator asChild>
                      <hr />
                    </DropdownMenuPrimitive.Separator>
                    <DropdownMenuPrimitive.Item asChild onSelect={() => signOut({ callbackUrl: "/" })}>
                      <button type="button" className="danger">
                        <LogOut className="h-4 w-4" />
                        {t("account.logout")}
                      </button>
                    </DropdownMenuPrimitive.Item>
                  </DropdownMenuPrimitive.Content>
                </DropdownMenuPrimitive.Portal>
              </DropdownMenuPrimitive.Root>
            </div>
          ) : (
            <Link href="/login" className="login-btn !h-9 !px-3.5 !text-xs !rounded-[var(--r-ctl)] gap-2">
              <LogIn className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t("auth.signIn")}</span>
            </Link>
          )}

          {/* Mobile menu button */}
          <button
            type="button"
            className="icon-btn lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={t("nav.menu")}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-b border-[var(--glass-border)] bg-[var(--glass-strong)] backdrop-blur-xl px-4 py-4 space-y-3 shadow-[var(--shadow)]">
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block px-3 py-2 rounded-[var(--r-sm)] text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[var(--rose)] text-[var(--brand-ink)] font-semibold"
                      : "text-[var(--text-2)] hover:bg-[var(--glass-hover)] hover:text-[var(--text)]"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="pt-3 border-t border-[var(--glass-border)]">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-3 py-1">
                  <div className="who" aria-hidden="true">
                    {user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.image} alt="" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text)] truncate">{user.name}</p>
                    <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
                  </div>
                </div>
                <div className="grid gap-1 pt-1">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-[var(--r-sm)] text-sm text-[var(--text-2)] hover:bg-[var(--glass-hover)] hover:text-[var(--text)]"
                  >
                    <LayoutDashboard className="h-4 w-4 text-[var(--brand-ink)]" />
                    {t("nav.dashboard")}
                  </Link>
                  <Link
                    href="/me"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-[var(--r-sm)] text-sm text-[var(--text-2)] hover:bg-[var(--glass-hover)] hover:text-[var(--text)]"
                  >
                    <User className="h-4 w-4" />
                    {t("account.profile")}
                  </Link>
                  {canManageSettings && (
                    <Link
                      href="/settings"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-[var(--r-sm)] text-sm text-[var(--text-2)] hover:bg-[var(--glass-hover)] hover:text-[var(--text)]"
                    >
                      <Settings className="h-4 w-4" />
                      {t("nav.settings")}
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-[var(--r-sm)] text-sm text-[var(--danger-ink)] hover:bg-[var(--danger-bg)] text-left w-full cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    {t("account.logout")}
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="login-btn w-full justify-center !h-10 text-sm"
              >
                <LogIn className="h-4 w-4" />
                <span>{t("auth.signIn")}</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
