'use client';

import { useState } from 'react';
import { ArrowDown, ArrowUp, X, Plus } from 'lucide-react';
import {
  useShelves,
  useUpsertShelf,
  useSetShelfSlots,
  useDeleteShelf,
  type ShelfRow,
} from '@/lib/cms/admin-hooks';
import { useCities } from '@/lib/cms/hooks';
import { CONTENT_TYPES } from '@/lib/cms/content-schema';
import { CONTENT_PATHS } from '@/lib/api/content';
import { PageHeader, Card, Button, Field, Input, Select, Toggle, EmptyState, Spinner, useToast, useConfirm } from './ui';
import { StatusBadge } from './ui/status-badge';
import { ContentPicker } from './content-picker';
import { Tooltip } from './ui/tooltip';
import { useUnsavedChangesGuard } from './use-unsaved-changes-guard';

const MODES = ['MANUAL', 'AUTO_RECENT', 'AUTO_POPULAR', 'AUTO_TRENDING'] as const;
const TYPE_ENUMS = Object.entries(CONTENT_PATHS).map(([enumVal, path]) => ({
  value: enumVal,
  label: CONTENT_TYPES[path]?.label ?? path,
}));

export function HomepageCuration() {
  const cities = useCities();
  const [cityId, setCityId] = useState('');
  const { data, isLoading } = useShelves(cityId || undefined);
  const upsert = useUpsertShelf();
  const toast = useToast();
  const [adding, setAdding] = useState('');

  const addShelf = async () => {
    if (!adding.trim()) return;
    const key = adding.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');
    await upsert.mutateAsync({
      cityId: cityId || null,
      key,
      title: adding,
      mode: 'MANUAL',
      sortOrder: (data?.length ?? 0) + 1,
      isActive: true,
    });
    toast('Shelf added', 'success');
    setAdding('');
  };

  return (
    <div>
      <PageHeader
        title="Homepage"
        subtitle="Shelves shown on the homepage, per edition."
        actions={
          <Select value={cityId} onChange={(e) => setCityId(e.target.value)} className="w-48">
            <option value="">Everywhere (global)</option>
            {(cities.data ?? []).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner className="text-muted" />
        </div>
      ) : (data?.length ?? 0) === 0 ? (
        <EmptyState title="No shelves for this edition" description="Add one below." />
      ) : (
        <div className="space-y-4">
          {data!.map((shelf, i) => (
            <ShelfCard key={shelf.id} shelf={shelf} index={i} total={data!.length} cityId={cityId || null} />
          ))}
        </div>
      )}

      <div className="border-line mt-4 flex items-end gap-2 rounded-2xl border border-dashed p-4">
        <Field label="Add a shelf" className="flex-1">
          <Input value={adding} onChange={(e) => setAdding(e.target.value)} placeholder="e.g. Editor's picks" />
        </Field>
        <Button loading={upsert.isPending} onClick={addShelf}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>
    </div>
  );
}

