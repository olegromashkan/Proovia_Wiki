"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ArticleCard from "@/components/ArticleCard";

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
    </div>
  );
}
