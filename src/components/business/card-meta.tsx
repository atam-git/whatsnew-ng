import type { CardMeta, MetaSeg } from '@/lib/utils/card-meta';

function Star() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="mt-[-1px] h-3.5 w-3.5 shrink-0 fill-amber-500"
      aria-hidden="true"
    >
      <path d="M10 1.6l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.2l-4.95 2.6.94-5.5-4-3.9 5.53-.8z" />
    </svg>
  );
}

function Dot() {
  return <span className="text-muted/40 select-none">·</span>;
}

function Segment({ s }: { s: MetaSeg }) {
  switch (s.kind) {
    case 'rating':
      return (
        <span className="inline-flex items-center gap-1">
          <Star />
          <span className="font-heading text-ink text-[15px] font-bold tabular-nums">
            {s.score.toFixed(1)}
          </span>
          {s.count != null && (
            <span className="text-muted text-[13px]">({s.count.toLocaleString()})</span>
          )}
        </span>
      );
    case 'rank':
      return (
        <span className="inline-flex items-center gap-1">
          <Star />
          <span className="text-ink text-[13px] font-semibold">{s.text}</span>
        </span>
      );
    case 'price':
      return (
        <span className="font-heading text-ink text-[14px] font-semibold tabular-nums">
          {s.amount}
          {s.unit && <span className="text-muted ml-0.5 text-[12px] font-normal">{s.unit}</span>}
        </span>
      );
    case 'priceBadge':
      return (
        <span className="text-muted-700 text-[13px] font-bold tracking-wide">{s.text}</span>
      );
    case 'date':
      return (
        <span className="inline-flex items-baseline gap-1.5">
          <span className="font-heading text-ink text-[12px] font-bold tracking-[0.06em]">
            {s.label}
          </span>
          {s.time && <span className="text-muted text-[13px]">{s.time}</span>}
        </span>
      );
    case 'strong':
      return <span className="text-ink text-[14px] font-medium">{s.text}</span>;
    case 'muted':
      return <span className="text-muted text-[13px]">{s.text}</span>;
    case 'pill':
      return (
        <span
          className={`rounded-md px-1.5 py-[3px] text-[11px] font-bold uppercase tracking-wide ${
            s.accent ? 'bg-brand-50 text-brand-700' : 'bg-canvas text-muted-700'
          }`}
        >
          {s.text}
        </span>
      );
  }
}

const isPill = (s: MetaSeg) => s.kind === 'pill' || s.kind === 'priceBadge';

export function CardMetaRow({ meta }: { meta: CardMeta }) {
  return (
    <div className="mt-1.5 space-y-1">
      {meta.primary.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {meta.primary.map((s, i) => (
            <span key={i} className="inline-flex items-center gap-2">
              {i > 0 && !isPill(s) && !isPill(meta.primary[i - 1]) && <Dot />}
              <Segment s={s} />
            </span>
          ))}
        </div>
      )}
      {meta.secondary && (
        <div className="text-muted truncate text-[13px]">{meta.secondary}</div>
      )}
    </div>
  );
}
