import { PermissionKey, Permissions, UserRole } from "@/types";

export const permissionKeys: PermissionKey[] = [
  "dashboard",
  "members",
  "attendance",
  "announcements",
  "groups",
  "finance",
  "users"
];

export const permissionLabels: Record<PermissionKey, string> = {
  dashboard: "Ahabanza",
  members: "Abanyamuryango",
  attendance: "Ubwitabire",
  announcements: "Amatangazo",
  groups: "Amatsinda",
  finance: "Amaturo",
  users: "Abakoresha"
};

export function createPermissions(role: UserRole): Permissions {
  if (role === "super_admin") {
    return {
      dashboard: true,
      members: true,
      attendance: true,
      announcements: true,
      groups: true,
      finance: true,
      users: true
    };
  }

  if (role === "admin") {
    return {
      dashboard: true,
      members: true,
      attendance: true,
      announcements: true,
      groups: true,
      finance: true,
      users: false
    };
  }

  return {
    dashboard: true,
    members: false,
    attendance: false,
    announcements: false,
    groups: false,
    finance: false,
    users: false
  };
}

export function normalizePermissions(
  permissions?: Partial<Record<PermissionKey, unknown>> | null,
  role: UserRole = "assistant"
): Permissions {
  const base = createPermissions(role);

  if (role === "super_admin") {
    return base;
  }

  return permissionKeys.reduce((acc, key) => {
    acc[key] = permissions?.[key] === undefined ? base[key] : Boolean(permissions[key]);
    return acc;
  }, {} as Permissions);
}

export function hasPermission(
  user:
    | {
        role: UserRole;
        permissions?: Partial<Record<PermissionKey, boolean>> | null;
      }
    | null
    | undefined,
  key: PermissionKey
) {
  if (!user) return false;
  if (user.role === "super_admin") return true;

  const permissions = normalizePermissions(user.permissions, user.role);
  return permissions[key];
}

export function getRoleLabel(role?: UserRole | null) {
  switch (role) {
    case "super_admin":
      return "Umuyobozi mukuru";
    case "admin":
      return "Umuyobozi";
    case "assistant":
      return "Umukozi";
    default:
      return "Utazwi";
  }
}
