import { NextResponse } from "next/server";
import { listDepartments, addDepartment } from "@/lib/departmentsDb";

export async function GET() {
  return NextResponse.json(listDepartments());
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body?.name || "").trim();
    if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
    const item = addDepartment(name);
    return NextResponse.json(item, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "failed";
    const status = msg.includes("UNIQUE") || msg.includes("unique") ? 409 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}

