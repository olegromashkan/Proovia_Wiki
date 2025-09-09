import { NextResponse } from "next/server";
import { addQuickArticle, listQuickArticles } from "@/lib/quickArticlesDb";

export async function GET() {
  return NextResponse.json(listQuickArticles());
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slug } = body ?? {};
    if (!slug || typeof slug !== "string") return NextResponse.json({ error: "slug required" }, { status: 400 });
    const res = addQuickArticle(slug);
    return NextResponse.json(res, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "invalid request";
    const status = msg.includes("max quick links") ? 409 : msg.includes("not found") ? 404 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}

