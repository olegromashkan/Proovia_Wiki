import Link from "next/link";
import Icon from "@/components/Icon";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-foreground/70">Manage content configuration and taxonomy.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/admin/departments" className="rounded-2xl border border-black/10 dark:border-white/15 p-4 hover:border-brand/60">
          <div className="flex items-center gap-2 text-sm font-medium"><Icon name="tag" /> Departments</div>
          <p className="mt-1 text-sm text-foreground/70">Add/remove departments used across articles.</p>
        </Link>
        <Link href="/admin/quick-links" className="rounded-2xl border border-black/10 dark:border-white/15 p-4 hover:border-brand/60">
          <div className="flex items-center gap-2 text-sm font-medium"><Icon name="star" /> Quick Links</div>
          <p className="mt-1 text-sm text-foreground/70">Manage quick articles on the homepage.</p>
        </Link>
      </div>
    </div>
  );
}

