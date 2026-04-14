import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { accountFilter, toObjectId } from "@/lib/account";
import { CACHE_TAGS } from "@/lib/cache";
import { connectDb } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { Attendance } from "@/models/Attendance";
import { Member } from "@/models/Member";

export async function POST(request: NextRequest) {
  const auth = await requirePermission(request, "attendance");
  if (auth.response) return auth.response;

  await connectDb();
  const { items } = await request.json();
  if (!Array.isArray(items)) {
    return NextResponse.json({ message: "Ibyoherejwe si byo" }, { status: 400 });
  }

  const rawMemberIds = items.flatMap((item) =>
    Array.isArray(item.records)
      ? item.records.map((record: { memberId?: string }) => String(record.memberId || ""))
      : []
  );
  const allowedMembers = await Member.find({
    _id: { $in: rawMemberIds.filter(Boolean) },
    ...accountFilter(auth.user.accountOwnerId)
  })
    .select("_id")
    .lean();
  const allowedIds = new Set(allowedMembers.map((member) => String(member._id)));

  await Promise.all(
    items.map(async (item) => {
      const normalizedRecords = Array.isArray(item.records)
        ? item.records
            .filter(
              (record: { memberId?: string; status?: string }) =>
                allowedIds.has(String(record.memberId || "")) &&
                (record.status === "present" || record.status === "absent")
            )
            .map((record: { memberId: string; status: "present" | "absent" }) => ({
              memberId: toObjectId(String(record.memberId)),
              status: record.status
            }))
        : [];

      const filter = {
        ...accountFilter(auth.user.accountOwnerId),
        serviceType: "Sabbath" as const,
        date: new Date(item.date)
      };

      const existing = await Attendance.findOne(filter);
      const mergedMap = new Map<
        string,
        { memberId: ReturnType<typeof toObjectId>; status: "present" | "absent" }
      >();

      if (existing) {
        existing.records.forEach(
          (record: { memberId?: unknown; status: "present" | "absent" }) => {
          if (record.memberId) {
            mergedMap.set(String(record.memberId), {
              memberId: toObjectId(String(record.memberId)),
              status: record.status
            });
          }
          }
        );
      }

      normalizedRecords.forEach(
        (record: { memberId: ReturnType<typeof toObjectId>; status: "present" | "absent" }) => {
        mergedMap.set(String(record.memberId), record);
        }
      );

      return Attendance.findOneAndUpdate(
        filter,
        {
          accountOwnerId: toObjectId(auth.user.accountOwnerId),
          serviceType: "Sabbath",
          date: new Date(item.date),
          takenBy: item.takenBy,
          records: [...mergedMap.values()]
        },
        { upsert: true }
      );
    })
  );
  revalidateTag(CACHE_TAGS.attendance);
  revalidateTag(CACHE_TAGS.dashboard);
  return NextResponse.json({ message: "Ibyari offline byoherejwe neza" });
}
