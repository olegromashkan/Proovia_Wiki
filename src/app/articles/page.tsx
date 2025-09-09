import ArticlesExplorer from "@/components/ArticlesExplorer";
import { listArticles } from "@/lib/articlesDb";

export const metadata = {
  title: "Articles | Proovia E‑Learning",
};

export const dynamic = "force-dynamic";

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const initialQuery = (sp?.q as string) || "";
  const initialDep = (sp?.dep as string) || "";
  const articles = await listArticles();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Articles</h1>
          <p className="text-sm text-foreground/70">Guides, policies and how‑tos.</p>
        </div>
        <a
          href="/admin/articles/new"
          className="inline-flex items-center rounded-full border border-black/10 dark:border-white/15 px-4 py-2 text-sm font-medium hover:border-brand/60"
        >
          New Article
        </a>
      </div>
      <ArticlesExplorer
        articles={articles}
        initialQuery={initialQuery}
        initialDepartment={initialDep}
      />
    </div>
  );
}
