/**
 * CSV template + import for the content editor. One row = one item; the import
 * pre-fills the create form so the user can review, add images, and submit.
 */
import { CONTENT_TYPES } from './content-schema';

export interface CsvColumn {
  key: string;
  required: boolean;
  kind: string;
  hint: string;
}

const BASE: CsvColumn[] = [
  { key: 'title', required: true, kind: 'text', hint: 'the name of the thing' },
  { key: 'state', required: true, kind: 'state', hint: 'state name(s); separate with ;  ("Nationwide" = countrywide/online)' },
  { key: 'excerpt', required: false, kind: 'text', hint: 'one sentence for the card' },
  { key: 'body', required: false, kind: 'text', hint: 'a paragraph or two; use a blank line between paragraphs' },
  { key: 'tags', required: false, kind: 'tags', hint: 'tag name(s); separate with ;' },
  { key: 'publishDate', required: false, kind: 'date', hint: 'YYYY-MM-DD' },
  { key: 'externalUrl', required: false, kind: 'url', hint: 'official page for this item' },
  { key: 'source', required: false, kind: 'text', hint: 'only if crediting another publication' },
  { key: 'sourceUrl', required: false, kind: 'url', hint: '' },
];

const KIND_HINT: Record<string, string> = {
  stringList: 'separate values with ;',
  keyValue: 'key=value; key=value',
  boolean: 'true or false',
  int: 'whole number',
  number: 'number',
  datetime: 'YYYY-MM-DDTHH:mm',
  date: 'YYYY-MM-DD',
  url: 'https://…',
  mediaUrl: 'https://…  (or leave blank and upload in the form)',
  text: '',
  textarea: '',
};

export function csvColumns(type: string): CsvColumn[] {
  const cfg = CONTENT_TYPES[type];
  if (!cfg) return BASE;
  const detail: CsvColumn[] = cfg.groups
    .flatMap((g) => g.fields)
    .map((f) => ({
      key: f.key,
      required: !!f.required,
      kind: f.kind,
      hint: f.options ? f.options.map((o) => o.value).join(' | ') : (KIND_HINT[f.kind] ?? ''),
    }));
  return [...BASE, ...detail];
}

// ── CSV write ──────────────────────────────────────────────────────────────
function cell(v: string): string {
  return /[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

/** Header row + one hint/example row the user overwrites. */
export function buildTemplate(type: string): string {
  const cols = csvColumns(type);
  const header = cols.map((c) => c.key + (c.required ? ' (required)' : ''));
  const hints = cols.map((c) => c.hint);
  return [header.map(cell).join(','), hints.map(cell).join(',')].join('\r\n') + '\r\n';
}

// ── CSV parse (RFC-4180-ish) ───────────────────────────────────────────────
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let i = 0;
  let quoted = false;
  const s = text.replace(/^﻿/, '');
  while (i < s.length) {
    const ch = s[i];
    if (quoted) {
      if (ch === '"') {
        if (s[i + 1] === '"') {
          field += '"';
          i += 2;
        } else {
          quoted = false;
          i += 1;
        }
      } else {
        field += ch;
        i += 1;
      }
    } else if (ch === '"') {
      quoted = true;
      i += 1;
    } else if (ch === ',') {
      row.push(field);
      field = '';
      i += 1;
    } else if (ch === '\r') {
      i += 1;
    } else if (ch === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      i += 1;
    } else {
      field += ch;
      i += 1;
    }
  }
  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

// ── Row → form values ──────────────────────────────────────────────────────
type NamedRow = { id: string; name: string };

const textToDoc = (text: string) => ({
  type: 'doc',
  content: text
    .split(/\r?\n\r?\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => ({ type: 'paragraph', content: [{ type: 'text', text: p }] })),
});

const stripKey = (h: string) => h.replace(/\s*\(required\)\s*$/i, '').trim();

export function csvRowToForm(
  type: string,
  headerRow: string[],
  dataRow: string[],
  refs: { cities: NamedRow[]; tags: NamedRow[] },
): { values: Record<string, unknown>; warnings: string[] } {
  const cols = csvColumns(type);
  const idx = new Map(headerRow.map((h, i) => [stripKey(h).toLowerCase(), i]));
  const get = (key: string) => {
    const i = idx.get(key.toLowerCase());
    return i == null ? '' : (dataRow[i] ?? '').trim();
  };

  const values: Record<string, unknown> = {};
  const warnings: string[] = [];
  const byName = (list: NamedRow[], name: string) =>
    list.find((r) => r.name.toLowerCase() === name.toLowerCase());
  const splitList = (v: string) =>
    v
      .split(/;|\n/)
      .map((x) => x.trim())
      .filter(Boolean);

  for (const col of cols) {
    const raw = get(col.key);
    if (!raw) continue;

    if (col.kind === 'state') {
      const ids: string[] = [];
      for (const n of splitList(raw)) {
        const c = byName(refs.cities, n);
        if (c) ids.push(c.id);
        else warnings.push(`State "${n}" not found - add it manually.`);
      }
      if (ids.length) values.cityIds = ids;
      continue;
    }
    if (col.kind === 'tags') {
      const ids: string[] = [];
      for (const n of splitList(raw)) {
        const t = byName(refs.tags, n);
        if (t) ids.push(t.id);
        else warnings.push(`Tag "${n}" not found - add it manually.`);
      }
      if (ids.length) values.tagIds = ids;
      continue;
    }
    if (col.key === 'body') {
      values.body = textToDoc(raw);
      continue;
    }
    if (col.kind === 'stringList') {
      values[col.key] = splitList(raw);
      continue;
    }
    if (col.kind === 'keyValue') {
      const obj: Record<string, string> = {};
      for (const pair of splitList(raw)) {
        const eq = pair.indexOf('=');
        if (eq > 0) obj[pair.slice(0, eq).trim()] = pair.slice(eq + 1).trim();
      }
      values[col.key] = obj;
      continue;
    }
    if (col.kind === 'boolean') {
      values[col.key] = /^(true|yes|y|1)$/i.test(raw);
      continue;
    }
    if (col.kind === 'int' || col.kind === 'number') {
      const n = Number(raw);
      if (Number.isNaN(n)) warnings.push(`"${col.key}" should be a number - skipped.`);
      else values[col.key] = n;
      continue;
    }
    if (col.kind === 'enum') {
      const opt = CONTENT_TYPES[type].groups
        .flatMap((g) => g.fields)
        .find((f) => f.key === col.key)?.options;
      const up = raw.toUpperCase();
      if (opt && !opt.some((o) => o.value === up)) {
        warnings.push(`"${col.key}" must be one of: ${opt.map((o) => o.value).join(', ')} - skipped.`);
      } else {
        values[col.key] = up;
      }
      continue;
    }
    // text / textarea / url / mediaUrl / date / datetime - pass through
    values[col.key] = raw;
  }

  return { values, warnings };
}
