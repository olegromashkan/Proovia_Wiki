import { NextResponse } from "next/server";
import { listQuickLinks, createQuickLink } from "@/lib/quickLinksDb";

export async function GET() {
  return NextResponse.json(listQuickLinks());
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, href, description } = body ?? {};
    if (!title || typeof title !== "string") return NextResponse.json({ error: "title required" }, { status: 400 });
    if (!href || typeof href !== "string") return NextResponse.json({ error: "href required" }, { status: 400 });
    const item = createQuickLink({ title, href, description });
    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }
}

