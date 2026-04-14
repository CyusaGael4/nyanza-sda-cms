import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { hasPermission } from "@/lib/permissions";
import { canManage, getRequestUser } from "@/lib/jwt";
import { PermissionKey, UserRole } from "@/types";

export async function requireAuth(request: NextRequest) {
  const user = await getRequestUser(request);
  if (!user) {
    return {
      user: null,
      response: NextResponse.json({ message: "Banza winjire" }, { status: 401 })
    };
  }

  if (!user.isActive) {
    return {
      user: null,
      response: NextResponse.json(
        { message: "Konti yawe yahagaritswe. Vugana n'umuyobozi mukuru." },
        { status: 403 }
      )
    };
  }

  return { user, response: null };
}

export async function requireRoles(request: NextRequest, roles: UserRole[]) {
  const auth = await requireAuth(request);
  if (auth.response) return auth;

  if (!auth.user || !roles.includes(auth.user.role)) {
    return {
      user: null,
      response: NextResponse.json({ message: "Aha ntuhafitiye uburenganzira" }, { status: 403 })
    };
  }

  return auth;
}

export async function requireManager(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth.response) return auth;

  if (!auth.user || !canManage(auth.user.role)) {
    return {
      user: null,
      response: NextResponse.json({ message: "Ntubyemerewe" }, { status: 403 })
    };
  }

  return auth;
}

export async function requirePermission(request: NextRequest, permission: PermissionKey) {
  const auth = await requireAuth(request);
  if (auth.response) return auth;

  if (!hasPermission(auth.user, permission)) {
    return {
      user: null,
      response: NextResponse.json(
        { message: "Ntabwo wemerewe kureba cyangwa guhindura aha." },
        { status: 403 }
      )
    };
  }

  return auth;
}
