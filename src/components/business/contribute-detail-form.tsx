'use client';

import { useState } from 'react';
import type { City } from '@/lib/api/types';
import type { FieldDef } from '@/lib/contribute/field-schema';

function parseDurationToSeconds(v: string): number | undefined {
  const m = v.trim().match(/^(\d+):([0-5]?\d)$/);
  if (!m) return undefined;
  return Number(m[1]) * 60 + Number(m[2]);
}

function parseKeyValue(v: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of v.split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key && value) out[key] = value;
  }
  return out;
}

/** Coerces a raw form value to the shape the backend detail table expects,
 *  per field kind - mirrors how the CMS's own field inputs already store
 *  these types (comma-split lists, MM:SS → seconds, "key: value" per line). */
function coerce(kind: FieldDef['kind'], raw: string): unknown {
  if (raw === '') return undefined;
  switch (kind) {
    case 'int':
    case 'number':
      return Number(raw);
    case 'boolean':
      return raw === 'true';
    case 'stringList':
      return raw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    case 'duration':
      return parseDurationToSeconds(raw);
    case 'keyValue':
      return parseKeyValue(raw);
    default:
      return raw;
  }
}

async function uploadImage(
  token: string,
  file: File,
): Promise<{ id: string; url: string }> {
  const presign = await fetch(`/api/v1/contributor-interest/upload-presign/${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mimeType: file.type, filename: file.name }),
  }).then((r) => {
    if (!r.ok) throw new Error('Could not start upload');
    return r.json() as Promise<{ key: string; uploadUrl: string; publicUrl: string }>;
  });

  const put = await fetch(presign.uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
  if (!put.ok) throw new Error('Upload failed');

  const dims = await new Promise<{ width?: number; height?: number }>((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({});
    img.src = URL.createObjectURL(file);
  });

  const media = await fetch(`/api/v1/contributor-interest/upload-confirm/${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: presign.key, mimeType: file.type, sizeBytes: file.size, ...dims }),
  }).then((r) => {
    if (!r.ok) throw new Error('Could not save upload');
    return r.json() as Promise<{ id: string; url: string }>;
  });

  return media;
}

