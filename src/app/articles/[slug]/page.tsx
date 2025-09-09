import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getArticle } from "@/lib/articlesDb";
import sanitizeHtml from "sanitize-html";
import Link from "next/link";

// Types
type Params = { slug: string };

export const dynamic = "force-dynamic";

// --- Helpers ---------------------------------------------------------------
function htmlToPlainText(html: string) {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function calcReadingMinutes(text: string) {
  const WORDS_PER_MIN = 220;
  const words = text.split(/\s+/).filter(Boolean).length || 0;
  return Math.max(1, Math.round(words / WORDS_PER_MIN));
}

const sanitizeOptions: sanitizeHtml.IOptions = {
  ...sanitizeHtml.defaults,
  allowedTags: Array.from(
    new Set([
      ...sanitizeHtml.defaults.allowedTags,
      "img",
      "figure",
      "figcaption",
      "video",
      "source",
      "pre",
      "code",
      "iframe",
      "table",
      "thead",
      "tbody",
      "tfoot",
      "tr",
      "th",
      "td",
      "details",
      "summary",
      "mark",
    ])
  ),
  allowedAttributes: {
    ...(sanitizeHtml.defaults.allowedAttributes || {}),
    "*": ["class", "data-*", "id", "aria-label", "role"],
    a: ["href", "name", "target", "rel", "title"],
    img: ["src", "alt", "title", "width", "height", "loading"],
    iframe: ["src", "title", "allow", "allowfullscreen", "frameborder"],
    video: ["controls", "poster", "width", "height"],
    source: ["src", "type"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: { img: ["http", "https", "data"], source: ["http", "https", "data"] },
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
  },
};

// --- Metadata --------------------------------------------------------------
export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  const title = article ? `${article.title} | Proovia E‑Learning` : "Article";
  const description = article?.description || "Training article";
  return { title, description };
}

// --- Page -----------------------------------------------------------------
export default async function ArticlePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return notFound();
  if ((article.status || "published") !== "published") return notFound();

  const plain = htmlToPlainText(article.contentHtml || "");
  const readMin = calcReadingMinutes(plain);

  const updatedAt = article.updatedAt ? new Date(article.updatedAt) : null;
  const author = (article as { author?: string }).author || null;

  const safeHtml = sanitizeHtml(article.contentHtml, sanitizeOptions);

  return (
    <article className="mx-auto max-w-4xl px-4 pb-16">
      {/* Top bar with breadcrumbs and edit link */}
      <div className="sticky top-0 z-10 -mx-4 mb-4 border-b border-black/5 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:border-white/10">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex items-center justify-between py-3">
            <Breadcrumbs
              items={[
                { href: "/", label: "Home" },
                { href: "/articles", label: "Articles" },
                { label: article.title },
              ]}
            />
            <Link
              href={`/admin/articles/${article.slug}/edit`}
              className="inline-flex items-center rounded-full border border-black/10 dark:border-white/15 px-3 py-1 text-xs font-medium hover:border-brand/60"
            >
              Edit
            </Link>
          </div>
        </div>
      </div>

      {/* Hero header */}
      <header className="mb-8 rounded-2xl border border-black/10 bg-gradient-to-b from-muted/40 to-transparent p-6 dark:border-white/10">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {article.department ? (
            <span className="inline-flex items-center rounded-full border border-black/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-foreground/70 dark:border-white/15">
              {article.department}
            </span>
          ) : null}
          {readMin ? (
            <span className="inline-flex items-center rounded-full bg-black/5 px-2.5 py-1 text-[11px] font-medium text-foreground/70 dark:bg-white/10">
              {readMin} min read
            </span>
          ) : null}
          {updatedAt ? (
            <span className="inline-flex items-center rounded-full bg-black/5 px-2.5 py-1 text-[11px] font-medium text-foreground/70 dark:bg-white/10">
              Updated {updatedAt.toLocaleDateString()}
            </span>
          ) : null}
        </div>
        <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
          <span className="bg-gradient-to-r from-foreground via-foreground/80 to-foreground bg-clip-text text-transparent">
            {article.title}
          </span>
        </h1>
        {article.description ? (
          <p className="mt-3 max-w-3xl text-pretty text-base text-foreground/80 md:text-lg">
            {article.description}
          </p>
        ) : null}
        {author ? (
          <div className="mt-4 text-sm text-foreground/60">By {author}</div>
        ) : null}

        {article.tags && article.tags.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {article.tags.map((t: string) => (
              <Link
                key={t}
                href={`/articles?q=${encodeURIComponent(t)}`}
                className="group inline-flex items-center gap-1 rounded-full border border-black/10 px-3 py-1 text-foreground/70 hover:border-brand/60 hover:text-foreground dark:border-white/15"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-brand/60 transition group-hover:bg-brand" />
                #{t}
              </Link>
            ))}
          </div>
        ) : null}
      </header>

      {/* Content + sidebar */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_260px]">
        <div>
          <div className="my-6 h-px w-full bg-black/10 dark:bg-white/10" />
          <div
            className="prose prose-neutral dark:prose-invert max-w-none prose-headings:scroll-mt-24 prose-h1:font-bold prose-h2:mt-10 prose-h3:mt-8 prose-p:text-foreground/90 prose-a:decoration-brand/60 prose-a:underline-offset-4 hover:prose-a:text-foreground prose-img:rounded-xl prose-pre:rounded-xl prose-pre:p-4 prose-code:before:content-none prose-code:after:content-none prose-li:my-1"
            dangerouslySetInnerHTML={{ __html: safeHtml }}
          />
        </div>

        {/* Sidebar meta */}
        <aside className="sticky top-20 hidden self-start md:block">
          <div className="space-y-6">
            {/* Table of contents placeholder */}
            <div className="rounded-2xl border border-black/10 p-4 dark:border-white/10">
              <div className="text-xs font-semibold uppercase tracking-wider text-foreground/60">On this page</div>
              <nav id="toc" className="mt-3 text-sm text-foreground/70">
                <div className="text-foreground/50">Headings will appear as you scroll</div>
              </nav>
            </div>

            {/* Related articles */}
            <div className="rounded-2xl border border-black/10 p-4 dark:border-white/10">
              <div className="text-xs font-semibold uppercase tracking-wider text-foreground/60">Related</div>
              <ul className="mt-3 space-y-2 text-sm text-foreground/70">
                <li>
                  <Link href="/articles?q=training" className="hover:text-foreground">
                    Training basics
                  </Link>
                </li>
                <li>
                  <Link href="/articles?q=policy" className="hover:text-foreground">
                    Company policies
                  </Link>
                </li>
                <li>
                  <Link href="/articles?q=safety" className="hover:text-foreground">
                    Safety guides
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}
