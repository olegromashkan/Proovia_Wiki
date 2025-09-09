"use client";

import Link from "next/link";
import { useImageGradient } from "@/lib/useImageGradient";

type Props = {
  title: string;
  description: string;
  department?: string;
  imageUrl?: string;
  imageX?: number;
  imageY?: number;
  tags?: string[];
  href?: string;
  className?: string;
};

export default function ArticleCard({
  title,
  description,
  department,
  imageUrl,
  imageX = 50,
  imageY = 50,
  tags,
  href,
  className = "",
}: Props) {
  const gradient = useImageGradient(imageUrl);
  const Wrapper = href ? Link : "div";
  return (
    <Wrapper
      {...(href ? { href } : {})}
      className={`group relative block overflow-hidden rounded-2xl border border-black/10 dark:border-white/15 p-4 aspect-[6/5] ${className}`}
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
        className="relative z-10 flex h-full flex-col transition-transform duration-300 ease-out group-hover:scale-[1.03]"
        style={{ willChange: 'transform' }}
      >
        <div className="text-xs uppercase tracking-wide text-foreground/60">{department || "Article"}</div>
        <h3 className="mt-1 font-medium group-hover:text-brand">
          {title || "Title"}
        </h3>
        <p className="mt-1 text-sm text-foreground/70 line-clamp-4">{description || "Description"}</p>
        {tags && tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-foreground/60">
            {tags.map((t) => (
              <span key={t} className="rounded-full border border-black/10 dark:border-white/15 px-2 py-1">
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>
    </Wrapper>
  );
}

