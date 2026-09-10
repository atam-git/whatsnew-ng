'use client';

import { useCallback, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { UploadCloud, X } from 'lucide-react';
import { Dialog } from './ui/dialog';
import { Button } from './ui/button';
import { SearchInput } from './ui/search-input';
import { Spinner } from './ui/misc';
import { useMedia, uploadMedia, type MediaItem } from '@/lib/cms/hooks';
import { useToast } from './ui/toast';
import { cn } from '@/lib/utils/cn';

const ACCEPT = 'image/png,image/jpeg,image/webp,image/avif,image/gif';
const isImage = (f: File) => /^image\/(png|jpe?g|webp|avif|gif)$/.test(f.type);

/**
 * Upload straight into the content you're editing. Files also land in the shared
 * media library as a side effect; picking an existing one is the secondary path.
 */
function useMediaUpload() {
  const qc = useQueryClient();
  const toast = useToast();
  const [busy, setBusy] = useState<{ done: number; total: number } | null>(null);

  const run = useCallback(
    async (files: FileList | File[]): Promise<MediaItem[]> => {
      const list = Array.from(files).filter((f) => {
        if (isImage(f)) return true;
        toast(`${f.name}: only image files (PNG, JPG, WebP, AVIF, GIF)`, 'error');
        return false;
      });
      if (!list.length) return [];

      const out: MediaItem[] = [];
      setBusy({ done: 0, total: list.length });
      try {
        for (const file of list) {
          try {
            out.push(await uploadMedia(file));
          } catch (e) {
            const why = e instanceof Error ? e.message : 'Upload failed';
            toast(`${file.name}: ${why}`, 'error');
          }
          setBusy((b) => (b ? { ...b, done: b.done + 1 } : b));
        }
        if (out.length) await qc.invalidateQueries({ queryKey: ['media'] });
      } finally {
        setBusy(null);
      }
      return out;
    },
    [qc, toast],
  );

  return { run, busy };
}

// ── Cover image ──────────────────────────────────────────────────────────────

export function MediaField({
  value,
  onChange,
  label = 'Cover image',
}: {
  value?: { id: string; url: string } | null;
  onChange: (media: MediaItem | null) => void;
  label?: string;
}) {
  const [libOpen, setLibOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { run, busy } = useMediaUpload();

  const handleFiles = async (files: FileList | File[]) => {
    const [m] = await run(files);
    if (m) onChange(m);
  };

  return (
    <div>
      <p className="text-ink mb-1.5 text-[13px] font-semibold">{label}</p>

      <input
        ref={fileRef}
        type="file"
        accept={ACCEPT}
        hidden
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files);
          e.target.value = '';
        }}
      />

      {value?.url ? (
        <div className="border-line relative w-full max-w-xs overflow-hidden rounded-xl border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value.url} alt="" className="aspect-[4/3] w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-gradient-to-t from-black/60 to-transparent p-2">
            <Button size="sm" variant="secondary" loading={!!busy} onClick={() => fileRef.current?.click()}>
              Replace
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setLibOpen(true)}>
              Library
            </Button>
            <Button size="sm" variant="secondary" onClick={() => onChange(null)}>
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
          }}
          className={cn(
            'flex aspect-[4/3] w-full max-w-xs flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed px-4 text-center transition',
            dragging ? 'border-brand-500 bg-brand-50' : 'border-line',
          )}
        >
          {busy ? (
            <>
              <Spinner className="text-brand-600" />
              <span className="text-muted text-[12px]">Uploading…</span>
            </>
          ) : (
            <>
              <UploadCloud className="text-muted mb-0.5 h-6 w-6" />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="text-brand-700 text-[13px] font-semibold hover:underline"
              >
                Upload an image
              </button>
              <span className="text-muted text-[11px]">or drag &amp; drop it here</span>
              <button
                type="button"
                onClick={() => setLibOpen(true)}
                className="text-muted hover:text-ink mt-1 text-[11px] underline"
              >
                Choose from library
              </button>
            </>
          )}
        </div>
      )}

      <MediaPickerDialog
        open={libOpen}
        onClose={() => setLibOpen(false)}
        onPick={(m) => {
          onChange(m);
          setLibOpen(false);
        }}
      />
    </div>
  );
}

