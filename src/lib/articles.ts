import fs from "node:fs/promises";
import path from "node:path";
import type { Department } from "@/data/departments";

export type ArticleMeta = {
  slug: string;
  title: string;
  description: string;
  department?: Department | string;
  tags?: string[];
  createdAt?: string; // ISO
  updatedAt?: string; // ISO
};

export type ArticleFull = ArticleMeta & {
  contentHtml: string; // sanitized HTML content
};

const contentDir = path.join(process.cwd(), "content", "articles");

async function ensureDir() {
  await fs.mkdir(contentDir, { recursive: true });
}

export async function listArticles(): Promise<ArticleMeta[]> {
  try {
    await ensureDir();
    const files = await fs.readdir(contentDir);
    const items: ArticleMeta[] = [];
    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      try {
        const raw = await fs.readFile(path.join(contentDir, file), "utf8");
        const data = JSON.parse(raw) as ArticleFull;
        items.push({
          slug: data.slug,
          title: data.title,
          description: data.description,
          department: data.department,
          tags: data.tags,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      } catch {
        // skip bad file
      }
    }
    // sort by updatedAt desc
    return items.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  } catch {
    return [];
  }
}

export async function getArticle(slug: string): Promise<ArticleFull | null> {
  try {
    await ensureDir();
    const file = path.join(contentDir, `${slug}.json`);
    const raw = await fs.readFile(file, "utf8");
    const data = JSON.parse(raw) as ArticleFull;
    return data;
  } catch {
    return null;
  }
}

export async function saveArticle(article: ArticleFull): Promise<void> {
  await ensureDir();
  const file = path.join(contentDir, `${article.slug}.json`);
  const now = new Date().toISOString();
  const existing = await getArticle(article.slug);
  const payload: ArticleFull = {
    ...article,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  await fs.writeFile(file, JSON.stringify(payload, null, 2), "utf8");
}
