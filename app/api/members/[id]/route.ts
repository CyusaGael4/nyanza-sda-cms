import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { accountFilter, isValidId, toObjectId } from "@/lib/account";
import { CACHE_TAGS } from "@/lib/cache";
import { connectDb } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { normalizePhone } from "@/lib/utils";
import { Group } from "@/models/Group";
import { Member } from "@/models/Member";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const auth = await requirePermission(request, "members");
  if (auth.response) return auth.response;

  await connectDb();
  const { id } = await params;
  if (!isValidId(id)) {
    return NextResponse.json({ message: "Umunyamuryango ntaboneka." }, { status: 404 });
  }
  const body = await request.json();
  let groupId = null;
  if (body.groupId) {
    if (!isValidId(String(body.groupId))) {
      return NextResponse.json({ message: "Itsinda wahisemo si ryo." }, { status: 400 });
    }

    const group = await Group.findOne({
      _id: body.groupId,
      ...accountFilter(auth.user.accountOwnerId)
    }).select("_id");
    if (!group) {
      return NextResponse.json({ message: "Itsinda wahisemo ntiriboneka." }, { status: 404 });
    }

    groupId = toObjectId(String(body.groupId));
  }

  const member = await Member.findOneAndUpdate(
    { _id: id, ...accountFilter(auth.user.accountOwnerId) },
    {
      names: String(body.names || "").trim(),
      phone: normalizePhone(String(body.phone || "")),
      address: String(body.address || "").trim(),
      birthDate: body.birthDate,
      gender: body.gender,
      churchRole: String(body.churchRole || "").trim(),
      baptized: Boolean(body.baptized),
      group: groupId
    },
    { new: true }
  );
  if (!member) {
    return NextResponse.json({ message: "Umunyamuryango ntaboneka." }, { status: 404 });
  }
  revalidateTag(CACHE_TAGS.members);
  revalidateTag(CACHE_TAGS.groups);
  revalidateTag(CACHE_TAGS.dashboard);
  revalidateTag(CACHE_TAGS.attendance);
  return NextResponse.json({ message: "Amakuru yahinduwe neza", member });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = await requirePermission(request, "members");
  if (auth.response) return auth.response;

  await connectDb();
  const { id } = await params;
  if (!isValidId(id)) {
    return NextResponse.json({ message: "Umunyamuryango ntaboneka." }, { status: 404 });
  }
  await Member.deleteOne({ _id: id, ...accountFilter(auth.user.accountOwnerId) });
  revalidateTag(CACHE_TAGS.members);
  revalidateTag(CACHE_TAGS.groups);
  revalidateTag(CACHE_TAGS.dashboard);
  revalidateTag(CACHE_TAGS.attendance);
  return NextResponse.json({ message: "Umunyamuryango yasibwe neza" });
}
