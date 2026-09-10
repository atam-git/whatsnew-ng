'use client';

import { cn } from '@/lib/utils/cn';
import { EmptyState, TableSkeleton } from './misc';

export interface Column<T> {
  key: string;
  header: string;
  /** cell renderer */
  cell: (row: T) => React.ReactNode;
  /** width class, e.g. 'w-32' */
  width?: string;
  align?: 'left' | 'right' | 'center';
  /** show as the primary field on the mobile card */
  primary?: boolean;
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  loading,
  onRowClick,
  empty,
  selectable,
  selected,
  onSelectedChange,
}: {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
  empty?: React.ReactNode;
  selectable?: boolean;
  selected?: Set<string>;
  onSelectedChange?: (s: Set<string>) => void;
}) {
  if (loading) return <TableSkeleton />;
  if (rows.length === 0)
    return <>{empty ?? <EmptyState title="Nothing here yet" />}</>;

  const toggle = (id: string) => {
    if (!selected || !onSelectedChange) return;
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectedChange(next);
  };
  const allChecked = selected && rows.every((r) => selected.has(r.id));

  return (
    <div className="border-line bg-surface overflow-hidden rounded-2xl border">
      {/* desktop */}
      <table className="hidden w-full text-sm md:table">
        <thead>
          <tr className="border-line text-muted border-b text-left text-[12px] uppercase tracking-wide">
            {selectable && (
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={!!allChecked}
                  onChange={() =>
                    onSelectedChange?.(allChecked ? new Set() : new Set(rows.map((r) => r.id)))
                  }
                />
              </th>
            )}
            {columns.map((c) => (
              <th
                key={c.key}
                className={cn('px-4 py-3 font-semibold', c.width, {
                  'text-right': c.align === 'right',
                  'text-center': c.align === 'center',
                })}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row)}
              className={cn(
                'border-line/70 border-b last:border-0',
                onRowClick && 'hover:bg-canvas cursor-pointer',
              )}
            >
              {selectable && (
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={!!selected?.has(row.id)}
                    onChange={() => toggle(row.id)}
                  />
                </td>
              )}
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={cn('px-4 py-3', {
                    'text-right': c.align === 'right',
                    'text-center': c.align === 'center',
                  })}
                >
                  {c.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* mobile */}
      <ul className="divide-line divide-y md:hidden">
        {rows.map((row) => (
          <li
            key={row.id}
            onClick={() => onRowClick?.(row)}
            className={cn('px-4 py-3', onRowClick && 'active:bg-canvas cursor-pointer')}
          >
            {columns.map((c) => (
              <div
                key={c.key}
                className={cn(
                  'flex items-baseline justify-between gap-3 py-0.5',
                  c.primary && 'text-ink text-[15px] font-semibold',
                )}
              >
                {!c.primary && <span className="text-muted text-[12px]">{c.header}</span>}
                <span className={cn(!c.primary && 'text-ink text-[13px]')}>{c.cell(row)}</span>
              </div>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}
