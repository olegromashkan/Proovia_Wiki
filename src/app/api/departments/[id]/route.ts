import { NextResponse } from "next/server";
import { deleteDepartment, updateDepartment } from "@/lib/departmentsDb";

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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const n = Number(id);
  if (!Number.isFinite(n)) return NextResponse.json({ error: "invalid id" }, { status: 400 });
  try {
    const body = await req.json();
    const name = String(body?.name || "").trim();
    if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
    const dep = updateDepartment(n, name);
    return NextResponse.json(dep);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "failed";
    const status = msg.includes("UNIQUE") || msg.includes("unique") ? 409 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}

