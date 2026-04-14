export type UserRole = "super_admin" | "admin" | "assistant";

export type PermissionKey =
  | "dashboard"
  | "members"
  | "attendance"
  | "announcements"
  | "groups"
  | "finance"
  | "users";

export type Permissions = Record<PermissionKey, boolean>;

export type AttendanceStatus = "present" | "absent";

export type OfferingType =
  | "Icyacumi"
  | "Amaturo y'ishimwe"
  | "Amaturo y'itorero rikuru"
  | "Ibirundo";

export type MemberGender = "gabo" | "gore";

export type AccountScoped = {
  accountOwnerId: string;
};
