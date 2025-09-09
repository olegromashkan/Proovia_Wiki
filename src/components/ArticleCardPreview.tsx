type Props = {
  title: string;
  description: string;
  department?: string;
  imageUrl?: string;
  imageX?: number;
  imageY?: number;
  className?: string;
};

export default function ArticleCardPreview({
  title,
  description,
  department,
  imageUrl,
  imageX = 50,
  imageY = 50,
  className = "",
}: Props) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-black/10 dark:border-white/15 p-4 aspect-[6/5] ${className}`}>
      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          aria-hidden="true"
          className="pointer-events-none select-none absolute max-w-none"
          style={{ left: `${imageX}%`, top: `${imageY}%`, transform: 'translate(-50%, -50%)', width: '130%' }}
        />
      )}
      <div className="relative z-10 flex h-full flex-col">
        <div className="text-xs uppercase tracking-wide text-foreground/60">{department || 'Article'}</div>
        <h3 className="mt-1 font-medium">{title || 'Title'}</h3>
        <p className="mt-1 text-sm text-foreground/70 line-clamp-4">{description || 'Description'}</p>
      </div>
    </div>
  );
}

