import { NextResponse } from "next/server";
import { revertToVersion } from "@/lib/articlesDb";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const n = Number(id);
  if (!Number.isFinite(n)) return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  try {
    const res = revertToVersion(n);
    return NextResponse.json({ ok: true, slug: res.slug });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'failed';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

