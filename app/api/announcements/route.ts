import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { accountFilter } from "@/lib/account";
import { CACHE_TAGS } from "@/lib/cache";
import { connectDb } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { Announcement } from "@/models/Announcement";

export async function GET(request: NextRequest) {
  const auth = await requirePermission(request, "announcements");
  if (auth.response) return auth.response;

  await connectDb();
  const announcements = await Announcement.find(accountFilter(auth.user.accountOwnerId)).sort({
    createdAt: -1
  });
  return NextResponse.json({ announcements });
}

export async function POST(request: NextRequest) {
  const auth = await requirePermission(request, "announcements");
  if (auth.response) return auth.response;

  await connectDb();
  const body = await request.json();
  const announcement = await Announcement.create({
    accountOwnerId: auth.user.accountOwnerId,
    title: String(body.title || "").trim(),
    description: String(body.description || "").trim(),
    authorName: String(body.authorName || "").trim()
  });
  revalidateTag(CACHE_TAGS.announcements);
  revalidateTag(CACHE_TAGS.dashboard);
  return NextResponse.json({ message: "Itangazo ryabitswe neza", announcement });
}
