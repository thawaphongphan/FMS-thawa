import Link from "next/link";
import Image from "next/image";
import {
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Clock,
  Lock,
  ArrowRight,
  ChevronRight,
  Globe,
  ExternalLink,
} from "lucide-react";
import { getLocale, getT } from "@/i18n/server";
import type { PortalTenantInfo } from "@/shared/lib/portal-tenant";

export async function PortalFooter({ tenant }: { tenant?: PortalTenantInfo | null }) {
  const locale = await getLocale();
  const t = await getT();

  const brandName = tenant
    ? (locale === "th" ? tenant.nameTh : tenant.nameEn)
    : t("portal.brand.name");

  const brandSubtitle = tenant
    ? (locale === "th" ? tenant.nameEn : tenant.nameTh)
    : t("portal.brand.subtitle");

  const quickLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/curriculum", label: t("curriculum.nav") },
    { href: "/schedule", label: t("schedule.nav") },
    { href: "/alumni", label: t("alumni.nav") },
    { href: "/statistics", label: t("stats.nav") },
    { href: "/news", label: t("news.title") },
    { href: "/staff", label: t("staff.title") },
  ];

  return (
    <footer className="mt-20 relative bg-[var(--ink-band)] text-[var(--ink-band-text)] overflow-hidden after:content-[''] after:absolute after:inset-x-0 after:top-0 after:h-[1px] after:bg-[var(--edge-grad-h)] after:pointer-events-none">
      {/* Ambient background glow matching tenant palette */}
      <div
        aria-hidden="true"
        className="absolute top-0 right-1/4 -translate-y-1/2 w-96 h-96 bg-[var(--brand-glow)] rounded-full blur-3xl opacity-20 pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-10 translate-y-1/2 w-80 h-80 bg-[var(--brand2-glow)] rounded-full blur-3xl opacity-15 pointer-events-none"
      />

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          {/* Col 1: Faculty / Tenant Info (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[var(--r-md)] bg-[var(--brand)] text-[var(--on-brand)] shadow-md overflow-hidden shrink-0">
                {tenant?.logoUrl ? (
                  <Image
                    src={tenant.logoUrl}
                    alt={brandName}
                    width={40}
                    height={40}
                    unoptimized
                    className="h-full w-full object-contain p-1"
                  />
                ) : (
                  <GraduationCap className="h-6 w-6" />
                )}
              </div>
              <div className="min-w-0">
                <span className="block font-bold text-base sm:text-lg text-[var(--ink-band-text)] leading-snug tracking-tight truncate">
                  {brandName}
                </span>
                <span className="block text-xs text-[var(--ink-band-muted)] leading-tight mt-0.5 truncate">
                  {brandSubtitle}
                </span>
              </div>
            </div>

            <p className="text-sm text-[var(--ink-band-muted)] leading-relaxed max-w-md">
              {t("portal.footer.tagline")}
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-[var(--ink-band-muted)]">
              <span>✨</span>
              <span>{locale === "th" ? "สถาบันการศึกษาชั้นนำด้านดิจิทัลและปัญญาประดิษฐ์" : "Excellence in Digital Innovation & AI"}</span>
            </div>
          </div>

          {/* Col 2: Quick Links (3 cols) */}
          <div className="md:col-span-3">
            <h3 className="font-semibold text-xs tracking-wider uppercase text-[var(--ink-band-text)] mb-4 flex items-center gap-2 opacity-90">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand)] inline-block" />
              {t("portal.footer.quickLinks")}
            </h3>
            <ul className="space-y-2.5 text-sm text-[var(--ink-band-muted)]">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-1 hover:text-[var(--ink-band-text)] hover:translate-x-1 transition-all group"
                  >
                    <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--brand-light)] -ml-3 group-hover:ml-0" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Contact & Access (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            <h3 className="font-semibold text-xs tracking-wider uppercase text-[var(--ink-band-text)] mb-4 flex items-center gap-2 opacity-90">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand2)] inline-block" />
              {t("portal.footer.contact")}
            </h3>
            {(() => {
              const contact = tenant?.contact;
              const address = locale === "th"
                ? (contact?.addressTh || t("portal.footer.address"))
                : (contact?.addressEn || contact?.addressTh || t("portal.footer.address"));
              const phone = contact?.phone || "02-123-4500";
              const email = contact?.email || "contact@informatics.university.ac.th";
              const hours = locale === "th"
                ? (contact?.hoursTh || t("portal.footer.hours"))
                : (contact?.hoursEn || contact?.hoursTh || t("portal.footer.hours"));

              return (
                <>
                  <ul className="space-y-3 text-sm text-[var(--ink-band-muted)]">
                    <li className="flex items-start gap-2.5">
                      <MapPin className="h-4 w-4 mt-0.5 text-[var(--brand-light)] shrink-0" />
                      <div className="leading-relaxed">
                        <span>{address}</span>
                        {contact?.mapsUrl && (
                          <a
                            href={contact.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-xs text-[var(--brand-light)] hover:underline mt-1 inline-flex items-center gap-1"
                          >
                            <span>{t("portal.footer.openMap")}</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Phone className="h-4 w-4 text-[var(--brand-light)] shrink-0" />
                      <a href={`tel:${phone.replace(/[^0-9+]/g, "")}`} className="hover:text-[var(--ink-band-text)] transition-colors">
                        {phone}
                      </a>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Mail className="h-4 w-4 text-[var(--brand-light)] shrink-0" />
                      <a href={`mailto:${email}`} className="truncate hover:text-[var(--ink-band-text)] transition-colors">
                        {email}
                      </a>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Clock className="h-4 w-4 text-[var(--brand-light)] shrink-0" />
                      <span>{hours}</span>
                    </li>
                  </ul>

                  {/* Social channels (Facebook, LINE, Website) */}
                  {(contact?.facebook || contact?.line || contact?.website) && (
                    <div className="pt-1 flex flex-wrap items-center gap-2">
                      {contact.facebook && (
                        <a
                          href={contact.facebook.startsWith("http") ? contact.facebook : `https://facebook.com/${contact.facebook}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-[var(--ink-band-muted)] hover:text-[var(--ink-band-text)] transition-colors"
                        >
                          <span>📘</span>
                          <span>{t("portal.footer.facebook")}</span>
                        </a>
                      )}
                      {contact.line && (
                        <a
                          href={contact.line.startsWith("http") ? contact.line : `https://line.me/R/ti/p/${contact.line.replace(/^@/, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-[var(--ink-band-muted)] hover:text-[var(--ink-band-text)] transition-colors"
                        >
                          <span>💬</span>
                          <span>{t("portal.footer.line")}</span>
                        </a>
                      )}
                      {contact.website && (
                        <a
                          href={contact.website.startsWith("http") ? contact.website : `https://${contact.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-[var(--ink-band-muted)] hover:text-[var(--ink-band-text)] transition-colors"
                        >
                          <Globe className="h-3 w-3 text-[var(--brand-light)]" />
                          <span>{t("portal.footer.visitWebsite")}</span>
                        </a>
                      )}
                    </div>
                  )}
                </>
              );
            })()}

            {/* Staff console portal link */}
            <Link
              href="/login"
              className="flex items-center justify-between p-3 rounded-[var(--r-md)] bg-white/5 hover:bg-white/10 border border-white/10 text-xs transition-colors group mt-2"
            >
              <span className="text-[var(--ink-band-muted)] group-hover:text-[var(--ink-band-text)] font-medium flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-[var(--brand-light)]" />
                {t("portal.footer.staffConsole")}
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-[var(--ink-band-muted)] group-hover:text-[var(--ink-band-text)] group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--ink-band-muted)] gap-4">
          <p>© {new Date().getFullYear()} {brandName}. {t("portal.footer.rights")}</p>
          <div className="flex items-center gap-2 opacity-80">
            <span>{t("portal.footer.poweredBy")} VibeCore Framework</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span className="font-medium text-[var(--ink-band-text)]">Liyon Theme</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
