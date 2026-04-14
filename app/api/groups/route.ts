import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { accountFilter } from "@/lib/account";
import { CACHE_TAGS } from "@/lib/cache";
import { ensureDefaultGroups, sortGroupsByChurchOrder } from "@/lib/default-groups";
import { connectDb } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { Group } from "@/models/Group";

export async function GET(request: NextRequest) {
  const auth = await requirePermission(request, "groups");
  if (auth.response) return auth.response;

  await connectDb();
  await ensureDefaultGroups(auth.user.accountOwnerId);
  const groups = sortGroupsByChurchOrder(
    await Group.find(accountFilter(auth.user.accountOwnerId)).sort({ name: 1 })
  );
  return NextResponse.json({ groups });
}

export async function POST(request: NextRequest) {
  const auth = await requirePermission(request, "groups");
  if (auth.response) return auth.response;

  await connectDb();
  const body = await request.json();
  if (!body.name || !body.leaderName) {
    return NextResponse.json(
      { message: "Andika izina ry'itsinda n'urikuriye." },
      { status: 400 }
    );
  }

  const group = await Group.create({
    accountOwnerId: auth.user.accountOwnerId,
    name: String(body.name || "").trim(),
    leaderName: String(body.leaderName || "").trim()
  });

  revalidateTag(CACHE_TAGS.groups);
  return NextResponse.json({ message: "Itsinda ryabitswe neza", group });
}
