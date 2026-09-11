import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PortalFooter } from "./portal-footer";

vi.mock("@/i18n/server", () => ({
  getLocale: async () => "th",
  getT: async () => (key: string) => key,
}));

describe("PortalFooter", () => {
  it("renders tenant brand and all quick links", async () => {
    const Component = await PortalFooter({
      tenant: {
        id: "t1",
        nameTh: "คณะวิทยาการสารสนเทศ",
        nameEn: "Faculty of Informatics",
        logoUrl: null,
      },
    });
    render(Component);

    expect(screen.getByText("คณะวิทยาการสารสนเทศ")).toBeTruthy();
    expect(screen.getByText("portal.footer.quickLinks")).toBeTruthy();
    expect(screen.getByText("portal.footer.contact")).toBeTruthy();
    expect(screen.getByText("portal.footer.tagline")).toBeTruthy();
    expect(screen.getByText("portal.footer.address")).toBeTruthy();
    expect(screen.getByText("portal.footer.staffConsole")).toBeTruthy();
  });
});
