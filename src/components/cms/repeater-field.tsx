'use client';

import { ArrowDown, ArrowUp, Plus, X } from 'lucide-react';
import { Field, Input, Textarea } from './ui';
import type { PageField } from '@/lib/cms/page-schema';

type Item = Record<string, unknown>;

/** A reorderable list of item-cards, each with a fixed set of text/textarea
 *  sub-fields. Used by the page editor for card grids, principles, lanes, etc. */
export function RepeaterField({
  value,
  onChange,
  fields,
  addLabel = 'Add item',
}: {
  value: Item[];
  onChange: (v: Item[]) => void;
  fields: PageField[];
  addLabel?: string;
}) {
  const items = Array.isArray(value) ? value : [];

  const patch = (i: number, key: string, v: string) => {
    const next = items.slice();
    next[i] = { ...next[i], [key]: v };
    onChange(next);
  };
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = items.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const remove = (i: number) => onChange(items.filter((_, k) => k !== i));
  const add = () => onChange([...items, {}]);

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="border-line bg-canvas/40 rounded-xl border p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-muted text-[11px] font-semibold uppercase tracking-wide">
              {i + 1}
            </span>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="text-muted hover:text-ink disabled:opacity-30"
                aria-label="Move up"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === items.length - 1}
                className="text-muted hover:text-ink disabled:opacity-30"
                aria-label="Move down"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-muted hover:text-[--color-danger-600] ml-1"
                aria-label="Remove"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {fields.map((f) => (
              <Field
                key={f.key}
                label={f.label}
                hint={f.help}
                className={f.kind === 'textarea' ? 'sm:col-span-2' : undefined}
              >
                {f.kind === 'textarea' ? (
                  <Textarea
                    rows={2}
                    value={String(item[f.key] ?? '')}
                    placeholder={f.placeholder}
                    onChange={(e) => patch(i, f.key, e.target.value)}
                  />
                ) : (
                  <Input
                    value={String(item[f.key] ?? '')}
                    placeholder={f.placeholder}
                    onChange={(e) => patch(i, f.key, e.target.value)}
                  />
                )}
              </Field>
            ))}
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="border-line text-muted-700 hover:border-ink hover:text-ink flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed py-2 text-[13px] font-medium transition"
      >
        <Plus className="h-4 w-4" />
        {addLabel}
      </button>
    </div>
  );
}
