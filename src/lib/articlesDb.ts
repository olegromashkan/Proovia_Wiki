import { getDb } from "./sqlite";

export type ArticleMeta = {
  slug: string;
  title: string;
  description: string;
  department?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  status?: 'draft' | 'published';
  publishAt?: string;
  imageUrl?: string;
  imageX?: number;
  imageY?: number;
};

export type ArticleFull = ArticleMeta & { contentHtml: string };

export function listArticles(): ArticleMeta[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT a.slug, a.title, a.description, a.department, a.created_at as createdAt, a.updated_at as updatedAt, a.status as status,
              a.image_url as imageUrl, a.image_x as imageX, a.image_y as imageY,
              GROUP_CONCAT(t.name, '\u001f') AS tags
       FROM articles a
       LEFT JOIN article_tags at ON at.article_id = a.id
       LEFT JOIN tags t ON t.id = at.tag_id
       WHERE a.status = 'published' AND (a.publish_at IS NULL OR a.publish_at <= ?)
       GROUP BY a.id
       ORDER BY a.updated_at DESC`
    )
    .all(new Date().toISOString()) as Array<{
      slug: string;
      title: string;
      description: string;
      department?: string | null;
      createdAt?: string | null;
      updatedAt?: string | null;
      status?: 'draft' | 'published';
      tags?: string | null;
      imageUrl?: string | null;
      imageX?: number | null;
      imageY?: number | null;
    }>;

  return rows.map((r) => ({
    slug: String(r.slug),
    title: String(r.title),
    description: String(r.description),
    department: (r.department as string) || undefined,
    createdAt: (r.createdAt as string) || undefined,
    updatedAt: (r.updatedAt as string) || undefined,
    status: (r.status as 'draft'|'published') || 'published' ,
    tags: r.tags ? r.tags.split("\u001f").filter(Boolean) : [],
    imageUrl: r.imageUrl || undefined,
    imageX: r.imageX ?? undefined,
    imageY: r.imageY ?? undefined,
  }));
}

export function searchArticles(term: string): ArticleMeta[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT a.slug, a.title, a.description, a.department, a.created_at as createdAt, a.updated_at as updatedAt, a.status as status
       FROM articles_fts f
       JOIN articles a ON a.id = f.rowid
       WHERE f MATCH ? AND a.status = 'published' AND (a.publish_at IS NULL OR a.publish_at <= ?)
       ORDER BY a.updated_at DESC`
    )
    .all(term, new Date().toISOString()) as Array<Record<string, unknown>>;
  return rows.map((r) => ({
    slug: String(r.slug),
    title: String(r.title),
    description: String(r.description),
    department: (r.department as string) || undefined,
    createdAt: (r.createdAt as string) || undefined,
    updatedAt: (r.updatedAt as string) || undefined,
    status: (r.status as 'draft'|'published') || 'published',
  }));
}

export function adminListArticles(opts: { q?: string; status?: 'draft'|'published'|'all'; department?: string; sort?: 'updated'|'created' }): ArticleMeta[] {
  const db = getDb();
  const q = (opts.q || '').trim();
  const params: string[] = [];
  let where = '1=1';
  if (opts.status && opts.status !== 'all') {
    where += ' AND a.status = ?';
    params.push(opts.status);
  }
  if (opts.department) {
    where += ' AND a.department = ?';
    params.push(opts.department);
  }
  let base = `SELECT a.slug, a.title, a.description, a.department, a.created_at as createdAt, a.updated_at as updatedAt, a.status as status,
    GROUP_CONCAT(t.name, '\u001f') AS tags
    FROM articles a
    LEFT JOIN article_tags at ON at.article_id = a.id
    LEFT JOIN tags t ON t.id = at.tag_id`;
  if (q) {
    base = `SELECT a.slug, a.title, a.description, a.department, a.created_at as createdAt, a.updated_at as updatedAt, a.status as status
            FROM articles_fts f JOIN articles a ON a.id = f.rowid`;
    where += ' AND f MATCH ?';
    params.push(q);
  }
  const order = opts.sort === 'created' ? 'a.created_at DESC' : 'a.updated_at DESC';
  const sql = `${base} WHERE ${where} GROUP BY a.id ORDER BY ${order}`;
  const rows = db.prepare(sql).all(...params) as Array<Record<string, unknown>>;
  return rows.map((r) => ({
    slug: String(r.slug),
    title: String(r.title),
    description: String(r.description),
    department: (r.department as string) || undefined,
    createdAt: (r.createdAt as string) || undefined,
    updatedAt: (r.updatedAt as string) || undefined,
    status: (r.status as 'draft'|'published') || 'published' ,
    tags: r.tags ? String(r.tags).split('\u001f').filter(Boolean) : [],
  }));
}

