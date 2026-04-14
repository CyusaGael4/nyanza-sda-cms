import bcrypt from "bcryptjs";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { accountFilter, isValidId } from "@/lib/account";
import { CACHE_TAGS } from "@/lib/cache";
import { connectDb } from "@/lib/db";
import { requireRoles } from "@/lib/auth";
import { normalizePermissions } from "@/lib/permissions";
import { hasValidPasswordLength, normalizePhone } from "@/lib/utils";
import { User } from "@/models/User";
import { UserRole } from "@/types";

type Params = { params: Promise<{ id: string }> };

function safeRole(input: unknown): UserRole {
  return input === "admin" || input === "assistant" ? input : "assistant";
}

export async function PUT(request: NextRequest, { params }: Params) {
  const auth = await requireRoles(request, ["super_admin"]);
  if (auth.response) return auth.response;

  await connectDb();
  const body = await request.json();
  const { id } = await params;
  if (!isValidId(id)) {
    return NextResponse.json({ message: "Uwo mukoresha ntabonetse." }, { status: 404 });
  }
  if (auth.user?.userId === id) {
    return NextResponse.json(
      { message: "Super admin nyamukuru ntiyihindurirwa hano." },
      { status: 400 }
    );
  }

  const target = await User.findOne({ _id: id, ...accountFilter(auth.user.accountOwnerId) });
  if (!target) {
    return NextResponse.json({ message: "Uwo mukoresha ntabonetse." }, { status: 404 });
  }

  const nextPhone = normalizePhone(String(body.phone || ""));
  const phoneOwner = await User.findOne({ phone: nextPhone }).select("_id");
  if (phoneOwner && String(phoneOwner._id) !== id) {
    return NextResponse.json({ message: "Iyo telefoni isanzwe ifite konti." }, { status: 409 });
  }

  const role = safeRole(body.role);
  const update: Record<string, unknown> = {
    names: String(body.names || "").trim(),
    phone: nextPhone,
    role,
    permissions: normalizePermissions(body.permissions, role),
    isActive: body.isActive !== false
  };

  if (body.password) {
    if (!hasValidPasswordLength(String(body.password))) {
      return NextResponse.json(
        { message: "Ijambo ry'ibanga rigomba kuba nibura inyuguti 8." },
        { status: 400 }
      );
    }
    update.password = await bcrypt.hash(String(body.password), 10);
  }

  if (typeof body.recoveryPassword === "string") {
    update.recoveryPassword = body.recoveryPassword
      ? await bcrypt.hash(String(body.recoveryPassword), 10)
      : "";
  }

  const user = await User.findOneAndUpdate(
    { _id: id, ...accountFilter(auth.user.accountOwnerId) },
    update,
    { new: true }
  ).select("-password -recoveryPassword");

  revalidateTag(CACHE_TAGS.users);
  return NextResponse.json({ message: "Umukoresha yahinduwe neza", user });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = await requireRoles(request, ["super_admin"]);
  if (auth.response) return auth.response;

  await connectDb();
  const { id } = await params;
  if (!isValidId(id)) {
    return NextResponse.json({ message: "Uwo mukoresha ntabonetse." }, { status: 404 });
  }

  if (auth.user?.userId === id) {
    return NextResponse.json(
      { message: "Ntushobora kwikuraho ukoresheje iyi button." },
      { status: 400 }
    );
  }

  const target = await User.findOne({ _id: id, ...accountFilter(auth.user.accountOwnerId) });
  if (!target) {
    return NextResponse.json({ message: "Uwo mukoresha ntabonetse." }, { status: 404 });
  }

  if (target.role === "super_admin") {
    return NextResponse.json(
      { message: "Super admin wa nyamukuru ntasibirwa hano." },
      { status: 400 }
    );
  }

  await User.deleteOne({ _id: id, ...accountFilter(auth.user.accountOwnerId) });

  revalidateTag(CACHE_TAGS.users);
  return NextResponse.json({ message: "Umukoresha yasibwe neza" });
}
