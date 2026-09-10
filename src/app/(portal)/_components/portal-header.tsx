"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Sun, Moon, LogIn, LayoutDashboard, Menu, X, GraduationCap } from "lucide-react";
import { useState } from "react";
import { useLocale, useT } from "@/shared/lib/i18n/client";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useAppSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";

export function PortalHeader() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useT();
  const { theme, setTheme } = useTheme();
  const { user } = useAppSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/", label: locale === "th" ? "หน้าแรก" : "Home" },
    { href: "/curriculum", label: t("curriculum.nav") },
    { href: "/schedule", label: t("schedule.nav") },
    { href: "/alumni", label: t("alumni.nav") },
    { href: "/statistics", label: t("stats.nav") },
    { href: "/news", label: t("news.title") },
    { href: "/staff", label: t("staff.title") },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <div className="font-bold tracking-tight text-foreground text-sm sm:text-base">
              {locale === "th" ? "คณะวิทยาการสารสนเทศ" : "Faculty of Informatics"}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {locale === "th" ? "Faculty Web Platform" : "Academic & Research Excellence"}
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle Theme"
            className="text-muted-foreground"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {user ? (
            <Link href="/dashboard">
              <Button size="sm" className="gap-2 shadow-sm">
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">{locale === "th" ? "แผงควบคุม" : "Dashboard"}</span>
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button size="sm" variant="outline" className="gap-2">
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">{locale === "th" ? "เข้าสู่ระบบ" : "Sign In"}</span>
              </Button>
            </Link>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-b border-border bg-background px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-accent"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
