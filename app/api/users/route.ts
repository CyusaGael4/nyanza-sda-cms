import bcrypt from "bcryptjs";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { accountFilter } from "@/lib/account";
import { CACHE_TAGS } from "@/lib/cache";
import { connectDb } from "@/lib/db";
import { requireRoles } from "@/lib/auth";
import { normalizePermissions } from "@/lib/permissions";
import { hasValidPasswordLength, normalizePhone } from "@/lib/utils";
import { User } from "@/models/User";
import { UserRole } from "@/types";

function safeRole(input: unknown): UserRole {
  return input === "admin" || input === "assistant" ? input : "assistant";
}

export async function GET(request: NextRequest) {
  const auth = await requireRoles(request, ["super_admin"]);
  if (auth.response) return auth.response;

  await connectDb();
  const users = await User.find(accountFilter(auth.user.accountOwnerId))
    .select("-password -recoveryPassword")
    .sort({ createdAt: -1 });
  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  const auth = await requireRoles(request, ["super_admin"]);
  if (auth.response) return auth.response;

  await connectDb();
  const body = await request.json();

  const names = String(body.names || "").trim();
  const phone = normalizePhone(String(body.phone || ""));
  const password = String(body.password || "");
  const recoveryPassword = String(body.recoveryPassword || "");
  const role = safeRole(body.role);

  if (!names || !phone || !password) {
    return NextResponse.json(
      { message: "Andika amazina, telefoni n'ijambo ry'ibanga." },
      { status: 400 }
    );
  }

  if (!hasValidPasswordLength(password)) {
    return NextResponse.json(
      { message: "Ijambo ry'ibanga rigomba kuba nibura inyuguti 8." },
      { status: 400 }
    );
  }

  const existingUser = await User.findOne({ phone });
  if (existingUser) {
    return NextResponse.json({ message: "Iyo telefoni isanzwe ifite konti." }, { status: 409 });
  }

  const user = await User.create({
    names,
    phone,
    password: await bcrypt.hash(password, 10),
    recoveryPassword: recoveryPassword ? await bcrypt.hash(recoveryPassword, 10) : "",
    accountOwnerId: auth.user.accountOwnerId,
    role,
    permissions: normalizePermissions(body.permissions, role),
    isActive: true
  });

  revalidateTag(CACHE_TAGS.users);
  return NextResponse.json({
    message: "Umukoresha yabitswe neza",
    user: {
      _id: user._id,
      names: user.names,
      phone: user.phone,
      role: user.role,
      permissions: user.permissions,
      isActive: user.isActive
    }
  });
}
