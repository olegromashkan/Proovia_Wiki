"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useImageGradient } from "@/lib/useImageGradient";

type Item = {
  slug: string;
  title: string;
  description: string;
  department?: string;
  tags?: string[];
  imageUrl?: string;
  imageX?: number;
  imageY?: number;
};

type Props = {
  articles: Item[];
  initialQuery?: string;
  initialDepartment?: string;
};

export default function ArticlesExplorer({
  articles,
  initialQuery = "",
  initialDepartment = "",
}: Props) {
  const [q, setQ] = useState(initialQuery);
  const [dep, setDep] = useState(initialDepartment);

  const departments = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((a) => a.department && set.add(a.department));
    return ["All", ...Array.from(set.values())];
  }, [articles]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const depNorm = dep && dep !== "All" ? dep : "";
    return articles.filter((a) => {
      const matchesDep = depNorm ? (a.department || "") === depNorm : true;
      const hay = `${a.title} ${a.description} ${a.department ?? ""} ${(a.tags || []).join(" ")}`.toLowerCase();
      const matchesText = term ? hay.includes(term) : true;
      return matchesDep && matchesText;
    });
  }, [articles, q, dep]);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Sync state to URL (shallow) with small debounce
  useEffect(() => {
    const handle = setTimeout(() => {
      const params = new URLSearchParams(searchParams?.toString() || "");
      if (q) params.set("q", q);
      else params.delete("q");
      if (dep && dep !== "All") params.set("dep", dep);
      else params.delete("dep");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, 150);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, dep]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <input
            className="w-full rounded-full border border-black/10 dark:border-white/15 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/30"
            placeholder="Search articles…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div>
          <label className="mr-2 text-sm text-foreground/70">Department</label>
          <select
            className="rounded-full border border-black/10 dark:border-white/15 bg-background px-3 py-2 text-sm"
            value={dep || (departments[0] ?? "All")}
            onChange={(e) => setDep(e.target.value)}
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div className="text-sm text-foreground/60">{filtered.length} results</div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/10 dark:border-white/15 p-6 text-sm text-foreground/70">
          No results. Try a different search or department.
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <ArticleItem key={a.slug} item={a} />
          ))}
        </ul>
      )}
    </div>
  );
}

type ArticleItemProps = { item: Item };

function ArticleItem({ item }: ArticleItemProps) {
  const gradient = useImageGradient(item.imageUrl);
  return (
    <li
      className="relative overflow-hidden rounded-2xl border border-black/10 dark:border-white/15 p-4 aspect-[6/5]"
      style={gradient ? { background: gradient } : undefined}
    >
      {item.imageUrl && (
        <img
          src={item.imageUrl}
          alt=""
          aria-hidden="true"
          className="pointer-events-none select-none absolute max-w-none"
          style={{ left: `${item.imageX ?? 50}%`, top: `${item.imageY ?? 50}%`, transform: 'translate(-50%, -50%)', width: '130%' }}
        />
      )}
      <div className="relative z-10 flex h-full flex-col">
        <div className="text-xs uppercase tracking-wide text-foreground/60">{item.department}</div>
        <h3 className="mt-1 font-medium">
          <Link href={`/articles/${item.slug}`} className="hover:text-brand">
            {item.title}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-foreground/70 line-clamp-4">{item.description}</p>
        {item.tags && item.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-foreground/60">
            {item.tags.map((t) => (
              <span key={t} className="rounded-full border border-black/10 dark:border-white/15 px-2 py-1">#{t}</span>
            ))}
          </div>
        )}
      </div>
    </li>
  );
}