export function getArticle(slug: string): ArticleFull | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT id, slug, title, description, department, content_html as contentHtml,
              created_at as createdAt, updated_at as updatedAt, status, publish_at as publishAt,
              image_url as imageUrl, image_x as imageX, image_y as imageY
       FROM articles WHERE slug = ?`
    )
    .get(slug) as
    | {
        id: number;
        slug: string;
        title: string;
        description: string;
        department?: string | null;
        contentHtml: string;
        createdAt?: string | null;
        updatedAt?: string | null;
        status?: 'draft' | 'published';
        publishAt?: string | null;
        imageUrl?: string | null;
        imageX?: number | null;
        imageY?: number | null;
      }
    | undefined;

  if (!row) return null;
  const tags = db
    .prepare(
      `SELECT t.name FROM tags t
       JOIN article_tags at ON at.tag_id = t.id
       WHERE at.article_id = ?`
    )
    .all(row.id) as Array<{ name: string }>;

  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    department: row.department || undefined,
    contentHtml: row.contentHtml,
    createdAt: row.createdAt || undefined,
    updatedAt: row.updatedAt || undefined,
    status: row.status || 'published',
    publishAt: row.publishAt || undefined,
    imageUrl: row.imageUrl || undefined,
    imageX: row.imageX ?? undefined,
    imageY: row.imageY ?? undefined,
    tags: tags.map((t) => t.name),
  };
}

export function saveArticle(article: ArticleFull): { slug: string } {
  const db = getDb();
  const now = new Date().toISOString();
  const exists = db.prepare(`SELECT 1 FROM articles WHERE slug = ?`).get(article.slug);
  if (exists) throw new Error("slug already exists");

  const tx = db.transaction(() => {
    const res = db
      .prepare(
        `INSERT INTO articles (slug, title, description, department, content_html, created_at, updated_at, status, publish_at, image_url, image_x, image_y)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        article.slug,
        article.title,
        article.description,
        article.department || null,
        article.contentHtml,
        now,
        now,
        article.status === 'draft' ? 'draft' : 'published',
        article.publishAt || null,
        article.imageUrl || null,
        typeof article.imageX === 'number' ? article.imageX : null,
        typeof article.imageY === 'number' ? article.imageY : null
      );
    const articleId = Number(res.lastInsertRowid);
    const tags = article.tags || [];
    for (const name of tags) {
      const trimmed = name.trim();
      if (!trimmed) continue;
      db.prepare(`INSERT INTO tags(name) VALUES(?) ON CONFLICT(name) DO NOTHING`).run(trimmed);
      const tagIdRow = db
        .prepare(`SELECT id FROM tags WHERE name = ?`)
        .get(trimmed) as { id: number };
      db.prepare(`INSERT OR IGNORE INTO article_tags(article_id, tag_id) VALUES(?, ?)`).run(articleId, tagIdRow.id);
    }
    return { slug: article.slug };
  });

  return tx();
}

