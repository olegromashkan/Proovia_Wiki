import { adminListArticles } from "@/lib/articlesDb";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminArticlesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const q = (sp.q as string) || "";
  const status = ((sp.status as string) || "all") as "draft" | "published" | "all";
  const department = (sp.dep as string) || "";
  const sort = ((sp.sort as string) || "updated") as "updated" | "created";
  const items = adminListArticles({ q, status, department, sort });

  function input(name: string, value: string, type = "text") {
    return `<input type=\"${type}\" name=\"${name}\" value=\"${value}\" class=\"w-full rounded-full border border-black/10 dark:border-white/15 bg-background px-3 py-2 text-sm\"/>`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Articles (Admin)</h1>
          <p className="text-sm text-foreground/70">Search, filter and edit.</p>
        </div>
        <Link href="/admin/articles/new" className="inline-flex items-center rounded-full border border-black/10 dark:border-white/15 px-4 py-2 text-sm hover:border-brand/60">New</Link>
      </div>

      <form method="get" className="grid gap-3 sm:grid-cols-4">
        <div dangerouslySetInnerHTML={{ __html: input('q', q) }} />
        <select name="status" defaultValue={status} className="rounded-full border border-black/10 dark:border-white/15 bg-background px-3 py-2 text-sm">
          <option value="all">All</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <div dangerouslySetInnerHTML={{ __html: input('dep', department) }} />
        <select name="sort" defaultValue={sort} className="rounded-full border border-black/10 dark:border-white/15 bg-background px-3 py-2 text-sm">
          <option value="updated">Updated</option>
          <option value="created">Created</option>
        </select>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-black/10 dark:border-white/15">
        <table className="min-w-full text-sm">
          <thead className="text-foreground/60">
            <tr>
              <th className="px-3 py-2 text-left">Title</th>
              <th className="px-3 py-2 text-left">Department</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Updated</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.slug} className="border-t border-black/5 dark:border-white/10">
                <td className="px-3 py-2">
                  <div className="font-medium"><Link href={`/articles/${a.slug}`} className="hover:text-brand">{a.title}</Link></div>
                  <div className="text-xs text-foreground/60 truncate">{a.description}</div>
                </td>
                <td className="px-3 py-2">{a.department}</td>
                <td className="px-3 py-2">{a.status}</td>
                <td className="px-3 py-2">{a.updatedAt ? new Date(a.updatedAt).toLocaleString() : ''}</td>
                <td className="px-3 py-2">
                  <Link href={`/admin/articles/${a.slug}/edit`} className="rounded-full border border-black/10 dark:border-white/15 px-3 py-1 text-xs hover:border-brand/60">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

