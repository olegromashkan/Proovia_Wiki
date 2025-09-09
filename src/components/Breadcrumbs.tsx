import Link from "next/link";

export type Crumb = { href?: string; label: string };

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-foreground/60">
      {items.map((c, i) => (
        <span key={i}>
          {c.href ? (
            <Link href={c.href} className="hover:text-brand">
              {c.label}
            </Link>
          ) : (
            <span className="text-foreground/80">{c.label}</span>
          )}
          {i < items.length - 1 && <span className="mx-2">/</span>}
        </span>
      ))}
    </nav>
  );
}

