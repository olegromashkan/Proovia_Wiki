"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";

type Department = { id: number; name: string };

export default function AdminSettingsPage() {
  const [items, setItems] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  async function load() {
    setLoading(true);
    const r = await fetch("/api/departments");
    const data = await r.json();
    setItems(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const r = await fetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Failed to add");
      setName("");
      await load();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg || "Failed to add");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    await fetch(`/api/departments/${id}`, { method: "DELETE" });
    await load();
  }

  function startEdit(d: Department) {
    setEditing(d.id);
    setEditName(d.name);
    setError(null);
  }

  function cancelEdit() {
    setEditing(null);
    setEditName("");
  }

  async function saveEdit(e: React.FormEvent, id: number) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const r = await fetch(`/api/departments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Failed to save");
      setEditing(null);
      setEditName("");
      await load();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-foreground/70">Manage content configuration and taxonomy.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/quick-links"
          className="rounded-2xl border border-black/10 dark:border-white/15 p-4 hover:border-brand/60"
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            <Icon name="star" /> Quick Links
          </div>
          <p className="mt-1 text-sm text-foreground/70">Manage quick articles on the homepage.</p>
        </Link>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Departments</h2>
          <p className="text-sm text-foreground/70">Add, edit or remove departments used across articles.</p>
        </div>

        <form onSubmit={add} className="rounded-2xl border border-black/10 dark:border-white/15 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <input
              className="flex-1 rounded-full border border-black/10 dark:border-white/15 bg-background px-3 py-2 text-sm"
              placeholder="Department name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              <Icon name="plus" /> {saving ? "Adding…" : "Add"}
            </button>
          </div>
          {error && editing === null && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}
        </form>

        <div className="rounded-2xl border border-black/10 dark:border-white/15 overflow-hidden">
          {loading ? (
            <div className="p-4 text-sm text-foreground/70">Loading…</div>
          ) : items.length === 0 ? (
            <div className="p-4 text-sm text-foreground/70">No departments yet.</div>
          ) : (
            <ul className="divide-y divide-black/10 dark:divide-white/10">
              {items.map((d) => (
                <li key={d.id} className="p-3 text-sm">
                  {editing === d.id ? (
                    <form onSubmit={(e) => saveEdit(e, d.id)} className="flex items-center gap-2">
                      <input
                        className="flex-1 rounded-full border border-black/10 dark:border-white/15 bg-background px-3 py-1 text-sm"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        required
                      />
                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/15 px-3 py-1 text-xs hover:border-brand/60"
                      >
                        <Icon name="check" /> Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/15 px-3 py-1 text-xs hover:border-brand/60"
                      >
                        <Icon name="x" /> Cancel
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{d.name}</div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(d)}
                          className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/15 px-3 py-1 text-xs hover:border-brand/60"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => remove(d.id)}
                          className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/15 px-3 py-1 text-xs hover:border-brand/60"
                        >
                          <Icon name="trash" /> Remove
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        {error && editing !== null && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}
      </div>
    </div>
  );
}


