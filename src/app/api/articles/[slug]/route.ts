import { NextResponse } from "next/server";
import sanitizeHtml from "sanitize-html";
import { getArticle, updateArticle } from "@/lib/articlesDb";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(article);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: oldSlug } = await params;
    const body = await req.json();
    const { title, slug: newSlug, description, department, tags, contentHtml, status, publishAt, imageUrl, imageX, imageY } = body ?? {};
    if (!title || typeof title !== "string") return NextResponse.json({ error: "title required" }, { status: 400 });
    if (!description || typeof description !== "string") return NextResponse.json({ error: "description required" }, { status: 400 });
    if (!contentHtml || typeof contentHtml !== "string") return NextResponse.json({ error: "contentHtml required" }, { status: 400 });

    const slug = (newSlug as string | undefined)?.trim() || oldSlug;
    if (!slug) return NextResponse.json({ error: "invalid slug" }, { status: 400 });

    const clean = sanitizeHtml(contentHtml, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h1", "h2", "h3", "pre", "code", "blockquote", "span"]),
      allowedAttributes: {
        a: ["href", "name", "target", "rel"],
        img: ["src", "alt", "title"],
        '*': ["class"]
      },
      allowedSchemes: ["http", "https", "mailto"],
    });

    const res = updateArticle(oldSlug, {
      slug,
      title,
      description,
      department,
      tags: Array.isArray(tags) ? tags.map(String) : [],
      contentHtml: clean,
      status: status === 'draft' ? 'draft' : 'published',
      publishAt: typeof publishAt === 'string' && publishAt ? publishAt : undefined,
      imageUrl: typeof imageUrl === 'string' && imageUrl ? imageUrl : undefined,
      imageX: Number.isFinite(Number(imageX)) ? Number(imageX) : undefined,
      imageY: Number.isFinite(Number(imageY)) ? Number(imageY) : undefined,
    });

    return NextResponse.json({ ok: true, slug: res.slug });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "invalid request";
    const status = msg.includes("not found") ? 404 : msg.includes("exists") ? 409 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
