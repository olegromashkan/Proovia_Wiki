import { listArticles } from "@/lib/articlesDb";

export default async function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const items = listArticles().map((a) => ({
    url: `${base}/articles/${a.slug}`,
    lastModified: a.updatedAt || new Date().toISOString(),
  }));
  return [
    { url: `${base}/`, lastModified: new Date().toISOString() },
    ...items,
  ];
}