function ShelfCard({
  shelf,
  index,
  total,
  cityId,
}: {
  shelf: ShelfRow;
  index: number;
  total: number;
  cityId: string | null;
}) {
  const upsert = useUpsertShelf();
  const setSlots = useSetShelfSlots();
  const removeShelf = useDeleteShelf();
  const toast = useToast();
  const confirm = useConfirm();

  const [title, setTitle] = useState(shelf.title);
  const [mode, setMode] = useState<string>(shelf.mode);
  const [autoContentType, setAutoContentType] = useState(shelf.autoContentType ?? '');
  const [autoLimit, setAutoLimit] = useState(shelf.autoLimit ?? 6);
  const [isActive, setIsActive] = useState(shelf.isActive);
  // Bumped after a successful "Save items" to remount ContentPicker, clearing
  // its search - while adding items, the search deliberately stays put (see
  // ContentPicker) so multiple picks from the same search don't require
  // retyping it each time.
  const [pickerResetKey, setPickerResetKey] = useState(0);
  const [items, setItems] = useState(
    shelf.items.map((it) => ({ id: it.contentId, title: it.content.title, type: it.content.type, status: it.content.status })),
  );
  const [itemsDirty, setItemsDirty] = useState(false);

  // Track if shelf settings have changed
  const isDirty = 
    title !== shelf.title ||
    mode !== shelf.mode ||
    (mode !== 'MANUAL' && (autoContentType !== (shelf.autoContentType ?? '') || autoLimit !== (shelf.autoLimit ?? 6))) ||
    isActive !== shelf.isActive ||
    itemsDirty;

  // Warn before leaving (tab close/refresh, browser Back, in-app link clicks)
  // while this shelf has unsaved changes - including newly-added items.
  useUnsavedChangesGuard(isDirty);

  const saveShelf = async (patch?: Partial<{ sortOrder: number }>) => {
    await upsert.mutateAsync({
      cityId,
      key: shelf.key,
      title,
      mode,
      autoContentType: mode === 'MANUAL' ? undefined : autoContentType || undefined,
      autoLimit: mode === 'MANUAL' ? undefined : Number(autoLimit),
      isActive,
      sortOrder: patch?.sortOrder ?? shelf.sortOrder,
    });
    toast('Shelf saved', 'success');
    setItemsDirty(false);
  };

  const move = (dir: -1 | 1) => saveShelf({ sortOrder: shelf.sortOrder + dir * 1.5 });

  const moveItem = (idx: number, dir: -1 | 1) => {
    const next = items.slice();
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    setItems(next);
    setItemsDirty(true);
  };

  return (
    <Card bodyClassName="p-0">
      <div className="border-line flex flex-wrap items-center gap-2 border-b px-5 py-3">
        <div className="flex items-center gap-1">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-9 max-w-xs font-semibold" />
          <Tooltip content="The heading shown on the homepage for this shelf" />
        </div>
        <div className="flex items-center gap-1">
          <Select value={mode} onChange={(e) => setMode(e.target.value)} className="h-9 w-44">
            {MODES.map((m) => (
              <option key={m} value={m}>{m.replace('_', ' ').toLowerCase()}</option>
            ))}
          </Select>
          <Tooltip content="Manual: you pick items. Auto: system picks based on rules (recent, popular, trending)" />
        </div>
        <div className="flex items-center gap-1">
          <Toggle checked={isActive} onChange={setIsActive} label="Active" />
          <Tooltip content="Turn off to hide this shelf from the homepage" />
        </div>
        <div className="ml-auto flex items-center gap-1">
          <button onClick={() => move(-1)} disabled={index === 0} className="text-muted hover:text-ink disabled:opacity-30" title="Move shelf up">
            <ArrowUp className="h-4 w-4" />
          </button>
          <button onClick={() => move(1)} disabled={index === total - 1} className="text-muted hover:text-ink disabled:opacity-30" title="Move shelf down">
            <ArrowDown className="h-4 w-4" />
          </button>
          <Button size="sm" loading={upsert.isPending} onClick={() => saveShelf()}>
            Save{isDirty && ' *'}
          </Button>
          <button
            onClick={async () => {
              const ok = await confirm({ title: `Delete the "${shelf.title}" shelf?`, danger: true });
              if (!ok) return;
              await removeShelf.mutateAsync(shelf.id);
              toast('Shelf deleted', 'success');
            }}
            className="text-muted hover:text-[--color-danger-600] ml-1"
            title="Delete shelf"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-5">
        {mode === 'MANUAL' ? (
          <>
            {items.length === 0 ? (
              <p className="text-muted text-[13px]">No pinned items yet.</p>
            ) : (
              <ul className="divide-line divide-y">
                {items.map((it, idx) => (
                  <li key={it.id} className="flex items-center gap-2 py-2">
                    <span className="text-muted w-5 text-center text-[12px] tabular-nums">{idx + 1}</span>
                    <span className="text-ink min-w-0 flex-1 truncate text-[13px]">{it.title}</span>
                    <span className="text-muted text-[11px] uppercase">{it.type}</span>
                    {it.status !== 'PUBLISHED' && <StatusBadge status={it.status} />}
                    <button onClick={() => moveItem(idx, -1)} disabled={idx === 0} className="text-muted hover:text-ink disabled:opacity-30">
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button onClick={() => moveItem(idx, 1)} disabled={idx === items.length - 1} className="text-muted hover:text-ink disabled:opacity-30">
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => { setItems(items.filter((_, i) => i !== idx)); setItemsDirty(true); }}
                      className="text-muted hover:text-[--color-danger-600]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-3">
              <ContentPicker
                key={pickerResetKey}
                excludeIds={items.map((i) => i.id)}
                onAdd={(c) => { setItems([...items, { id: c.id, title: c.title, type: c.type, status: c.status }]); setItemsDirty(true); }}
              />
            </div>
            {itemsDirty && (
              <div className="mt-3 flex justify-end">
                <Button
                  size="sm"
                  loading={setSlots.isPending}
                  onClick={async () => {
                    await setSlots.mutateAsync({ id: shelf.id, contentIds: items.map((i) => i.id) });
                    setItemsDirty(false);
                    setPickerResetKey((k) => k + 1);
                    toast('Items saved', 'success');
                  }}
                >
                  Save items
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Content type" hint="Leave blank to mix all types." tooltip="Filter by content type (e.g., only hotels or only events). Leave blank to show all types.">
              <Select value={autoContentType} onChange={(e) => setAutoContentType(e.target.value)}>
                <option value="">All types</option>
                {TYPE_ENUMS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="How many" tooltip="Number of items to show in this shelf (e.g., 6 or 12)">
              <Input type="number" value={autoLimit} onChange={(e) => setAutoLimit(Number(e.target.value))} />
            </Field>
          </div>
        )}
      </div>
    </Card>
  );
}
