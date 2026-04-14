import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { accountFilter } from "@/lib/account";
import { CACHE_TAGS } from "@/lib/cache";
import { connectDb } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { Finance } from "@/models/Finance";
import { monthKey } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const auth = await requirePermission(request, "finance");
    if (auth.response) return auth.response;

    await connectDb();
    const records = await Finance.find(accountFilter(auth.user.accountOwnerId)).sort({ date: -1 });

    const now = new Date();
    const currentMonth = monthKey(now);
    const monthTotal = records
      .filter((item) => monthKey(item.date) === currentMonth)
      .reduce((sum, item) => sum + item.amount, 0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekTotal = records
      .filter((item) => new Date(item.date) >= weekAgo)
      .reduce((sum, item) => sum + item.amount, 0);

    return NextResponse.json({ records, summary: { weekTotal, monthTotal } });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Hari ikibazo cyabaye kuri server";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requirePermission(request, "finance");
    if (auth.response) return auth.response;

    await connectDb();
    const body = await request.json();

    if (!body.amount || !body.type || !body.date || !body.recordedBy) {
      return NextResponse.json({ message: "Uzuza amakuru yose abanza" }, { status: 400 });
    }

    const record = await Finance.create({
      accountOwnerId: auth.user.accountOwnerId,
      amount: Number(body.amount),
      type: body.type,
      date: body.date,
      giverName: String(body.giverName || "").trim(),
      note: String(body.note || "").trim(),
      recordedBy: String(body.recordedBy || "").trim()
    });
    revalidateTag(CACHE_TAGS.finance);
    revalidateTag(CACHE_TAGS.dashboard);
    return NextResponse.json({ message: "Amaturo yabitswe neza", record });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Hari ikibazo cyabaye kuri server";
    return NextResponse.json({ message }, { status: 500 });
  }
}
