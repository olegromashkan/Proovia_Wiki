"use client";

import { useEffect, useMemo, useState } from "react";
import type { Track } from "@/data/tracks";

type Props = {
  tracks: Track[];
};

function useTrackProgress(trackId: string, moduleIds: string[]) {
  const storageKey = `progress:${trackId}`;
  const [done, setDone] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setDone(new Set(JSON.parse(raw)));
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackId]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(Array.from(done)));
    } catch {
      // ignore
    }
  }, [done, storageKey]);

  const toggle = (id: string) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const progress = useMemo(() => {
    const total = moduleIds.length || 1;
    const count = moduleIds.filter((m) => done.has(m)).length;
    return { count, total, pct: Math.round((count / total) * 100) };
  }, [done, moduleIds]);

  const nextId = useMemo(() => moduleIds.find((m) => !done.has(m)), [done, moduleIds]);

  return { done, toggle, progress, nextId };
}

export default function TrainingTracks({ tracks }: Props) {
  return (
    <div className="space-y-6">
      {tracks.map((t) => (
        <TrackCard key={t.id} track={t} />
      ))}
    </div>
  );
}

function TrackCard({ track }: { track: Track }) {
  const moduleIds = useMemo(() => track.modules.map((m) => m.id), [track.modules]);
  const { done, toggle, progress, nextId } = useTrackProgress(track.id, moduleIds);

  return (
    <section className="rounded-2xl border border-black/10 dark:border-white/15 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{track.title}</h2>
          <p className="mt-1 text-sm text-foreground/70">{track.description}</p>
        </div>
        <div className="text-sm text-foreground/70">
          {progress.count}/{progress.total}
        </div>
      </div>

      <div className="mt-4 h-2 w-full overflow-hidden rounded bg-black/10 dark:bg-white/10">
        <div
          className="h-full bg-brand transition-[width] duration-300"
          style={{ width: `${progress.pct}%` }}
        />
      </div>

      <ul className="mt-4 divide-y divide-black/5 dark:divide-white/10">
        {track.modules.map((m) => {
          const checked = done.has(m.id);
          return (
            <li key={m.id} className="flex items-center justify-between gap-3 py-3">
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  className="size-4 rounded border-black/30 dark:border-white/30 accent-brand"
                  checked={checked}
                  onChange={() => toggle(m.id)}
                />
                <span className={checked ? "line-through text-foreground/50" : ""}>{m.title}</span>
              </label>
              {typeof m.durationMins === "number" && (
                <span className="text-xs text-foreground/60">{m.durationMins} min</span>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex gap-3">
        {nextId ? (
          <button
            className="inline-flex items-center rounded-full bg-brand px-3 py-2 text-xs font-medium text-white hover:opacity-90"
            onClick={() => toggle(nextId)}
          >
            Mark next complete
          </button>
        ) : (
          <span className="text-xs text-foreground/60">Track complete 🎉</span>
        )}
        <button
          className="inline-flex items-center rounded-full border border-black/10 dark:border-white/15 px-3 py-2 text-xs font-medium hover:border-brand/60"
          onClick={() => {
            try {
              localStorage.removeItem(`progress:${track.id}`);
            } finally {
              window.location.reload();
            }
          }}
        >
          Reset
        </button>
      </div>
    </section>
  );
}
