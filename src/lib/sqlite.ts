import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { departments as defaultDepartments } from "@/data/departments";

let db: Database.Database | null = null;

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

export function getDb() {
  if (db) return db;
  const custom = process.env.DB_FILE;
  let file: string;
  if (custom) {
    const dir = path.dirname(custom);
    ensureDir(dir);
    file = custom;
  } else {
    const dir = path.join(process.cwd(), "var");
    ensureDir(dir);
    file = path.join(dir, "data.db");
  }
  db = new Database(file);
  db.pragma("journal_mode = WAL");
  // schema
  db.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      department TEXT,
      content_html TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );
    CREATE TABLE IF NOT EXISTS article_tags (
      article_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      PRIMARY KEY (article_id, tag_id),
      FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_articles_updated_at ON articles(updated_at);
    CREATE TABLE IF NOT EXISTS quick_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      href TEXT NOT NULL,
      description TEXT,
      position INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS quick_articles (
      article_id INTEGER PRIMARY KEY,
      position INTEGER NOT NULL UNIQUE,
      FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS article_versions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      article_id INTEGER NOT NULL,
      slug TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      department TEXT,
      content_html TEXT NOT NULL,
      status TEXT NOT NULL,
      publish_at TEXT,
      tags_json TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );
  `);
  // Seed departments once from static list if empty
  try {
    const row = db.prepare("SELECT COUNT(1) as c FROM departments").get() as { c: number };
    if (!row || row.c === 0) {
      const insert = db.prepare("INSERT OR IGNORE INTO departments(name) VALUES(?)");
      const tx = db.transaction((items: readonly string[]) => {
        for (const name of items) insert.run(name);
      });
      tx(defaultDepartments as readonly string[]);
    }
  } catch {
    // ignore seeding errors
  }
  // Full-text search (FTS5)
  db.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS articles_fts USING fts5(
      title, description, content, slug UNINDEXED, tokenize = 'porter'
    );
    CREATE TRIGGER IF NOT EXISTS articles_ai AFTER INSERT ON articles BEGIN
      INSERT INTO articles_fts(rowid, title, description, content, slug)
      VALUES (new.id, new.title, new.description, new.content_html, new.slug);
    END;
    CREATE TRIGGER IF NOT EXISTS articles_ad AFTER DELETE ON articles BEGIN
      DELETE FROM articles_fts WHERE rowid = old.id;
    END;
    CREATE TRIGGER IF NOT EXISTS articles_au AFTER UPDATE ON articles BEGIN
      UPDATE articles_fts SET title = new.title, description = new.description, content = new.content_html, slug = new.slug
      WHERE rowid = new.id;
    END;
  `);
  // Add status column to articles if missing
  const hasStatus = db
    .prepare("SELECT 1 FROM pragma_table_info('articles') WHERE name='status'")
    .get();
  if (!hasStatus) {
    db.exec("ALTER TABLE articles ADD COLUMN status TEXT NOT NULL DEFAULT 'published'");
  }
  const hasPublishAt = db
    .prepare("SELECT 1 FROM pragma_table_info('articles') WHERE name='publish_at'")
    .get();
  if (!hasPublishAt) {
    db.exec("ALTER TABLE articles ADD COLUMN publish_at TEXT");
  }
  // Card image fields
  const hasImageUrl = db
    .prepare("SELECT 1 FROM pragma_table_info('articles') WHERE name='image_url'")
    .get();
  if (!hasImageUrl) {
    db.exec("ALTER TABLE articles ADD COLUMN image_url TEXT");
  }
  const hasImageX = db
    .prepare("SELECT 1 FROM pragma_table_info('articles') WHERE name='image_x'")
    .get();
  if (!hasImageX) {
    db.exec("ALTER TABLE articles ADD COLUMN image_x REAL");
  }
  const hasImageY = db
    .prepare("SELECT 1 FROM pragma_table_info('articles') WHERE name='image_y'")
    .get();
  if (!hasImageY) {
    db.exec("ALTER TABLE articles ADD COLUMN image_y REAL");
  }
  return db;
}
