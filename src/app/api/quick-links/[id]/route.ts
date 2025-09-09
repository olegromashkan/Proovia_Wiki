import { NextResponse } from "next/server";
import { deleteQuickLink } from "@/lib/quickLinksDb";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const n = Number(id);
  if (!Number.isFinite(n)) return NextResponse.json({ error: "invalid id" }, { status: 400 });
  deleteQuickLink(n);
  return NextResponse.json({ ok: true });
}

