import bcrypt from "bcryptjs";
import { prisma } from "@/shared/lib/infra/prisma";
import { errors } from "@/shared/lib/errors";
import { writeAudit } from "../audit";
import { SUPER_ADMIN_CODE } from "../../permissions";

export interface RawCsvUserRow {
  name: string;
  email: string;
  role?: string;
  password?: string;
}

export interface ValidatedUserRow {
  rowNumber: number;
  name: string;
  email: string;
  roleCode: string;
  roleId: string | null;
  roleNameTh: string;
  password?: string;
  isValid: boolean;
  errorKey?: string;
}

interface Actor {
  tenantId: string;
  actorId: string;
  isSuperAdmin: boolean;
  permissions: string[];
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function validateUsersCsv(
  tenantId: string,
  isSuperAdmin: boolean,
  rows: RawCsvUserRow[]
): Promise<ValidatedUserRow[]> {
  const roles = await prisma.role.findMany({
    where: { tenantId },
    select: { id: true, code: true, nameTh: true, nameEn: true },
  });

  const roleMap = new Map(roles.map((r) => [r.code.toUpperCase(), r]));
  const defaultRole = roleMap.get("VIEWER") || roles[0];

  const emails = rows.map((r) => (r.email || "").trim().toLowerCase()).filter(Boolean);
  const existingUsers = await prisma.user.findMany({
    where: { email: { in: emails } },
    select: { email: true },
  });
  const existingEmailSet = new Set(existingUsers.map((u) => u.email.toLowerCase()));

  const seenInFile = new Set<string>();
  const results: ValidatedUserRow[] = [];

  for (let i = 0; i < rows.length; i++) {
    const raw = rows[i];
    const rowNumber = i + 1;
    const name = (raw.name || "").trim();
    const email = (raw.email || "").trim().toLowerCase();
    const rawRole = (raw.role || "").trim().toUpperCase();
    const password = (raw.password || "").trim();

    if (!name) {
      results.push({
        rowNumber,
        name: "",
        email,
        roleCode: rawRole || "VIEWER",
        roleId: null,
        roleNameTh: "",
        password,
        isValid: false,
        errorKey: "users.importInvalid",
      });
      continue;
    }

    if (!email || !EMAIL_REGEX.test(email)) {
      results.push({
        rowNumber,
        name,
        email,
        roleCode: rawRole || "VIEWER",
        roleId: null,
        roleNameTh: "",
        password,
        isValid: false,
        errorKey: "users.importInvalid",
      });
      continue;
    }

    if (seenInFile.has(email)) {
      results.push({
        rowNumber,
        name,
        email,
        roleCode: rawRole || "VIEWER",
        roleId: null,
        roleNameTh: "",
        password,
        isValid: false,
        errorKey: "users.importDuplicateInFile",
      });
      continue;
    }
    seenInFile.add(email);

    if (existingEmailSet.has(email)) {
      results.push({
        rowNumber,
        name,
        email,
        roleCode: rawRole || "VIEWER",
        roleId: null,
        roleNameTh: "",
        password,
        isValid: false,
        errorKey: "users.importDuplicate",
      });
      continue;
    }

    let targetRole = defaultRole;
    if (rawRole) {
      const matched = roleMap.get(rawRole);
      if (!matched) {
        results.push({
          rowNumber,
          name,
          email,
          roleCode: rawRole,
          roleId: null,
          roleNameTh: "",
          password,
          isValid: false,
          errorKey: "users.importRoleNotFound",
        });
        continue;
      }
      targetRole = matched;
    }

    // Security Guard: Non-superadmin cannot assign SUPER_ADMIN role
    if (targetRole.code === SUPER_ADMIN_CODE && !isSuperAdmin) {
      results.push({
        rowNumber,
        name,
        email,
        roleCode: targetRole.code,
        roleId: null,
        roleNameTh: targetRole.nameTh,
        password,
        isValid: false,
        errorKey: "users.superAdminProtected",
      });
      continue;
    }

    results.push({
      rowNumber,
      name,
      email,
      roleCode: targetRole.code,
      roleId: targetRole.id,
      roleNameTh: targetRole.nameTh,
      password: password || undefined,
      isValid: true,
    });
  }

  return results;
}

export async function importUsersBatch(
  actor: Actor,
  rows: { name: string; email: string; roleId: string; password?: string }[]
): Promise<{ successCount: number; failedCount: number }> {
  if (rows.length === 0) {
    return { successCount: 0, failedCount: 0 };
  }

  // Verify roles
  const roleIds = [...new Set(rows.map((r) => r.roleId))];
  const foundRoles = await prisma.role.findMany({
    where: { id: { in: roleIds }, tenantId: actor.tenantId },
    select: { id: true, code: true },
  });

  if (foundRoles.length !== roleIds.length) {
    throw errors.not_found("role_not_in_tenant");
  }

  if (!actor.isSuperAdmin && foundRoles.some((r) => r.code === SUPER_ADMIN_CODE)) {
    throw errors.forbidden("super_admin_protected");
  }

  const defaultPasswordHash = await bcrypt.hash("Passw0rd!vibe", 12);
  let successCount = 0;
  const importedUsersAudit: { id: string; email: string; name: string; roleId: string }[] = [];

  for (const item of rows) {
    const email = item.email.toLowerCase().trim();
    const passwordHash = item.password
      ? await bcrypt.hash(item.password, 12)
      : defaultPasswordHash;

    try {
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email,
            name: item.name.trim(),
            passwordHash,
            mustChangePassword: true,
            emailVerified: true,
            isActive: true,
          },
        });

        const ut = await tx.userTenant.create({
          data: {
            userId: user.id,
            tenantId: actor.tenantId,
            isActive: true,
          },
        });

        await tx.userRole.create({
          data: {
            userTenantId: ut.id,
            roleId: item.roleId,
            scopeType: "ALL",
            scopeId: null,
          },
        });

        importedUsersAudit.push({
          id: user.id,
          email,
          name: item.name,
          roleId: item.roleId,
        });
      });
      successCount++;
    } catch {
      // If individual item failed (e.g. concurrent conflict), skip and continue
    }
  }

  if (successCount > 0) {
    await writeAudit({
      tenantId: actor.tenantId,
      actorId: actor.actorId,
      action: "user.import",
      entity: "user",
      entityId: "batch",
      after: {
        successCount,
        users: importedUsersAudit,
      },
    });
  }

  return {
    successCount,
    failedCount: rows.length - successCount,
  };
}
