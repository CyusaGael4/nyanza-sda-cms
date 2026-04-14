import "server-only";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { ensureUserAccountOwner, migrateLegacyAccountData } from "@/lib/account";
import { connectDb } from "@/lib/db";
import { normalizePermissions } from "@/lib/permissions";
import { User } from "@/models/User";
import { Permissions, UserRole } from "@/types";

export type SessionUser = {
  userId: string;
  accountOwnerId: string;
  names: string;
  role: UserRole;
  permissions: Permissions;
  isActive: boolean;
};

type SessionDbUser = {
  _id: { toString(): string };
  names: string;
  role: UserRole;
  accountOwnerId?: { toString(): string } | string | null;
  permissions?: Partial<Permissions>;
  isActive?: boolean;
};

function getJwtSecret() {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error(
      "JWT_SECRET ntiboneka. Shyira iri zina muri .env.local mbere yo gukomeza."
    );
  }

  return jwtSecret;
}

export function signJwt(payload: SessionUser) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

export function verifyJwt(token: string) {
  return jwt.verify(token, getJwtSecret()) as SessionUser;
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  try {
    const parsed = verifyJwt(token);
    await connectDb();
    const user = (await User.findById(parsed.userId)
      .select("_id names role permissions isActive accountOwnerId")
      .lean()) as SessionDbUser | null;

    if (!user) return null;
    const accountOwnerId = await ensureUserAccountOwner(user);
    if (!accountOwnerId) return null;
    await migrateLegacyAccountData(accountOwnerId);

    return buildSessionUser(user, accountOwnerId);
  } catch {
    return null;
  }
}

export async function getRequestUser(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;

  try {
    const parsed = verifyJwt(token);
    await connectDb();
    const user = (await User.findById(parsed.userId)
      .select("_id names role permissions isActive accountOwnerId")
      .lean()) as SessionDbUser | null;

    if (!user) return null;
    const accountOwnerId = await ensureUserAccountOwner(user);
    if (!accountOwnerId) return null;
    await migrateLegacyAccountData(accountOwnerId);

    return buildSessionUser(user, accountOwnerId);
  } catch {
    return null;
  }
}

export function canManage(role?: UserRole) {
  return role === "super_admin" || role === "admin";
}

export function buildSessionUser(user: SessionDbUser, accountOwnerId?: string) {
  const savedAccountOwnerId =
    accountOwnerId || (user.accountOwnerId ? String(user.accountOwnerId) : user._id.toString());

  return {
    userId: user._id.toString(),
    accountOwnerId: savedAccountOwnerId,
    names: user.names,
    role: user.role,
    permissions: normalizePermissions(user.permissions, user.role),
    isActive: user.isActive !== false
  } satisfies SessionUser;
}
