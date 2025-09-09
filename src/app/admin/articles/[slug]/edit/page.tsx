"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import RichEditor from "@/components/RichEditor";
import ArticleCard from "@/components/ArticleCard";
import Modal from "@/components/Modal";
import Icon from "@/components/Icon";
// departments loaded from API

export default function EditArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState<string>("");
  const [tagsInput, setTagsInput] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [saving, setSaving] = useState(false);
  const [isQuick, setIsQuick] = useState<boolean>(false);
  const [published, setPublished] = useState(true);
  const [publishAt, setPublishAt] = useState<string>("");
  const [cardImageUrl, setCardImageUrl] = useState<string>("");
  const [cardX, setCardX] = useState<number>(50);
  const [cardY, setCardY] = useState<number>(50);
  const [deps, setDeps] = useState<Array<{ id: number; name: string }>>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [versions, setVersions] = useState<Array<{ id: number; createdAt: string; title: string }>>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);

  async function openHistory() {
    setHistoryOpen(true);
    setLoadingVersions(true);
    try {
      const r = await fetch(`/api/articles/${slug}/versions`);
      const data = await r.json();
      setVersions(Array.isArray(data) ? data : []);
    } finally {
      setLoadingVersions(false);
    }
  }

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/api/articles/${slug}`)
      .then(async (r) => {
        if (!r.ok) throw new Error("Failed to load article");
        return r.json();
      })
      .then((data) => {
        if (!active) return;
        setTitle(data.title || "");
        setNewSlug(data.slug || "");
        setDescription(data.description || "");
        setDepartment(data.department || "");
        setTagsInput(Array.isArray(data.tags) ? data.tags.join(", ") : "");
        setContentHtml(data.contentHtml || "");
        setPublished((data.status || 'published') === 'published');
        setPublishAt(data.publishAt || "");
        setCardImageUrl(data.imageUrl || "");
        setCardX(typeof data.imageX === 'number' ? data.imageX : 50);
        setCardY(typeof data.imageY === 'number' ? data.imageY : 50);
        setError(null);
      })
      .catch((e) => setError(e.message || "Failed to load"))
      .finally(() => setLoading(false));
    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    let live = true;
    fetch(`/api/quick-articles/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (!live) return;
        setIsQuick(!!data.isQuick);
      })
      .catch(() => setIsQuick(false));
    return () => {
      live = false;
    };
  }, [slug]);

  useEffect(() => {
    let active = true;
    fetch('/api/departments').then(r => r.json()).then((data) => { if (active) setDeps(Array.isArray(data) ? data : []); });
    return () => { active = false; };
  }, []);

  const tags = tagsInput
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/articles/${slug}` , {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug: newSlug, description, department, tags, contentHtml, status: published ? 'published' : 'draft', publishAt, imageUrl: cardImageUrl || undefined, imageX: cardX, imageY: cardY }),
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

  async function addToQuick() {
    const res = await fetch(`/api/quick-articles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    if (res.ok) setIsQuick(true);
    else {
      const j = await res.json().catch(() => ({}));
      alert(j.error || "Failed to add to quick links");
    }
  }

  async function removeFromQuick() {
    const res = await fetch(`/api/quick-articles/${slug}`, { method: "DELETE" });
    if (res.ok) setIsQuick(false);
  }

  if (loading) return <div>Loading…</div>;

  return (
    <div className="space-y-6 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 h-[calc(100vh-6rem)] overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Edit Article</h1>
          <p className="text-sm text-foreground/70">Update content, tags and department.</p>
        </div>
        <button type="button" onClick={openHistory} className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/15 px-3 py-2 text-xs hover:border-brand/60">
          <Icon name="history" />
          History
        </button>
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
              <label className="text-sm">Slug</label>
              <input className="w-full rounded-full border border-black/10 dark:border-white/15 bg-background px-3 py-2 text-sm" value={newSlug} onChange={(e) => setNewSlug(e.target.value)} required />
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
              <span className="inline-flex items-center gap-1"><Icon name="check" /> Published</span>
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
                  const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/png';
                  input.onchange = async () => { const file = input.files?.[0]; if (!file) return; const fd = new FormData(); fd.append('file', file); const r = await fetch('/api/uploads', { method: 'POST', body: fd }); const j = await r.json(); if (r.ok && j.url) setCardImageUrl(j.url); else alert(j.error || 'Upload failed'); };
                  input.click();
                }}><span className="inline-flex items-center gap-2"><Icon name="upload" /> Upload</span></button>
                <div className="flex items-center gap-2 text-xs text-foreground/70">
                  <label>X%</label>
                  <input type="number" min={0} max={100} value={cardX} onChange={(e) => setCardX(Number(e.target.value))} className="w-16 rounded-full border border-black/10 dark:border-white/15 bg-background px-2 py-1" />
                  <label>Y%</label>
                  <input type="number" min={0} max={100} value={cardY} onChange={(e) => setCardY(Number(e.target.value))} className="w-16 rounded-full border border-black/10 dark:border-white/15 bg-background px-2 py-1" />
                </div>
              </div>
              <ArticleCard className="w-full" title={title} description={description} department={department} imageUrl={cardImageUrl} imageX={cardX} imageY={cardY} />
            </div>

            {/* Quick links actions */}
            <div className="flex gap-3">
              {isQuick ? (
                <button type="button" onClick={removeFromQuick} className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/15 px-4 py-2 text-sm font-medium hover:border-brand/60"><Icon name="star" /> Remove from quick</button>
              ) : (
                <button type="button" onClick={addToQuick} className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/15 px-4 py-2 text-sm font-medium hover:border-brand/60"><Icon name="star" /> Add to quick</button>
              )}
            </div>

            {error && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">{error}</div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"><Icon name="save" /> {saving ? "Saving…" : "Save Changes"}</button>
              <button type="button" onClick={() => router.push(`/articles/${slug}`)} className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/15 px-4 py-2 text-sm font-medium hover:border-brand/60"><Icon name="x" /> Cancel</button>
            </div>
          </div>
        </div>
      </form>

      <Modal open={historyOpen} onClose={() => setHistoryOpen(false)} title="Version History">
        {loadingVersions ? (
          <div className="text-sm text-foreground/70">Loading…</div>
        ) : versions.length === 0 ? (
          <div className="text-sm text-foreground/70">No versions yet.</div>
        ) : (
          <ul className="divide-y divide-black/10 dark:divide-white/10">
            {versions.map((v) => (
              <li key={v.id} className="flex items-center justify-between py-2">
                <div className="min-w-0">
                  <div className="font-medium truncate">{v.title}</div>
                  <div className="text-xs text-foreground/60">{new Date(v.createdAt).toLocaleString()}</div>
                </div>
                <button
                  onClick={async () => {
                    const r = await fetch(`/api/articles/versions/${v.id}`, { method: 'POST' });
                    const j = await r.json();
                    if (r.ok) router.push(`/articles/${j.slug}`); else alert(j.error || 'Revert failed');
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/15 px-3 py-1 text-xs hover:border-brand/60"
                >
                  Revert
                </button>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </div>
  );
}

//
