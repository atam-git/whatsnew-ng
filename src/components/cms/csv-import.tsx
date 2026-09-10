'use client';

import { useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import { useCities, useTags } from '@/lib/cms/hooks';
import { buildTemplate, parseCsv, csvRowToForm } from '@/lib/cms/csv';
import { Button, useToast } from './ui';

/**
 * Per-category CSV: download a template to fill offline, then upload it to
 * pre-fill the create form. One row = one item; images are added in the form.
 */
export function CsvImport({
  type,
  label,
  onImport,
}: {
  type: string;
  label: string;
  /** All data rows, each already mapped to form values. */
  onImport: (rows: Record<string, unknown>[]) => void;
}) {
  const toast = useToast();
  const { data: cities } = useCities();
  const { data: tags } = useTags();
  const fileRef = useRef<HTMLInputElement>(null);

  const download = () => {
    const blob = new Blob([buildTemplate(type)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const el = document.createElement('a');
    el.href = url;
    el.download = `whatsnew-${type}-template.csv`;
    document.body.appendChild(el);
    el.click();
    el.remove();
    URL.revokeObjectURL(url);
  };

  const onFile = async (file: File) => {
    try {
      const rows = parseCsv(await file.text()).filter((r) => r.some((c) => c.trim() !== ''));
      if (rows.length < 2) {
        toast('CSV needs a header row and at least one filled row.', 'error');
        return;
      }
      const [header, ...data] = rows;
      const cityRefs = (cities ?? []).map((c) => ({ id: c.id, name: c.name }));
      const tagRefs = (tags ?? []).map((t) => ({ id: t.id, name: t.name }));
      const parsed = data.map((r) => csvRowToForm(type, header, r, { cities: cityRefs, tags: tagRefs }));

      onImport(parsed.map((p) => p.values));

      const allWarnings = [...new Set(parsed.flatMap((p) => p.warnings))];
      allWarnings.slice(0, 4).forEach((w) => toast(w, 'error'));
      toast(
        data.length === 1
          ? 'CSV imported - review, add images, then create.'
          : `${data.length} rows loaded - you'll go through them one by one.`,
        allWarnings.length ? 'info' : 'success',
      );
    } catch {
      toast('Could not read that file - is it a CSV?', 'error');
    }
  };

  return (
    <div className="border-line bg-canvas flex flex-wrap items-center gap-2 rounded-lg border border-dashed p-3">
      <span className="text-muted mr-1 text-[13px]">Start from a spreadsheet:</span>
      <input
        ref={fileRef}
        type="file"
        accept=".csv,text/csv"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = '';
        }}
      />
      <Button type="button" size="sm" variant="secondary" onClick={download}>
        <Download className="h-4 w-4" /> {label} template
      </Button>
      <Button type="button" size="sm" variant="secondary" onClick={() => fileRef.current?.click()}>
        <Upload className="h-4 w-4" /> Import CSV
      </Button>
    </div>
  );
}
