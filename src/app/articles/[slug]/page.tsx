import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getArticle } from "@/lib/articlesDb";
import sanitizeHtml from "sanitize-html";

type Params = { slug: string };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  return {
    title: article ? `${article.title} | Proovia E‑Learning` : "Article",
  };
}

export default async function ArticlePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return notFound();
  if ((article.status || 'published') !== 'published') return notFound();

  return (
    <article className="max-w-3xl">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/articles", label: "Articles" },
          { label: article.title },
        ]}
      />
      <div className="mb-2">
        <a
          href={`/admin/articles/${article.slug}/edit`}
          className="inline-flex items-center rounded-full border border-black/10 dark:border-white/15 px-3 py-1 text-xs font-medium hover:border-brand/60"
        >
          Edit
        </a>
      </div>
      <p className="text-xs uppercase tracking-wide text-foreground/60">{article.department}</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">{article.title}</h1>
      <p className="mt-2 text-foreground/80">{article.description}</p>
      {article.tags && article.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-foreground/60">
          {article.tags.map((t) => (
            <a
              key={t}
              href={`/articles?q=${encodeURIComponent(t)}`}
              className="rounded-full border border-black/10 dark:border-white/15 px-2 py-1 hover:border-brand/60"
            >
              #{t}
            </a>
          ))}
        </div>
      )}
      <div className="my-6 h-px w-full bg-black/10 dark:bg-white/15" />
      <div
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.contentHtml) }}
      />
    </article>
  );
}
