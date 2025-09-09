import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getArticle } from "@/lib/articlesDb";
import sanitizeHtml from "sanitize-html";

// Types
type Params = { slug: string };

export const dynamic = "force-dynamic";

// --- Helpers ---------------------------------------------------------------
function htmlToPlainText(html: string) {
  // quick + safe-ish strip for reading-time (sanitized later for rendering)
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
  const WORDS_PER_MIN = 220; // comfortable average
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
    table: ["class"],
    th: ["colspan", "rowspan", "scope"],
    td: ["colspan", "rowspan"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: { img: ["http", "https", "data"], source: ["http", "https", "data"] },
  transformTags: {
    // ensure external links are safe
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
  },
};

// --- Metadata --------------------------------------------------------------
export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  const title = article ? `${article.title} | Proovia E‑Learning` : "Article";
  const description = article?.description || "Training article";
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

// --- Page -----------------------------------------------------------------
export default async function ArticlePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return notFound();
  if ((article.status || "published") !== "published") return notFound();

  const plain = htmlToPlainText(article.contentHtml || "");
  const readMin = calcReadingMinutes(plain);

  // Optional fields handled safely if present in DB
  const updatedAt = (article as any)?.updatedAt ? new Date((article as any).updatedAt) : null;
  const author = (article as any)?.author || null;

  const safeHtml = sanitizeHtml(article.contentHtml, sanitizeOptions);

  return (
    <article className="mx-auto max-w-4xl px-4 pb-16">
      {/* Reading progress bar */}
      <div className="sticky top-0 z-20 -mx-4 h-1 bg-transparent">
        <div id="reading-progress" className="h-1 w-0 bg-brand transition-[width] duration-150 ease-out" />
      </div>

      {/* Top bar with breadcrumbs and quick utilities (no admin actions) */}
      <div className="sticky top-1 z-10 -mx-4 mb-4 border-b border-black/5 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:border-white/10">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex items-center justify-between py-3">
            <Breadcrumbs
              items={[
                { href: "/", label: "Home" },
                { href: "/articles", label: "Articles" },
                { label: article.title },
              ]}
            />
            <div className="hidden gap-2 md:flex">
              <a href="javascript:window.print()" className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium hover:border-brand/60 dark:border-white/15">Print</a>
              <button id="copy-url-btn" className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium hover:border-brand/60 dark:border-white/15">Copy link</button>
            </div>
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
          <div className="mt-4 inline-flex items-center gap-3 rounded-xl border border-black/10 bg-black/5 px-3 py-2 text-sm text-foreground/70 dark:border-white/10 dark:bg-white/10">
            <div className="size-8 rounded-full bg-gradient-to-br from-brand/60 to-brand/30" />
            <div>
              <div className="font-medium text-foreground">{author}</div>
              <div className="text-xs">Proovia E‑Learning</div>
            </div>
          </div>
        ) : null}

        {article.tags && article.tags.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {article.tags.map((t: string) => (
              <a
                key={t}
                href={`/articles?q=${encodeURIComponent(t)}`}
                className="group inline-flex items-center gap-1 rounded-full border border-black/10 px-3 py-1 text-foreground/70 hover:border-brand/60 hover:text-foreground dark:border-white/15"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-brand/60 transition group-hover:bg-brand" />
                #{t}
              </a>
            ))}
          </div>
        ) : null}
      </header>

      {/* Content + Right rail */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_280px]">
        <div>
          <div className="my-6 h-px w-full bg-black/10 dark:bg-white/10" />
          <div
            id="article-content"
            className="prose prose-neutral dark:prose-invert max-w-none prose-headings:scroll-mt-28 prose-h1:font-bold prose-h2:mt-10 prose-h3:mt-8 prose-p:text-foreground/90 prose-a:decoration-brand/60 prose-a:underline-offset-4 hover:prose-a:text-foreground prose-img:rounded-xl prose-pre:rounded-xl prose-pre:p-4 prose-code:before:content-none prose-code:after:content-none prose-li:my-1"
            dangerouslySetInnerHTML={{ __html: safeHtml }}
          />
        </div>

        {/* Right rail: professional utilities */}
        <aside className="sticky top-24 hidden self-start md:block">
          <div className="space-y-4">
            {/* TOC */}
            <div className="rounded-2xl border border-black/10 p-4 dark:border-white/10">
              <div className="text-xs font-semibold uppercase tracking-wider text-foreground/60">On this page</div>
              <nav id="toc" className="mt-3 space-y-1 text-sm text-foreground/70">
                <div className="text-foreground/50">Headings will appear as you scroll</div>
              </nav>
            </div>

          

            {/* Feedback */}
            <div className="rounded-2xl border border-black/10 p-4 dark:border-white/10">
              <div className="text-xs font-semibold uppercase tracking-wider text-foreground/60">Feedback</div>
              <p className="mt-2 text-sm text-foreground/70">Was this article helpful?</p>
              <div className="mt-3 flex gap-2">
                <button data-feedback="up" className="rounded-xl border border-black/10 px-3 py-2 text-sm hover:border-brand/60 dark:border-white/15">Yes</button>
                <button data-feedback="down" className="rounded-xl border border-black/10 px-3 py-2 text-sm hover:border-brand/60 dark:border-white/15">No</button>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Inline script to power TOC, progress, share, anchors */}
      <script
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: `(() => {
            const content = document.getElementById('article-content');
            if (!content) return;

            // 1) Reading progress
            const progressEl = document.getElementById('reading-progress');
            const updateProgress = () => {
              const total = content.scrollHeight - window.innerHeight;
              const scrolled = window.scrollY - (content.offsetTop - 80);
              const pct = Math.max(0, Math.min(1, scrolled / (total || 1)));
              if (progressEl) progressEl.style.width = (pct * 100).toFixed(2) + '%';
            };
            updateProgress();
            window.addEventListener('scroll', updateProgress, { passive: true });
            window.addEventListener('resize', updateProgress);

            // 2) Build TOC & add anchors
            const toc = document.getElementById('toc');
            const headings = content.querySelectorAll('h2, h3');
            const mkId = (txt) => txt.toLowerCase().replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-');
            headings.forEach((h) => {
              if (!h.id) h.id = mkId(h.textContent || '');
              // add copy anchor
              const btn = document.createElement('button');
              btn.textContent = '¶';
              btn.setAttribute('aria-label','Copy heading link');
              btn.className = 'ml-2 text-xs text-foreground/40 hover:text-brand';
              btn.addEventListener('click', () => {
                const url = location.origin + location.pathname + '#' + h.id;
                navigator.clipboard?.writeText(url);
              });
              h.appendChild(btn);
            });
            if (toc && headings.length) {
              toc.innerHTML = '';
              headings.forEach((h) => {
                const a = document.createElement('a');
                a.href = '#' + h.id;
                a.textContent = h.textContent || '';
                a.className = (h.tagName === 'H2') ? 'block py-1 hover:text-foreground' : 'block pl-4 py-1 text-foreground/60 hover:text-foreground';
                toc.appendChild(a);
              });
            }

            // 3) Share
            const copy1 = document.getElementById('copy-url-btn');
            const copy2 = document.getElementById('share-copy');
            const doCopy = () => navigator.clipboard?.writeText(location.href);
            copy1?.addEventListener('click', doCopy);
            copy2?.addEventListener('click', doCopy);
            const x = document.getElementById('share-x');
            const tg = document.getElementById('share-tg');
            if (x) x.setAttribute('href', 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(document.title + ' ' + location.href));
            if (tg) tg.setAttribute('href', 'https://t.me/share/url?url=' + encodeURIComponent(location.href) + '&text=' + encodeURIComponent(document.title));

            // 4) Feedback (stub)
            document.querySelectorAll('[data-feedback]').forEach((el) => {
              el.addEventListener('click', (e) => {
                const val = (e.currentTarget).getAttribute('data-feedback');
                alert('Thanks for your feedback: ' + val);
              });
            });
          })();`,
        }}
      />
    </article>
  );
}