function FieldInput({
  def,
  value,
  onChange,
}: {
  def: FieldDef;
  value: string;
  onChange: (v: string) => void;
}) {
  const base =
    'block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20';

  if (def.kind === 'textarea') {
    return (
      <textarea
        rows={3}
        required={def.required}
        placeholder={def.placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={base}
      />
    );
  }
  if (def.kind === 'enum') {
    return (
      <select
        required={def.required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={base}
      >
        <option value="" disabled>
          Choose…
        </option>
        {def.options?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  }
  if (def.kind === 'boolean') {
    return (
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={value === 'true'}
          onChange={(e) => onChange(e.target.checked ? 'true' : 'false')}
          className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
        />
        Yes
      </label>
    );
  }
  if (def.kind === 'date') {
    return (
      <input
        type="date"
        required={def.required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={base}
      />
    );
  }
  if (def.kind === 'datetime') {
    return (
      <input
        type="datetime-local"
        required={def.required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={base}
      />
    );
  }
  if (def.kind === 'int' || def.kind === 'number') {
    return (
      <input
        type="number"
        required={def.required}
        placeholder={def.placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={base}
      />
    );
  }
  if (def.kind === 'url' || def.kind === 'mediaUrl') {
    return (
      <input
        type="url"
        required={def.required}
        placeholder={def.placeholder ?? 'https://…'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={base}
      />
    );
  }
  if (def.kind === 'stringList') {
    return (
      <input
        type="text"
        required={def.required}
        placeholder={def.placeholder ? `${def.placeholder}, …` : 'Separate with commas'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={base}
      />
    );
  }
  if (def.kind === 'duration') {
    return (
      <input
        type="text"
        placeholder={def.placeholder ?? 'mm:ss'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={base}
      />
    );
  }
  if (def.kind === 'keyValue') {
    return (
      <textarea
        rows={3}
        placeholder="One per line, e.g. mon: 9:00–22:00"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={base}
      />
    );
  }
  return (
    <input
      type="text"
      required={def.required}
      placeholder={def.placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={base}
    />
  );
}

export function ContributeDetailForm({
  token,
  name,
  categoryLabel,
  fields,
  cities,
}: {
  token: string;
  name: string;
  categoryLabel: string;
  fields: FieldDef[];
  cities: City[];
}) {
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [cityIds, setCityIds] = useState<string[]>([]);
  const [detail, setDetail] = useState<Record<string, string>>({});
  const [cover, setCover] = useState<{ id: string; url: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [state, setState] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleCity = (id: string) =>
    setCityIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));

  const onCoverChange = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setErrorMsg(null);
    try {
      const media = await uploadImage(token, file);
      setCover(media);
    } catch {
      setErrorMsg('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);
    if (!cityIds.length) {
      setErrorMsg('Pick at least one city or state.');
      return;
    }
    setState('submitting');

    const detailPayload: Record<string, unknown> = {};
    for (const f of fields) {
      const coerced = coerce(f.kind, detail[f.key] ?? '');
      if (coerced !== undefined) detailPayload[f.key] = coerced;
    }

    try {
      const res = await fetch(`/api/v1/contributor-interest/form/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          excerpt: excerpt || undefined,
          cityIds,
          coverImageId: cover?.id,
          detail: detailPayload,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => undefined);
        throw new Error(body?.message ?? 'Something went wrong');
      }
      setState('done');
    } catch (err) {
      setState('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  if (state === 'done') {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-heading text-2xl font-bold text-gray-900">Submitted, thanks!</h1>
        <p className="mt-3 text-gray-600">
          We&apos;ve got your details. We&apos;ll review and publish shortly - this link is now used up.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="mb-8">
        <p className="text-brand-600 text-[13px] font-semibold uppercase tracking-wide">
          {categoryLabel}
        </p>
        <h1 className="font-heading mt-1 text-3xl font-bold text-gray-900">Hey {name} 👋</h1>
        <p className="mt-2 text-gray-600">
          Fill in the details below. This link is single-use, so make sure everything&apos;s right
          before submitting.
        </p>
      </header>

      <form onSubmit={onSubmit} className="space-y-8">
        <section className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Title <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Short description</label>
            <textarea
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              City / state <span className="text-red-600">*</span>
            </label>
            <div className="grid max-h-48 grid-cols-2 gap-2 overflow-y-auto rounded-lg border border-gray-200 p-3 sm:grid-cols-3">
              {cities.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={cityIds.includes(c.id)}
                    onChange={() => toggleCity(c.id)}
                    className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  {c.name}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Cover photo</label>
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover.url} alt="Cover preview" className="h-40 w-full rounded-lg object-cover" />
            ) : (
              <input
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={(e) => onCoverChange(e.target.files?.[0])}
                className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-full file:border-0 file:bg-red-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-red-700 hover:file:bg-red-100"
              />
            )}
            {uploading && <p className="mt-1.5 text-xs text-gray-500">Uploading…</p>}
          </div>
        </section>

        {fields.length > 0 && (
          <section className="space-y-6 border-t border-gray-200 pt-8">
            {fields.map((f) => (
              <div key={f.key}>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {f.label} {f.required && <span className="text-red-600">*</span>}
                </label>
                <FieldInput
                  def={f}
                  value={detail[f.key] ?? ''}
                  onChange={(v) => setDetail((prev) => ({ ...prev, [f.key]: v }))}
                />
                {f.hint && <p className="mt-1.5 text-xs text-gray-500">{f.hint}</p>}
              </div>
            ))}
          </section>
        )}

        {errorMsg && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">{errorMsg}</p>
          </div>
        )}

        <div className="flex items-center justify-between rounded-2xl border-2 border-gray-200 bg-white p-6">
          <p className="text-sm font-medium text-gray-900">Ready to submit?</p>
          <button
            type="submit"
            disabled={state === 'submitting' || uploading}
            className="ml-6 inline-flex items-center rounded-full bg-red-600 px-8 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-red-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            {state === 'submitting' ? 'Submitting…' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
}