export function updateArticle(oldSlug: string, article: ArticleFull): { slug: string } {
  const db = getDb();
  const now = new Date().toISOString();
  const existing = db
    .prepare(`SELECT id FROM articles WHERE slug = ?`)
    .get(oldSlug) as { id: number } | undefined;
  if (!existing) throw new Error("article not found");

  if (oldSlug !== article.slug) {
    const dup = db.prepare(`SELECT 1 FROM articles WHERE slug = ?`).get(article.slug);
    if (dup) throw new Error("slug already exists");
  }

  const tx = db.transaction(() => {
    // snapshot previous version
    const prev = db.prepare(`SELECT slug, title, description, department, content_html as contentHtml, status, publish_at as publishAt FROM articles WHERE id = ?`).get(existing.id) as {
      slug: string; title: string; description: string; department?: string | null; contentHtml: string; status?: 'draft'|'published'; publishAt?: string | null;
    };
    const prevTags = db.prepare(`SELECT t.name FROM tags t JOIN article_tags at ON at.tag_id = t.id WHERE at.article_id = ?`).all(existing.id) as Array<{ name: string }>;
    db.prepare(`INSERT INTO article_versions(article_id, slug, title, description, department, content_html, status, publish_at, tags_json, created_at)
                VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(
        existing.id,
        prev.slug,
        prev.title,
        prev.description,
        prev.department || null,
        prev.contentHtml,
        prev.status || 'published',
        prev.publishAt || null,
        JSON.stringify(prevTags.map(t => t.name)),
        now
      );
    db
      .prepare(
        `UPDATE articles
         SET slug = ?, title = ?, description = ?, department = ?, content_html = ?, updated_at = ?, status = ?, publish_at = ?, image_url = ?, image_x = ?, image_y = ?
         WHERE id = ?`
      )
      .run(
        article.slug,
        article.title,
        article.description,
        article.department || null,
        article.contentHtml,
        now,
        article.status === 'draft' ? 'draft' : 'published',
        article.publishAt || null,
        article.imageUrl || null,
        typeof article.imageX === 'number' ? article.imageX : null,
        typeof article.imageY === 'number' ? article.imageY : null,
        existing.id
      );

    // Replace tag relations
    db.prepare(`DELETE FROM article_tags WHERE article_id = ?`).run(existing.id);
    const tags = article.tags || [];
    for (const name of tags) {
      const trimmed = name.trim();
      if (!trimmed) continue;
      db.prepare(`INSERT INTO tags(name) VALUES(?) ON CONFLICT(name) DO NOTHING`).run(trimmed);
      const tagIdRow = db.prepare(`SELECT id FROM tags WHERE name = ?`).get(trimmed) as { id: number };
      db.prepare(`INSERT OR IGNORE INTO article_tags(article_id, tag_id) VALUES(?, ?)`).run(existing.id, tagIdRow.id);
    }

    return { slug: article.slug };
  });

  return tx();
}

export function listVersions(slug: string): Array<{ id: number; createdAt: string; title: string }> {
  const db = getDb();
  const row = db.prepare(`SELECT id FROM articles WHERE slug = ?`).get(slug) as { id: number } | undefined;
  if (!row) return [];
  const items = db.prepare(`SELECT id, created_at as createdAt, title FROM article_versions WHERE article_id = ? ORDER BY id DESC LIMIT 10`).all(row.id) as Array<{ id: number; createdAt: string; title: string }>;
  return items;
}

export function revertToVersion(versionId: number): { slug: string } {
  const db = getDb();
  const v = db.prepare(`SELECT * FROM article_versions WHERE id = ?`).get(versionId) as {
    id: number; article_id: number; slug: string; title: string; description: string; department?: string | null; content_html: string; status: 'draft'|'published'; publish_at?: string | null; tags_json?: string | null;
  };
  if (!v) throw new Error('version not found');
  const tx = db.transaction(() => {
    db.prepare(`UPDATE articles SET slug = ?, title = ?, description = ?, department = ?, content_html = ?, status = ?, publish_at = ?, updated_at = ? WHERE id = ?`)
      .run(v.slug, v.title, v.description, v.department || null, v.content_html, v.status, v.publish_at || null, new Date().toISOString(), v.article_id);
    db.prepare(`DELETE FROM article_tags WHERE article_id = ?`).run(v.article_id);
    const tags: string[] = JSON.parse(v.tags_json || '[]');
    for (const name of tags) {
      db.prepare(`INSERT INTO tags(name) VALUES(?) ON CONFLICT(name) DO NOTHING`).run(name);
      const tagRow = db.prepare(`SELECT id FROM tags WHERE name = ?`).get(name) as { id: number };
      db.prepare(`INSERT OR IGNORE INTO article_tags(article_id, tag_id) VALUES(?, ?)`).run(v.article_id, tagRow.id);
    }
    return { slug: v.slug };
  });
  return tx();
}
