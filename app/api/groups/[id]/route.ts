import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { accountFilter, isValidId } from "@/lib/account";
import { CACHE_TAGS } from "@/lib/cache";
import { connectDb } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { Group } from "@/models/Group";
import { Member } from "@/models/Member";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const auth = await requirePermission(request, "groups");
  if (auth.response) return auth.response;

  await connectDb();
  const body = await request.json();
  const { id } = await params;
  if (!isValidId(id)) {
    return NextResponse.json({ message: "Itsinda ntiriboneka." }, { status: 404 });
  }

  const group = await Group.findOneAndUpdate(
    { _id: id, ...accountFilter(auth.user.accountOwnerId) },
    {
      name: String(body.name || "").trim(),
      leaderName: String(body.leaderName || "").trim()
    },
    { new: true }
  );
  if (!group) {
    return NextResponse.json({ message: "Itsinda ntiriboneka." }, { status: 404 });
  }

  revalidateTag(CACHE_TAGS.groups);
  return NextResponse.json({ message: "Itsinda ryahinduwe neza", group });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = await requirePermission(request, "groups");
  if (auth.response) return auth.response;

  await connectDb();
  const { id } = await params;
  if (!isValidId(id)) {
    return NextResponse.json({ message: "Itsinda ntiriboneka." }, { status: 404 });
  }

  await Member.updateMany(
    { group: id, ...accountFilter(auth.user.accountOwnerId) },
    { $set: { group: null } }
  );
  await Group.deleteOne({ _id: id, ...accountFilter(auth.user.accountOwnerId) });

  revalidateTag(CACHE_TAGS.groups);
  revalidateTag(CACHE_TAGS.members);
  return NextResponse.json({ message: "Itsinda ryasibwe neza" });
}
