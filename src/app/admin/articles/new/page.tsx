"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RichEditor from "@/components/RichEditor";
import ArticleCard from "@/components/ArticleCard";

export default function NewArticlePage() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState<string>("");
  const [tagsInput, setTagsInput] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState(true);
  const [publishAt, setPublishAt] = useState<string>("");
  const [cardImageUrl, setCardImageUrl] = useState<string>("");
  const [cardX, setCardX] = useState<number>(50);
  const [cardY, setCardY] = useState<number>(50);
  const [deps, setDeps] = useState<Array<{ id: number; name: string }>>([]);
  const router = useRouter();

  const tags = tagsInput
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug, description, department, tags, contentHtml, status: published ? 'published' : 'draft', publishAt, imageUrl: cardImageUrl || undefined, imageX: cardX, imageY: cardY }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to save");
      router.push(`/articles/${json.slug}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  // load departments from API
  useEffect(() => {
    let active = true;
    fetch('/api/departments').then(r => r.json()).then((data) => { if (active) setDeps(Array.isArray(data) ? data : []); });
    return () => { active = false; };
  }, []);

  return (
    <div className="space-y-6 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 h-[calc(100vh-6rem)] overflow-hidden">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New Article</h1>
        <p className="text-sm text-foreground/70">Create content with tags and departments.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-12 h-[calc(100%-2rem)]">
          {/* Left column: content editor */}
          <div className="lg:col-span-8 flex flex-col min-h-0">
            <label className="text-sm">Content</label>
            <div className="flex-1 min-h-0 overflow-auto rounded-xl">
              <RichEditor value={contentHtml} onChange={setContentHtml} />
            </div>
          </div>

          {/* Right column: details */}
          <div className="lg:col-span-4 space-y-4 h-full overflow-auto">
            <div className="space-y-1">
              <label className="text-sm">Title</label>
              <input className="w-full rounded-full border border-black/10 dark:border-white/15 bg-background px-3 py-2 text-sm" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm">Slug (optional)</label>
              <input className="w-full rounded-full border border-black/10 dark:border-white/15 bg-background px-3 py-2 text-sm" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto-generated from title" />
            </div>
            <div className="space-y-1">
              <label className="text-sm">Short description</label>
              <input className="w-full rounded-full border border-black/10 dark:border-white/15 bg-background px-3 py-2 text-sm" value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm">Department</label>
                <select className="w-full rounded-full border border-black/10 dark:border-white/15 bg-background px-3 py-2 text-sm" value={department} onChange={(e) => setDepartment(e.target.value)}>
                  <option value="">— Not set —</option>
                  {deps.map((d) => (<option key={d.id} value={d.name}>{d.name}</option>))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm">Tags (comma separated)</label>
                <input className="w-full rounded-full border border-black/10 dark:border-white/15 bg-background px-3 py-2 text-sm" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="e.g. onboarding, safety, policy" />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="accent-brand" checked={published} onChange={(e) => setPublished(e.target.checked)} />
              Published
            </label>
            <div className="space-y-1">
              <label className="text-sm">Publish at (optional)</label>
              <input type="datetime-local" className="w-full rounded-full border border-black/10 dark:border-white/15 bg-background px-3 py-2 text-sm" value={publishAt} onChange={(e) => setPublishAt(e.target.value)} />
            </div>

            {/* Card image controls + preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm">Card image (PNG, transparent)</label>
                {cardImageUrl && (<button type="button" onClick={() => setCardImageUrl("")} className="text-xs rounded-full border border-black/10 dark:border-white/15 px-2 py-1 hover:border-brand/60">Remove</button>)}
              </div>
              <div className="flex gap-2">
                <button type="button" className="rounded-full border border-black/10 dark:border-white/15 px-3 py-2 text-xs hover:border-brand/60" onClick={async () => {
                  const input = document.createElement('input');
                  input.type = 'file'; input.accept = 'image/png';
                  input.onchange = async () => { const file = input.files?.[0]; if (!file) return; const fd = new FormData(); fd.append('file', file); const r = await fetch('/api/uploads', { method: 'POST', body: fd }); const j = await r.json(); if (r.ok && j.url) setCardImageUrl(j.url); else alert(j.error || 'Upload failed'); };
                  input.click();
                }}>Upload</button>
                <div className="flex items-center gap-2 text-xs text-foreground/70">
                  <label>X%</label>
                  <input type="number" min={0} max={100} value={cardX} onChange={(e) => setCardX(Number(e.target.value))} className="w-16 rounded-full border border-black/10 dark:border-white/15 bg-background px-2 py-1" />
                  <label>Y%</label>
                  <input type="number" min={0} max={100} value={cardY} onChange={(e) => setCardY(Number(e.target.value))} className="w-16 rounded-full border border-black/10 dark:border-white/15 bg-background px-2 py-1" />
                </div>
              </div>
              <ArticleCard className="w-full" title={title} description={description} department={department} imageUrl={cardImageUrl} imageX={cardX} imageY={cardY} />
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 text-xs text-foreground/60">
                {tags.map((t) => (<span key={t} className="rounded-full border border-black/10 dark:border-white/15 px-2 py-1">#{t}</span>))}
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">{error}</div>
            )}

            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="inline-flex items-center rounded-full bg-brand px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50">{saving ? "Saving…" : "Publish"}</button>
              <button type="button" onClick={() => router.push("/articles")} className="inline-flex items-center rounded-full border border-black/10 dark:border-white/15 px-4 py-2 text-sm font-medium hover:border-brand/60">Cancel</button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
