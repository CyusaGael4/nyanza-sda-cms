import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { accountFilter, isValidId, toObjectId } from "@/lib/account";
import { CACHE_TAGS } from "@/lib/cache";
import { connectDb } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { validateMemberPayload } from "@/lib/validators/member";
import { normalizePhone } from "@/lib/utils";
import { Group } from "@/models/Group";
import { Member } from "@/models/Member";

export async function GET(request: NextRequest) {
  const auth = await requirePermission(request, "members");
  if (auth.response) return auth.response;

  await connectDb();
  const members = await Member.find(accountFilter(auth.user.accountOwnerId))
    .populate("group", "name")
    .sort({ names: 1 });
  return NextResponse.json({ members });
}

export async function POST(request: NextRequest) {
  const auth = await requirePermission(request, "members");
  if (auth.response) return auth.response;

  await connectDb();
  const body = await request.json();
  const error = validateMemberPayload(body);
  if (error) {
    return NextResponse.json({ message: error }, { status: 400 });
  }

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

  const member = await Member.create({
    accountOwnerId: auth.user.accountOwnerId,
    names: String(body.names || "").trim(),
    phone: normalizePhone(String(body.phone || "")),
    address: String(body.address || "").trim(),
    birthDate: body.birthDate,
    gender: body.gender,
    churchRole: String(body.churchRole || "").trim(),
    baptized: Boolean(body.baptized),
    group: groupId
  });
  revalidateTag(CACHE_TAGS.members);
  revalidateTag(CACHE_TAGS.groups);
  revalidateTag(CACHE_TAGS.dashboard);
  revalidateTag(CACHE_TAGS.attendance);
  return NextResponse.json({ message: "Umunyamuryango yabitswe neza", member });
}
