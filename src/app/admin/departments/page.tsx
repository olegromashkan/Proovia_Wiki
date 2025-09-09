"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/Icon";

type Department = { id: number; name: string };

export default function AdminDepartmentsPage() {
  const [items, setItems] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/departments");
    const data = await r.json();
    setItems(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const r = await fetch("/api/departments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
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

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Departments</h1>
          <p className="text-sm text-foreground/70">Add or remove departments for articles.</p>
        </div>
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
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50">
            <Icon name="plus" /> {saving ? "Adding…" : "Add"}
          </button>
        </div>
        {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}
      </form>

      <div className="rounded-2xl border border-black/10 dark:border-white/15 overflow-hidden">
        {loading ? (
          <div className="p-4 text-sm text-foreground/70">Loading…</div>
        ) : items.length === 0 ? (
          <div className="p-4 text-sm text-foreground/70">No departments yet.</div>
        ) : (
          <ul className="divide-y divide-black/10 dark:divide-white/10">
            {items.map((d) => (
              <li key={d.id} className="flex items-center justify-between p-3 text-sm">
                <div className="font-medium">{d.name}</div>
                <button onClick={() => remove(d.id)} className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/15 px-3 py-1 text-xs hover:border-brand/60">
                  <Icon name="trash" /> Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
