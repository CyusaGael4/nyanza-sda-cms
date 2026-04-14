import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { accountFilter, toObjectId } from "@/lib/account";
import { CACHE_TAGS } from "@/lib/cache";
import { connectDb } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { Attendance } from "@/models/Attendance";
import { Member } from "@/models/Member";

type AttendanceRecord = {
  memberId?: unknown;
  status: "present" | "absent";
};

type AttendanceItem = {
  date: Date | string;
  serviceType: "Sabbath" | "Midweek";
  records: AttendanceRecord[];
};

export async function GET(request: NextRequest) {
  const auth = await requirePermission(request, "attendance");
  if (auth.response) return auth.response;

  await connectDb();
  const list = (await Attendance.find(accountFilter(auth.user.accountOwnerId))
    .populate("records.memberId")
    .sort({ date: -1 })) as unknown as AttendanceItem[];

  const sabbathSummary = list
    .filter((item) => item.serviceType === "Sabbath")
    .map((item) => ({
      date: item.date,
      present: item.records.filter((record: AttendanceRecord) => record.status === "present")
        .length,
      absent: item.records.filter((record: AttendanceRecord) => record.status === "absent")
        .length
    }));

  return NextResponse.json({ attendance: list, sabbathSummary });
}

export async function POST(request: NextRequest) {
  const auth = await requirePermission(request, "attendance");
  if (auth.response) return auth.response;

  await connectDb();
  const body = await request.json();
  const memberIds = Array.isArray(body.records)
    ? body.records
        .map((item: { memberId?: string }) => String(item.memberId || ""))
        .filter(Boolean)
    : [];
  const allowedMembers = await Member.find({
    _id: { $in: memberIds },
    ...accountFilter(auth.user.accountOwnerId)
  })
    .select("_id")
    .lean();
  const allowedIds = new Set(allowedMembers.map((member) => String(member._id)));
  const normalizedRecords = Array.isArray(body.records)
    ? body.records
        .filter(
          (item: { memberId?: string; status?: string }) =>
            allowedIds.has(String(item.memberId || "")) &&
            (item.status === "present" || item.status === "absent")
        )
        .map((item: { memberId: string; status: "present" | "absent" }) => ({
          memberId: toObjectId(String(item.memberId)),
          status: item.status
        }))
    : [];

  const filter = {
    ...accountFilter(auth.user.accountOwnerId),
    serviceType: "Sabbath" as const,
    date: new Date(body.date)
  };

  const existing = await Attendance.findOne(filter);
  const mergedMap = new Map<
    string,
    { memberId: ReturnType<typeof toObjectId>; status: "present" | "absent" }
  >();

  if (existing) {
    existing.records.forEach((record: { memberId?: unknown; status: "present" | "absent" }) => {
      if (record.memberId) {
        mergedMap.set(String(record.memberId), {
          memberId: toObjectId(String(record.memberId)),
          status: record.status
        });
      }
    });
  }

  normalizedRecords.forEach((record: { memberId: ReturnType<typeof toObjectId>; status: "present" | "absent" }) => {
    mergedMap.set(String(record.memberId), record);
  });

  const attendance = await Attendance.findOneAndUpdate(
    filter,
    {
      accountOwnerId: toObjectId(auth.user.accountOwnerId),
      serviceType: "Sabbath",
      date: new Date(body.date),
      takenBy: body.takenBy,
      records: [...mergedMap.values()]
    },
    { upsert: true, new: true }
  );
  revalidateTag(CACHE_TAGS.attendance);
  revalidateTag(CACHE_TAGS.dashboard);
  return NextResponse.json({ message: "Uko bitabiriye byabitswe neza", attendance });
}
