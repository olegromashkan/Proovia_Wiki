import { NextResponse } from "next/server";
import { isQuickArticle, removeQuickArticle } from "@/lib/quickArticlesDb";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  return NextResponse.json({ isQuick: isQuickArticle(slug) });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const res = removeQuickArticle(slug);
  return NextResponse.json(res);
}

