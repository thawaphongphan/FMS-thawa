import { NextResponse } from "next/server";
import { requirePermission, P } from "@/features/identity/server";
import { prisma } from "@/shared/lib/infra/prisma";

export async function GET() {
  try {
    const ctx = await requirePermission(P.usersRead);
    const userTenants = await prisma.userTenant.findMany({
      where: { tenantId: ctx.tenantId },
      include: {
        user: true,
        userRoles: {
          include: {
            role: true,
          },
        },
      },
      orderBy: { user: { name: "asc" } },
    });

    // Format CSV with UTF-8 BOM so Thai characters render properly in Microsoft Excel
    const BOM = "\uFEFF";
    const headers = [
      "ชื่อ-นามสกุล",
      "อีเมล",
      "รหัสบทบาท",
      "บทบาท",
      "สถานะ",
      "วันที่สร้าง",
      "เข้าสู่ระบบล่าสุด",
    ];

    const escapeCsv = (val: string | null | undefined) => {
      if (!val) return "";
      const str = String(val);
      if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = userTenants.map((ut) => {
      const roleCodes = ut.userRoles.map((ur) => ur.role.code).join("; ");
      const roleNames = ut.userRoles.map((ur) => ur.role.nameTh || ur.role.code).join("; ");
      const status = ut.isActive && ut.user.isActive ? "ใช้งานอยู่" : "ระงับการใช้งาน";
      const createdAt = ut.user.createdAt ? new Date(ut.user.createdAt).toLocaleDateString("th-TH") : "";
      const lastLoginAt = ut.user.lastLoginAt
        ? new Date(ut.user.lastLoginAt).toLocaleString("th-TH")
        : "ยังไม่เคยเข้าสู่ระบบ";

      return [
        escapeCsv(ut.user.name),
        escapeCsv(ut.user.email),
        escapeCsv(roleCodes),
        escapeCsv(roleNames),
        escapeCsv(status),
        escapeCsv(createdAt),
        escapeCsv(lastLoginAt),
      ].join(",");
    });

    const csvContent = BOM + [headers.join(","), ...rows].join("\r\n");
    const dateStr = new Date().toISOString().slice(0, 10);

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="users_export_${dateStr}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new NextResponse("Unauthorized or Internal Error", { status: 403 });
  }
}
