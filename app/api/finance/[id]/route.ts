import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { accountFilter, isValidId } from "@/lib/account";
import { CACHE_TAGS } from "@/lib/cache";
import { connectDb } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { Finance } from "@/models/Finance";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const auth = await requirePermission(request, "finance");
  if (auth.response) return auth.response;

  await connectDb();
  const body = await request.json();
  const { id } = await params;
  if (!isValidId(id)) {
    return NextResponse.json({ message: "Amaturo ntaboneka." }, { status: 404 });
  }

  const record = await Finance.findOneAndUpdate(
    { _id: id, ...accountFilter(auth.user.accountOwnerId) },
    {
      amount: Number(body.amount),
      type: body.type,
      date: body.date,
      giverName: String(body.giverName || "").trim(),
      note: String(body.note || "").trim(),
      recordedBy: String(body.recordedBy || "").trim()
    },
    { new: true }
  );
  if (!record) {
    return NextResponse.json({ message: "Amaturo ntaboneka." }, { status: 404 });
  }

  revalidateTag(CACHE_TAGS.finance);
  revalidateTag(CACHE_TAGS.dashboard);
  return NextResponse.json({ message: "Amaturo yahinduwe neza", record });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = await requirePermission(request, "finance");
  if (auth.response) return auth.response;

  await connectDb();
  const { id } = await params;
  if (!isValidId(id)) {
    return NextResponse.json({ message: "Amaturo ntaboneka." }, { status: 404 });
  }
  await Finance.deleteOne({ _id: id, ...accountFilter(auth.user.accountOwnerId) });

  revalidateTag(CACHE_TAGS.finance);
  revalidateTag(CACHE_TAGS.dashboard);
  return NextResponse.json({ message: "Amaturo yasibwe neza" });
}
