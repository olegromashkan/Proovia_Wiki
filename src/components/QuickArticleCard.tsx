"use client";

import Link from "next/link";
import { useImageGradient } from "@/lib/useImageGradient";

interface Props {
  title: string;
  description: string;
  department?: string;
  href: string;
  imageUrl?: string;
  imageX?: number;
  imageY?: number;
  className?: string;
}

export default function QuickArticleCard({
  title,
  description,
  department,
  href,
  imageUrl,
  imageX = 50,
  imageY = 50,
  className = "",
}: Props) {
  const gradient = useImageGradient(imageUrl);
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-black/10 dark:border-white/15 p-4 flex flex-col transition hover:border-brand/50 h-full ${className}`}
      style={gradient ? { background: gradient } : undefined}
    >
      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          aria-hidden="true"
          className="pointer-events-none select-none absolute max-w-none transition duration-300 ease-out group-hover:blur-xl"
          style={{ left: `${imageX}%`, top: `${imageY}%`, transform: 'translate(-50%, -50%)', width: '130%', willChange: 'filter' }}
        />
      )}
      <div
        className="relative z-10 flex flex-col h-full transition-transform duration-300 ease-out group-hover:scale-[1.03]"
        style={{ willChange: 'transform' }}
      >
        <div className="text-xs uppercase tracking-wide text-foreground/60">{department || "Article"}</div>
        <div className="mt-1 font-medium line-clamp-3">{title}</div>
        <p className="mt-1 text-sm text-foreground/70 line-clamp-4">{description}</p>
        <div className="mt-auto pt-3">
          <Link href={href} className="text-sm text-brand hover:underline">
            Open
          </Link>
        </div>
      </div>
    </div>
  );
}

