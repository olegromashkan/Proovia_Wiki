import { getDb } from "./sqlite";

export type QuickArticle = {
  slug: string;
  title: string;
  description: string;
  department?: string;
  imageUrl?: string;
  imageX?: number;
  imageY?: number;
  position: number;
};

function getArticleIdBySlug(slug: string): number | null {
  const db = getDb();
  const row = db.prepare(`SELECT id FROM articles WHERE slug = ?`).get(slug) as { id: number } | undefined;
  return row?.id ?? null;
}

export function listQuickArticles(): QuickArticle[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT a.slug, a.title, a.description, a.department, a.image_url as imageUrl, a.image_x as imageX, a.image_y as imageY, qa.position
       FROM quick_articles qa
       JOIN articles a ON a.id = qa.article_id
       ORDER BY qa.position ASC`
    )
    .all() as Array<{
      slug: string;
      title: string;
      description: string;
      department?: string | null;
      imageUrl?: string | null;
      imageX?: number | null;
      imageY?: number | null;
      position: number;
    }>;
  return rows.map((r) => ({
    slug: r.slug,
    title: r.title,
    description: r.description,
    department: r.department || undefined,
    imageUrl: r.imageUrl || undefined,
    imageX: r.imageX ?? undefined,
    imageY: r.imageY ?? undefined,
    position: r.position,
  }));
}

export function isQuickArticle(slug: string): boolean {
  const db = getDb();
  const id = getArticleIdBySlug(slug);
  if (!id) return false;
  const row = db.prepare(`SELECT 1 FROM quick_articles WHERE article_id = ?`).get(id) as { 1: number } | undefined;
  return !!row;
}

export function addQuickArticle(slug: string): { ok: true } {
  const db = getDb();
  const articleId = getArticleIdBySlug(slug);
  if (!articleId) throw new Error("article not found");
  const cnt = db.prepare(`SELECT COUNT(1) AS c FROM quick_articles`).get() as { c: number };
  if (cnt.c >= 3) throw new Error("max quick links reached");
  const exists = db.prepare(`SELECT 1 FROM quick_articles WHERE article_id = ?`).get(articleId);
  if (exists) return { ok: true };
  // find first free position 0..2
  const rows = db.prepare(`SELECT position FROM quick_articles`).all() as Array<{ position: number }>;
  const used = new Set(rows.map((r) => r.position));
  let pos = 0;
  while (used.has(pos) && pos < 3) pos++;
  if (pos >= 3) throw new Error("max quick links reached");
  db.prepare(`INSERT INTO quick_articles(article_id, position) VALUES(?, ?)`).run(articleId, pos);
  return { ok: true };
}

export function removeQuickArticle(slug: string): { ok: true } {
  const db = getDb();
  const articleId = getArticleIdBySlug(slug);
  if (!articleId) return { ok: true };
  db.prepare(`DELETE FROM quick_articles WHERE article_id = ?`).run(articleId);
  return { ok: true };
}

