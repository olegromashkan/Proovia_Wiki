import { NextResponse } from "next/server";
import sanitizeHtml from "sanitize-html";
import { saveArticle, getArticle } from "@/lib/articlesDb";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, slug: rawSlug, description, department, tags, contentHtml, status, publishAt, imageUrl, imageX, imageY } = body ?? {};
    if (!title || typeof title !== "string") return NextResponse.json({ error: "title required" }, { status: 400 });
    if (!description || typeof description !== "string") return NextResponse.json({ error: "description required" }, { status: 400 });
    if (!contentHtml || typeof contentHtml !== "string") return NextResponse.json({ error: "contentHtml required" }, { status: 400 });

    const slug = (rawSlug as string | undefined)?.trim() ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
    if (!slug) return NextResponse.json({ error: "invalid slug" }, { status: 400 });

    const exists = getArticle(slug);
    if (exists) return NextResponse.json({ error: "slug already exists" }, { status: 409 });

    const clean = sanitizeHtml(contentHtml, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat([
        "img",
        "h1",
        "h2",
        "h3",
        "pre",
        "code",
        "blockquote",
        "span",
      ]),
      allowedAttributes: {
        a: ["href", "name", "target", "rel"],
        img: ["src", "alt", "title"],
        '*': ["class"]
      },
      allowedSchemes: ["http", "https", "mailto"],
    });

    const saved = saveArticle({
      slug,
      title,
      description,
      department,
      tags: Array.isArray(tags) ? tags.map(String) : [],
      contentHtml: clean,
      status: status === 'draft' ? 'draft' : 'published',
      // store ISO or undefined
      publishAt: typeof publishAt === 'string' && publishAt ? publishAt : undefined,
      imageUrl: typeof imageUrl === 'string' && imageUrl ? imageUrl : undefined,
      imageX: Number.isFinite(Number(imageX)) ? Number(imageX) : undefined,
      imageY: Number.isFinite(Number(imageY)) ? Number(imageY) : undefined,
    });
    return NextResponse.json({ ok: true, slug: saved.slug });
  } catch {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }
}
