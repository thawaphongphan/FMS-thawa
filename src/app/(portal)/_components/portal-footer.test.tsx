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

  it("renders custom contact information and social links when provided", async () => {
    const Component = await PortalFooter({
      tenant: {
        id: "t1",
        nameTh: "คณะวิทยาการสารสนเทศ",
        nameEn: "Faculty of Informatics",
        logoUrl: null,
        contact: {
          phone: "02-555-1234",
          email: "custom@faculty.ac.th",
          addressTh: "อาคาร 50 ปี มหาวิทยาลัย",
          addressEn: "50th Anniversary Building",
          hoursTh: "เปิดทำการ 8:00 - 17:00",
          facebook: "https://facebook.com/customfaculty",
          line: "@customline",
          mapsUrl: "https://maps.app.goo.gl/custommap",
          website: "https://custom.faculty.ac.th",
        },
      },
    });
    render(Component);

    expect(screen.getByText("02-555-1234")).toBeTruthy();
    expect(screen.getByText("custom@faculty.ac.th")).toBeTruthy();
    expect(screen.getByText("อาคาร 50 ปี มหาวิทยาลัย")).toBeTruthy();
    expect(screen.getByText("เปิดทำการ 8:00 - 17:00")).toBeTruthy();
    expect(screen.getByText("portal.footer.openMap")).toBeTruthy();
    expect(screen.getByText("portal.footer.facebook")).toBeTruthy();
    expect(screen.getByText("portal.footer.line")).toBeTruthy();
    expect(screen.getByText("portal.footer.visitWebsite")).toBeTruthy();
  });
});
