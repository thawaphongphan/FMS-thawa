import { describe, it, expect } from "vitest";
import { sidebarGroups, getActiveNavChain, visibleGroups } from "./sidebar-nav";

const viewer = { roles: [], permissions: ["users:read"], isSuperAdmin: false };
const admin = { roles: [], permissions: ["users:read", "users:manage", "roles:manage", "settings:manage"], isSuperAdmin: false };

describe("sidebar-nav", () => {
  it("แดชบอร์ดไม่ต้องมีสิทธิ์", () => {
    expect(visibleGroups(viewer).some((g) => g.items.some((i) => i.href === "/dashboard"))).toBe(true);
  });
  it("viewer ไม่เห็นบทบาทและตั้งค่า", () => {
    const hrefs = visibleGroups(viewer).flatMap((g) => g.items.flatMap((i) => [i.href, ...(i.children ?? []).map((c) => c.href)]));
    expect(hrefs).toContain("/users");
    expect(hrefs).not.toContain("/users/roles");
    expect(hrefs).not.toContain("/settings");
  });
  it("admin เห็นครบ และกลุ่มที่ไม่มีรายการเหลือถูกตัด", () => {
    const groups = visibleGroups(admin);
    expect(groups.flatMap((g) => g.items.map((i) => i.href))).toEqual(expect.arrayContaining(["/dashboard", "/users", "/settings"]));
    expect(groups.every((g) => g.items.length > 0)).toBe(true);
  });
  it("getActiveNavChain เลือก href ที่ตรงที่สุด", () => {
    expect(getActiveNavChain("/users/roles").map((c) => c.href)).toEqual(["/users", "/users/roles"]);
    expect(getActiveNavChain("/settings").map((c) => c.href)).toEqual(["/settings"]);
    expect(getActiveNavChain("/nowhere")).toEqual([]);
    expect(getActiveNavChain("/admin/departments").map((c) => c.href)).toEqual(["/admin/management", "/admin/departments"]);
    expect(getActiveNavChain("/admin/curriculum").map((c) => c.href)).toEqual(["/admin/management", "/admin/curriculum"]);
  });
  it("โครงสร้างกลุ่มเมนูหลัก", () => expect(sidebarGroups).toHaveLength(10));
  it("เมนูการจัดการแสดงผลเมื่อมีสิทธิ์ภาควิชาหรือหลักสูตร", () => {
    const academicAdmin = { roles: [], permissions: ["department:read", "curriculum:read"], isSuperAdmin: false };
    const groups = visibleGroups(academicAdmin);
    const mgmtGroup = groups.find((g) => g.label === "nav.group.management");
    expect(mgmtGroup).toBeDefined();
    const mgmtItem = mgmtGroup?.items.find((i) => i.href === "/admin/management");
    expect(mgmtItem).toBeDefined();
    expect(mgmtItem?.children?.map((c) => c.href)).toEqual(["/admin/departments", "/admin/curriculum"]);
  });
});
