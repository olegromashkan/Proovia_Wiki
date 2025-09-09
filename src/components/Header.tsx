"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", label: "Home" },
  { href: "/articles", label: "Articles" },
  { href: "/departments", label: "Departments" },
  { href: "/training", label: "Training" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-black/10 dark:border-white/15 bg-white/70 dark:bg-black/30 backdrop-blur supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-black/25 rounded-b-2xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="inline-block h-2 w-2 rounded-full bg-brand" />
            <span>Proovia E‑Learning</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            {nav.map((item) => {
              const active = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    "transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded-md px-1 " +
                    (active ? "text-brand font-medium" : "text-foreground/80")
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