// ── Gallery (multi) ──────────────────────────────────────────────────────────

export function GalleryField({
  value,
  onChange,
  label = 'Gallery',
}: {
  value: MediaItem[];
  onChange: (media: MediaItem[]) => void;
  label?: string;
}) {
  const [libOpen, setLibOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { run, busy } = useMediaUpload();

  const add = (items: MediaItem[]) => {
    if (!items.length) return;
    const seen = new Set(value.map((v) => v.id));
    const next = [...value, ...items.filter((m) => !seen.has(m.id))];
    if (next.length !== value.length) onChange(next);
  };

  const handleFiles = async (files: FileList | File[]) => add(await run(files));

  return (
    <div>
      <p className="text-ink mb-1.5 text-[13px] font-semibold">{label}</p>

      <input
        ref={fileRef}
        type="file"
        accept={ACCEPT}
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files);
          e.target.value = '';
        }}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          'rounded-xl border border-dashed p-3 transition',
          dragging ? 'border-brand-500 bg-brand-50' : 'border-line',
        )}
      >
        <div className="flex flex-wrap gap-2">
          {value.map((m) => (
            <div
              key={m.id}
              className="border-line group relative h-20 w-24 overflow-hidden rounded-lg border"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.url} alt={m.alt ?? ''} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onChange(value.filter((x) => x.id !== m.id))}
                className="bg-ink/60 absolute right-1 top-1 rounded-full p-0.5 text-white opacity-0 transition group-hover:opacity-100"
                aria-label="Remove"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="border-line text-muted hover:border-brand-500 hover:text-brand-700 flex h-20 w-24 flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-[11px] transition"
          >
            {busy ? (
              <Spinner className="text-brand-600" />
            ) : (
              <>
                <UploadCloud className="h-4 w-4" />
                <span>Upload</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 text-[11px]">
          <span className="text-muted">
            {busy ? `Uploading ${busy.done}/${busy.total}…` : 'Drag & drop images here'}
          </span>
          <button
            type="button"
            onClick={() => setLibOpen(true)}
            className="text-muted hover:text-ink underline"
          >
            Choose from library
          </button>
        </div>
      </div>

      <MediaPickerDialog open={libOpen} multi onClose={() => setLibOpen(false)} onPick={(m) => add([m])} />
    </div>
  );
}

// ── Library picker (secondary path) ──────────────────────────────────────────

function MediaPickerDialog({
  open,
  onClose,
  onPick,
  multi = false,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (m: MediaItem) => void;
  multi?: boolean;
}) {
  const [q, setQ] = useState('');
  const { data, isLoading } = useMedia(q);
  const { run, busy } = useMediaUpload();
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async (files: FileList | File[]) => {
    const items = await run(files);
    items.forEach(onPick);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Choose from library"
      size="xl"
      footer={
        multi ? (
          <div className="flex w-full justify-end">
            <Button size="sm" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : undefined
      }
    >
      <div className="mb-3 flex items-center gap-2">
        <SearchInput value={q} onChange={setQ} placeholder="Search alt text…" className="flex-1" />
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT}
          multiple={multi}
          hidden
          onChange={(e) => {
            if (e.target.files?.length) upload(e.target.files);
            e.target.value = '';
          }}
        />
        <Button size="md" variant="secondary" loading={!!busy} onClick={() => fileRef.current?.click()}>
          <UploadCloud className="h-4 w-4" /> Upload
        </Button>
      </div>

      <div className="max-h-[55vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner className="text-muted" />
          </div>
        ) : (data?.data.length ?? 0) === 0 ? (
          <p className="text-muted py-10 text-center text-sm">No media yet — upload one above.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
            {data!.data.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onPick(m)}
                className="border-line hover:border-brand-600 overflow-hidden rounded-lg border transition"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt={m.alt ?? ''} className="aspect-square w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </Dialog>
  );
}
