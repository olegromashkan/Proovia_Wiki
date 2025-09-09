import { getDb } from "./sqlite";

export type QuickLink = {
  id: number;
  title: string;
  href: string;
  description?: string;
  position: number;
};

export function listQuickLinks(): QuickLink[] {
  const db = getDb();
  const rows = db.prepare(`SELECT id, title, href, description, position FROM quick_links ORDER BY position ASC, id ASC`).all() as QuickLink[];
  return rows;
}

export function createQuickLink(input: { title: string; href: string; description?: string }): QuickLink {
  const db = getDb();
  const nextPosRow = db.prepare(`SELECT COALESCE(MAX(position) + 1, 0) AS pos FROM quick_links`).get() as { pos: number };
  const res = db
    .prepare(`INSERT INTO quick_links(title, href, description, position) VALUES(?, ?, ?, ?)`)
    .run(input.title, input.href, input.description ?? null, nextPosRow.pos);
  const id = Number(res.lastInsertRowid);
  const row = db.prepare(`SELECT id, title, href, description, position FROM quick_links WHERE id = ?`).get(id) as QuickLink;
  return row;
}

export function deleteQuickLink(id: number): void {
  const db = getDb();
  db.prepare(`DELETE FROM quick_links WHERE id = ?`).run(id);
}

