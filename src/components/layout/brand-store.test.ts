import { describe, it, expect, beforeEach } from "vitest";
import { useBrandStore } from "./brand-store";

describe("useBrandStore", () => {
  beforeEach(() => {
    useBrandStore.getState().resetPreview();
  });

  it("เริ่มต้นด้วย preview เป็น null", () => {
    expect(useBrandStore.getState().preview).toBeNull();
  });

  it("ตั้งค่า preview และอ่านค่ากลับได้", () => {
    useBrandStore.getState().setPreview({
      nameTh: "องค์กรตัวอย่าง",
      nameEn: "Sample Org",
      logoUrl: "/test-logo.png",
    });

    const current = useBrandStore.getState().preview;
    expect(current).toEqual({
      nameTh: "องค์กรตัวอย่าง",
      nameEn: "Sample Org",
      logoUrl: "/test-logo.png",
    });
  });

  it("resetPreview คืนค่า preview เป็น null", () => {
    useBrandStore.getState().setPreview({ nameTh: "ชื่อใหม่" });
    expect(useBrandStore.getState().preview).not.toBeNull();

    useBrandStore.getState().resetPreview();
    expect(useBrandStore.getState().preview).toBeNull();
  });
});
