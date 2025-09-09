import { departments } from "@/data/departments";

export const metadata = {
  title: "Departments | Proovia E‑Learning",
};

export default function DepartmentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Departments</h1>
        <p className="text-sm text-foreground/70">Browse learning by department.</p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {departments.map((name) => (
          <li
            key={name}
            className="rounded-2xl border border-black/10 dark:border-white/15 p-6 hover:border-brand/50 transition-colors"
          >
            <div className="text-brand text-sm font-medium">Department</div>
            <a href={`/articles?dep=${encodeURIComponent(name)}`} className="mt-1 block text-lg font-semibold hover:text-brand">
              {name}
            </a>
            <p className="mt-1 text-sm text-foreground/70">Browse articles for {name}.</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
