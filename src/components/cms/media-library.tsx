'use client';

import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { UploadCloud, Copy, Check } from 'lucide-react';
import {
  useMediaLibrary,
  useUpdateMedia,
  useDeleteMedia,
  type MediaRow,
} from '@/lib/cms/admin-hooks';
import { uploadMedia } from '@/lib/cms/hooks';
import { PageHeader, Button, SearchInput, Field, Input, Dialog, EmptyState, Spinner, useToast, useConfirm } from './ui';
import { formatDate } from '@/lib/utils/format';

const kb = (n?: number | null) => (n == null ? '—' : n < 1024 * 1024 ? `${Math.round(n / 1024)} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`);

export function MediaLibrary() {
  const [q, setQ] = useState('');
  const [active, setActive] = useState<MediaRow | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();
  const toast = useToast();
  const { data, isLoading } = useMediaLibrary(q);

  const doUpload = async (files: FileList) => {
    setUploading(true);
    try {
      for (const f of Array.from(files)) await uploadMedia(f);
      await qc.invalidateQueries({ queryKey: ['media'] });
      toast(`Uploaded ${files.length} file${files.length > 1 ? 's' : ''}`, 'success');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Media library"
        subtitle={data ? `${data.meta.total} files` : undefined}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => e.target.files?.length && doUpload(e.target.files)}
      />

      <div className="mb-4 flex items-center gap-2">
        <SearchInput value={q} onChange={setQ} placeholder="Search alt text…" className="max-w-xs flex-1" />
        <Button loading={uploading} onClick={() => fileRef.current?.click()}>
          <UploadCloud className="h-4 w-4" /> Upload
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner className="text-muted" />
        </div>
      ) : (data?.data.length ?? 0) === 0 ? (
        <EmptyState title="No media yet" description="Upload images to use as covers and gallery shots." />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {data!.data.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setActive(m)}
              className="border-line hover:border-brand-600 group overflow-hidden rounded-xl border text-left transition"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.url} alt={m.alt ?? ''} className="bg-canvas aspect-square w-full object-cover" />
              <span className="text-muted block truncate px-2 py-1.5 text-[11px]">
                {m.alt || m.key.split('/').pop()}
              </span>
            </button>
          ))}
        </div>
      )}

      {active && <MediaDetail key={active.id} media={active} onClose={() => setActive(null)} />}
    </div>
  );
}

function MediaDetail({ media, onClose }: { media: MediaRow; onClose: () => void }) {
  const update = useUpdateMedia();
  const del = useDeleteMedia();
  const toast = useToast();
  const confirm = useConfirm();
  const [alt, setAlt] = useState(media.alt ?? '');
  const [copied, setCopied] = useState(false);

  return (
    <Dialog
      open
      onClose={onClose}
      title="Media details"
      size="lg"
      footer={
        <div className="flex w-full items-center justify-between">
          <Button
            variant="danger"
            size="sm"
            onClick={async () => {
              const ok = await confirm({
                title: 'Delete this file?',
                message: 'Content still referencing it will lose its image.',
                danger: true,
                confirmLabel: 'Delete',
              });
              if (!ok) return;
              await del.mutateAsync(media.id);
              toast('Deleted', 'success');
              onClose();
            }}
          >
            Delete
          </Button>
          <Button
            size="sm"
            loading={update.isPending}
            onClick={async () => {
              await update.mutateAsync({ id: media.id, alt });
              toast('Saved', 'success');
              onClose();
            }}
          >
            Save
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={media.url} alt="" className="border-line bg-canvas w-full self-start rounded-xl border object-contain" />
        <div className="space-y-3">
          <Field label="Alt text" hint="Describe the image for accessibility and SEO.">
            <Input value={alt} onChange={(e) => setAlt(e.target.value)} />
          </Field>
          <dl className="text-[12px]">
            <div className="flex justify-between py-1">
              <dt className="text-muted">Dimensions</dt>
              <dd>{media.width && media.height ? `${media.width}×${media.height}` : '—'}</dd>
            </div>
            <div className="flex justify-between py-1">
              <dt className="text-muted">Size</dt>
              <dd>{kb(media.sizeBytes)}</dd>
            </div>
            <div className="flex justify-between py-1">
              <dt className="text-muted">Type</dt>
              <dd>{media.mimeType}</dd>
            </div>
            <div className="flex justify-between py-1">
              <dt className="text-muted">Uploaded</dt>
              <dd>{formatDate(media.createdAt)}</dd>
            </div>
          </dl>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(media.url);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="border-line text-muted-700 hover:text-ink flex w-full items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-[12px]"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Copy URL'}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
