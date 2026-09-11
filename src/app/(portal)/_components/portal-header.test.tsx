import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { PortalHeader } from "./portal-header";

let mockSessionUser: { id: string; name?: string | null; email?: string | null; image?: string | null } | null = null;
const mockTheme = "light";
const mockSetTheme = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: mockTheme, setTheme: mockSetTheme }),
}));

vi.mock("next-auth/react", () => ({
  signOut: vi.fn(),
}));

vi.mock("@/shared/lib/i18n/client", () => ({
  useT: () => (key: string) => key,
  useLocale: () => "th",
}));

vi.mock("@/hooks/use-session", () => ({
  useAppSession: () => ({
    user: mockSessionUser,
    isAuthenticated: !!mockSessionUser,
    isLoading: false,
    roles: [],
    permissions: [],
    isSuperAdmin: false,
  }),
}));

describe("PortalHeader", () => {
  beforeEach(() => {
    mockSessionUser = null;
    mockSetTheme.mockClear();
  });

  it("renders all portal navigation links", () => {
    render(<PortalHeader tenant={{ id: "t1", nameTh: "คณะวิทยาการ", nameEn: "Informatics", logoUrl: null }} />);
    expect(screen.getByText("nav.home")).toBeTruthy();
    expect(screen.getByText("curriculum.nav")).toBeTruthy();
    expect(screen.getByText("schedule.nav")).toBeTruthy();
    expect(screen.getByText("alumni.nav")).toBeTruthy();
    expect(screen.getByText("stats.nav")).toBeTruthy();
    expect(screen.getByText("news.title")).toBeTruthy();
    expect(screen.getByText("staff.title")).toBeTruthy();
  });

  it("renders sign in button when user is not authenticated", () => {
    render(<PortalHeader tenant={null} />);
    const signInBtn = screen.getAllByRole("link").find((link) => link.getAttribute("href") === "/login");
    expect(signInBtn).toBeTruthy();
  });

  it("renders avatar menu trigger with user name and initial when user is authenticated", () => {
    mockSessionUser = { id: "u1", name: "สมชาย ทดสอบ", email: "somchai@test.com", image: null };
    render(<PortalHeader tenant={null} />);

    expect(screen.getByText("สมชาย ทดสอบ")).toBeTruthy();
    expect(screen.getByText("ส")).toBeTruthy();
  });
});
