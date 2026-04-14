import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { accountFilter, isValidId } from "@/lib/account";
import { CACHE_TAGS } from "@/lib/cache";
import { connectDb } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { Announcement } from "@/models/Announcement";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const auth = await requirePermission(request, "announcements");
  if (auth.response) return auth.response;

  await connectDb();
  const { id } = await params;
  if (!isValidId(id)) {
    return NextResponse.json({ message: "Itangazo ntiriboneka." }, { status: 404 });
  }
  const body = await request.json();
  const announcement = await Announcement.findOneAndUpdate(
    { _id: id, ...accountFilter(auth.user.accountOwnerId) },
    {
      title: String(body.title || "").trim(),
      description: String(body.description || "").trim(),
      authorName: String(body.authorName || "").trim()
    },
    { new: true }
  );
  if (!announcement) {
    return NextResponse.json({ message: "Itangazo ntiriboneka." }, { status: 404 });
  }
  revalidateTag(CACHE_TAGS.announcements);
  revalidateTag(CACHE_TAGS.dashboard);
  return NextResponse.json({ message: "Itangazo ryahinduwe neza", announcement });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = await requirePermission(request, "announcements");
  if (auth.response) return auth.response;

  await connectDb();
  const { id } = await params;
  if (!isValidId(id)) {
    return NextResponse.json({ message: "Itangazo ntiriboneka." }, { status: 404 });
  }
  await Announcement.deleteOne({ _id: id, ...accountFilter(auth.user.accountOwnerId) });
  revalidateTag(CACHE_TAGS.announcements);
  revalidateTag(CACHE_TAGS.dashboard);
  return NextResponse.json({ message: "Itangazo ryasibwe neza" });
}
