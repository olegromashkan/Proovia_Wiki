"use client";

import { useEffect, useState } from "react";

type QuickLink = { id: number; title: string; href: string; description?: string | null; position: number };

export default function QuickLinksAdminPage() {
  const [items, setItems] = useState<QuickLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [href, setHref] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/quick-links");
    const data = await r.json();
    setItems(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await fetch("/api/quick-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, href, description }),
      });
      if (!r.ok) throw new Error("Failed to add");
      setTitle("");
      setHref("");
      setDescription("");
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    await fetch(`/api/quick-links/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Manage Quick Links</h1>
        <p className="text-sm text-foreground/70">Add or remove links shown on the home page.</p>
      </div>

      <form onSubmit={addItem} className="rounded-2xl border border-black/10 dark:border-white/15 p-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className="w-full rounded-full border border-black/10 dark:border-white/15 bg-background px-3 py-2 text-sm"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            className="w-full rounded-full border border-black/10 dark:border-white/15 bg-background px-3 py-2 text-sm"
            placeholder="https://..."
            value={href}
            onChange={(e) => setHref(e.target.value)}
            required
          />
        </div>
        <input
          className="w-full rounded-full border border-black/10 dark:border-white/15 bg-background px-3 py-2 text-sm"
          placeholder="Short description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center rounded-full bg-brand px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Adding…" : "Add link"}
        </button>
      </form>

      <div className="rounded-2xl border border-black/10 dark:border-white/15">
        {loading ? (
          <div className="p-4 text-sm text-foreground/70">Loading…</div>
        ) : items.length === 0 ? (
          <div className="p-4 text-sm text-foreground/70">No quick links.</div>
        ) : (
          <ul className="divide-y divide-black/10 dark:divide-white/10">
            {items.map((it) => (
              <li key={it.id} className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <div className="font-medium truncate">{it.title}</div>
                  <div className="text-xs text-foreground/60 truncate">{it.href}</div>
                </div>
                <button
                  onClick={() => remove(it.id)}
                  className="inline-flex items-center rounded-full border border-black/10 dark:border-white/15 px-3 py-1 text-xs hover:border-brand/60"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

