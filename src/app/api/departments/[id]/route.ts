import { NextResponse } from "next/server";
import { deleteDepartment } from "@/lib/departmentsDb";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const n = Number(id);
  if (!Number.isFinite(n)) return NextResponse.json({ error: "invalid id" }, { status: 400 });
  deleteDepartment(n);
  return NextResponse.json({ ok: true });
}

