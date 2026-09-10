'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  useCitiesAdmin,
  useSaveCity,
  useDeleteCity,
  type CityRow,
} from '@/lib/cms/admin-hooks';
import { PageHeader, Button, DataTable, Dialog, Field, Input, Toggle, EmptyState, useToast, useConfirm, type Column } from './ui';

type Draft = Partial<CityRow>;

export function CitiesView() {
  const { data, isLoading } = useCitiesAdmin();
  const save = useSaveCity();
  const del = useDeleteCity();
  const toast = useToast();
  const confirm = useConfirm();
  const [draft, setDraft] = useState<Draft | null>(null);

  const columns: Column<CityRow>[] = [
    { key: 'name', header: 'State', primary: true, cell: (r) => (
      <span>
        {r.name}
        {r.isVirtual && <span className="text-muted ml-1.5 text-[11px]">nationwide</span>}
      </span>
    ) },
    { key: 'slug', header: 'Slug', cell: (r) => <span className="text-muted text-[13px]">{r.slug}</span> },
    { key: 'sortOrder', header: 'Order', width: 'w-16', cell: (r) => <span className="text-muted tabular-nums">{r.sortOrder}</span> },
    { key: 'active', header: 'Active', width: 'w-16', cell: (r) => (r.isActive ? 'Yes' : 'No') },
  ];

  const submit = async () => {
    if (!draft?.name?.trim()) return;
    await save.mutateAsync({
      id: draft.id,
      name: draft.name.trim(),
      slug: draft.slug || undefined,
      state: draft.isVirtual ? undefined : draft.name.trim(),
      sortOrder: draft.sortOrder ?? 0,
      isVirtual: draft.isVirtual ?? false,
      isActive: draft.isActive ?? true,
    });
    toast(draft.id ? 'State updated' : 'State added', 'success');
    setDraft(null);
  };

  return (
    <div>
      <PageHeader
        title="States"
        subtitle="The states content is organised and filtered by. This list is normally fixed."
      />

      <div className="mb-4 flex items-center gap-2">
        <div className="flex-1" />
        <Button onClick={() => setDraft({ isActive: true, sortOrder: (data?.length ?? 0) + 1 })}>
          <Plus className="h-4 w-4" /> New state
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={data ?? []}
        loading={isLoading}
        onRowClick={(r) => setDraft(r)}
        empty={<EmptyState title="No states yet" />}
      />

      <Dialog
        open={!!draft}
        onClose={() => setDraft(null)}
        title={draft?.id ? 'Edit state' : 'New state'}
        footer={
          <div className="flex w-full items-center justify-between">
            {draft?.id ? (
              <Button
                variant="danger"
                size="sm"
                onClick={async () => {
                  const ok = await confirm({
                    title: `Delete ${draft.name}?`,
                    message: 'Content in this state keeps its other states.',
                    danger: true,
                    confirmLabel: 'Delete',
                  });
                  if (!ok) return;
                  await del.mutateAsync(draft.id!);
                  toast('State deleted', 'success');
                  setDraft(null);
                }}
              >
                Delete
              </Button>
            ) : (
              <span />
            )}
            <Button size="sm" loading={save.isPending} onClick={submit}>
              Save
            </Button>
          </div>
        }
      >
        {draft && (
          <div className="space-y-4">
            <Field label="Name" required hint="The state name, e.g. “Lagos”, “FCT”.">
              <Input value={draft.name ?? ''} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Slug" hint="Auto from name if blank.">
                <Input value={draft.slug ?? ''} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} />
              </Field>
              <Field label="Sort order">
                <Input
                  type="number"
                  value={draft.sortOrder ?? 0}
                  onChange={(e) => setDraft({ ...draft, sortOrder: Number(e.target.value) })}
                />
              </Field>
            </div>
            <div className="flex gap-6">
              <Toggle
                checked={!!draft.isVirtual}
                onChange={(v) => setDraft({ ...draft, isVirtual: v })}
                label="Nationwide (no state)"
              />
              <Toggle
                checked={draft.isActive ?? true}
                onChange={(v) => setDraft({ ...draft, isActive: v })}
                label="Active"
              />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
