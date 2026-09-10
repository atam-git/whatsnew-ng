'use client';

import { useState } from 'react';
import { Controller, type Control, type UseFormRegister } from 'react-hook-form';
import { X } from 'lucide-react';
import { Field, Input, Textarea, Select, Toggle } from './ui/field';
import type { FieldDef } from '@/lib/cms/content-schema';
import { cn } from '@/lib/utils/cn';

// ── list of strings ──────────────────────────────────────────────────────────
export function StringListInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState('');
  const add = (raw: string) => {
    const parts = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length) onChange([...value, ...parts.filter((p) => !value.includes(p))]);
    setDraft('');
  };
  return (
    <div className="border-line bg-surface focus-within:ring-brand-500/30 flex flex-wrap items-center gap-1.5 rounded-lg border px-2 py-1.5 focus-within:ring-2">
      {value.map((v) => (
        <span
          key={v}
          className="bg-canvas text-muted-700 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[13px]"
        >
          {v}
          <button type="button" onClick={() => onChange(value.filter((x) => x !== v))} aria-label={`Remove ${v}`}>
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            add(draft);
          } else if (e.key === 'Backspace' && !draft && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={() => draft && add(draft)}
        placeholder={value.length ? '' : (placeholder ?? 'Type and press Enter')}
        className="text-ink placeholder:text-muted/70 min-w-[100px] flex-1 bg-transparent py-1 text-sm focus:outline-none"
      />
    </div>
  );
}

// ── key → value map (hours, service times) ───────────────────────────────────
function KeyValueInput({
  value,
  onChange,
}: {
  value: Record<string, string>;
  onChange: (v: Record<string, string>) => void;
}) {
  const rows = Object.entries(value ?? {});
  const set = (i: number, k: string, v: string) => {
    const next = rows.slice();
    next[i] = [k, v];
    onChange(Object.fromEntries(next.filter(([kk]) => kk)));
  };
  return (
    <div className="flex flex-col gap-1.5">
      {rows.map(([k, v], i) => (
        <div key={i} className="flex gap-1.5">
          <Input className="w-32" value={k} placeholder="mon" onChange={(e) => set(i, e.target.value, v)} />
          <Input className="flex-1" value={v} placeholder="9:00–22:00" onChange={(e) => set(i, k, e.target.value)} />
          <button
            type="button"
            onClick={() => onChange(Object.fromEntries(rows.filter((_, j) => j !== i)))}
            className="text-muted hover:text-[--color-danger-600] px-2"
            aria-label="Remove row"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange({ ...(value ?? {}), '': '' })}
        className="text-brand-700 self-start text-[13px] font-medium hover:underline"
      >
        + Add row
      </button>
    </div>
  );
}

// ── dispatcher ───────────────────────────────────────────────────────────────
export function FieldRenderer({
  def,
  control,
  register,
}: {
  def: FieldDef;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  control: Control<any>;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  register: UseFormRegister<any>;
}) {
  const wrapClass = cn(def.span === 2 ? 'sm:col-span-2' : 'sm:col-span-1');

  if (def.kind === 'boolean') {
    return (
      <div className={cn(wrapClass, 'flex items-center pt-6')}>
        <Controller
          control={control}
          name={def.key}
          render={({ field }) => (
            <Toggle checked={!!field.value} onChange={field.onChange} label={def.label} />
          )}
        />
      </div>
    );
  }

  if (def.kind === 'stringList') {
    return (
      <Field label={def.label} hint={def.help} className={wrapClass}>
        <Controller
          control={control}
          name={def.key}
          render={({ field }) => (
            <StringListInput
              value={field.value ?? []}
              onChange={field.onChange}
              placeholder={def.placeholder}
            />
          )}
        />
      </Field>
    );
  }

  if (def.kind === 'keyValue') {
    return (
      <Field label={def.label} hint={def.help} className={wrapClass}>
        <Controller
          control={control}
          name={def.key}
          render={({ field }) => (
            <KeyValueInput value={field.value ?? {}} onChange={field.onChange} />
          )}
        />
      </Field>
    );
  }

  if (def.kind === 'enum') {
    return (
      <Field label={def.label} hint={def.help} required={def.required} className={wrapClass}>
        <Select {...register(def.key, { required: def.required })}>
          <option value="">—</option>
          {def.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </Field>
    );
  }

  if (def.kind === 'textarea') {
    return (
      <Field label={def.label} hint={def.help} required={def.required} className={wrapClass}>
        <Textarea {...register(def.key)} placeholder={def.placeholder} rows={3} />
      </Field>
    );
  }

  const type =
    def.kind === 'int' || def.kind === 'number'
      ? 'number'
      : def.kind === 'datetime'
        ? 'datetime-local'
        : def.kind === 'date'
          ? 'date'
          : 'text';

  return (
    <Field label={def.label} hint={def.help} required={def.required} className={wrapClass}>
      <Input
        type={type}
        step={def.kind === 'number' ? '0.1' : undefined}
        placeholder={def.placeholder}
        {...register(def.key, {
          required: def.required,
          valueAsNumber: def.kind === 'int' || def.kind === 'number',
        })}
      />
    </Field>
  );
}
