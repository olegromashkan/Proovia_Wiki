import Link from "next/link";
import { listQuickArticles } from "@/lib/quickArticlesDb";
import { listArticles } from "@/lib/articlesDb";
import ArticleCard from "@/components/ArticleCard";

export const dynamic = "force-dynamic";

export default function Home() {
  const quickArticles = listQuickArticles();
  const articles = listArticles();
  return (
    <div className="space-y-8">
      <section className="p-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight leading-[1.1]">
              <span>Explore.</span>
              <br />
              <span>Learn.</span>
              <br />
              <span>Grow.</span>
            </h1>
          </div>
          <div className="lg:col-span-2">
            <ul
              className="sm:flex sm:items-stretch sm:gap-3 sm:[&>*]:basis-1/3 sm:[&>*]:transition-[flex-basis] sm:[&>*]:duration-300 sm:hover:[&>*]:basis-1/4 sm:[&>*:hover]:basis-1/2"
            >
              {quickArticles.length === 0 && (
                <>
                  <li className="rounded-2xl border border-dashed border-black/10 dark:border-white/15 p-4 h-64 flex flex-col justify-center items-center text-sm text-foreground/70 overflow-hidden">
                    Empty slot
                  </li>
                  <li className="rounded-2xl border border-dashed border-black/10 dark:border-white/15 p-4 h-64 flex flex-col justify-center items-center text-sm text-foreground/70 overflow-hidden">
                    Empty slot
                  </li>
                  <li className="rounded-2xl border border-dashed border-black/10 dark:border-white/15 p-4 h-64 flex flex-col justify-center items-center text-sm text-foreground/70 overflow-hidden">
                    Empty slot
                  </li>
                </>
              )}
              {quickArticles.length > 0 && (
                <>
                  {quickArticles.map((q) => (
                    <li
                      key={q.slug}
                      className="rounded-2xl border border-black/10 dark:border-white/15 p-4 hover:border-brand/50 h-64 flex flex-col overflow-hidden"
                    >
                      <div className="text-xs uppercase tracking-wide text-foreground/60">{q.department || "Article"}</div>
                      <div className="mt-1 font-medium line-clamp-3">{q.title}</div>
                      <p className="mt-1 text-sm text-foreground/70 line-clamp-4">{q.description}</p>
                      <div className="mt-auto pt-3">
                        <Link href={`/articles/${q.slug}`} className="text-sm text-brand hover:underline">Open</Link>
                      </div>
                      </li>
                    ))}
                  {/* placeholders to keep 3-in-row layout */}
                  {Array.from({ length: Math.max(0, 3 - quickArticles.length) }).map((_, i) => (
                    <li
                      key={`ph-${i}`}
                      className="rounded-2xl border border-dashed border-black/10 dark:border-white/15 p-4 h-64 flex flex-col justify-center items-center text-sm text-foreground/70 overflow-hidden"
                    >
                      Empty slot
                    </li>
                  ))}
                </>
              )}
            </ul>
          </div>
        </div>
      </section>

      <div className="mt-2 flex flex-wrap gap-3">
        <Link
          href="/articles"
          className="inline-flex items-center rounded-full bg-brand px-4 py-2 text-white text-sm font-medium shadow hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        >
          Browse Articles
        </Link>
        <Link
          href="/departments"
          className="inline-flex items-center rounded-full border border-black/10 dark:border-white/15 px-4 py-2 text-sm font-medium hover:border-brand/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        >
          Departments
        </Link>
        <Link
          href="/training"
          className="inline-flex items-center rounded-full border border-black/10 dark:border-white/15 px-4 py-2 text-sm font-medium hover:border-brand/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        >
          Training
        </Link>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">All Articles</h2>
          <Link href="/articles" className="text-sm text-brand hover:underline">View all</Link>
        </div>
        {articles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/10 dark:border-white/15 p-6 text-sm text-foreground/70">
            No articles yet.
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <li key={a.slug}>
                <ArticleCard
                  title={a.title}
                  description={a.description}
                  department={a.department}
                  tags={a.tags}
                  imageUrl={a.imageUrl}
                  imageX={a.imageX}
                  imageY={a.imageY}
                  href={`/articles/${a.slug}`}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
