import "next-auth";
import "next-auth/jwt";
import type { RoleGrant } from "./_internal/grants";
import type { Locale } from "@/shared/lib/i18n/config";

export type OAuthProviderId = "google" | "microsoft" | "line";

export interface OAuthProviderItem {
  id: OAuthProviderId;
  configured: boolean;
}

declare module "next-auth" {
  interface Session {
    user: { id: string; email: string; name: string; image?: string };
    tenantId: string;
    locale: Locale | null;
    roles: RoleGrant[];
    permissions: string[];
    isSuperAdmin: boolean;
    mustChangePassword: boolean;
  }
  interface User { id: string; email: string; name: string; image?: string }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    tenantId?: string;
    locale?: Locale | null;
    roles?: RoleGrant[];
    permissions?: string[];
    isSuperAdmin?: boolean;
    mustChangePassword?: boolean;
    checkedAt?: number;
    invalid?: boolean;
  }
}
