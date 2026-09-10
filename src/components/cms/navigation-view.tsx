'use client';

import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ExternalLink, Plus, X } from 'lucide-react';
import {
  useNavItems,
  useSaveNavItem,
  useDeleteNavItem,
  useReorderNav,
  type NavGroup,
  type NavItemRow,
} from '@/lib/cms/admin-hooks';
import { PageHeader, Card, Button, Dialog, Field, Input, Toggle, Spinner, useToast, useConfirm } from './ui';

const GROUPS: { key: NavGroup; label: string; hint: string }[] = [
  { key: 'HEADER', label: 'Header', hint: 'Top nav links (plus the Location & Categories dropdowns, which are automatic).' },
  { key: 'FOOTER_PRIMARY', label: 'Footer - Sections', hint: 'First footer column.' },
  { key: 'FOOTER_COMPANY', label: 'Footer - Company', hint: 'Second footer column.' },
  { key: 'FOOTER_LEGAL', label: 'Footer - Legal', hint: 'Legal links column.' },
];

interface Draft {
  id?: string;
  group: NavGroup;
  label: string;
  href: string;
  isExternal: boolean;
}

export function NavigationView() {
  const { data, isLoading } = useNavItems();
  const save = useSaveNavItem();
  const del = useDeleteNavItem();
  const reorder = useReorderNav();
  const toast = useToast();
  const confirm = useConfirm();
  const [draft, setDraft] = useState<Draft | null>(null);

  const byGroup = useMemo(() => {
    const m = new Map<NavGroup, NavItemRow[]>();
    for (const it of data ?? []) {
      if (it.parentId) continue; // dropdown children (tags) are managed on the Tags screen
      const arr = m.get(it.group) ?? [];
      arr.push(it);
      m.set(it.group, arr);
    }
    for (const arr of m.values()) arr.sort((a, b) => a.sortOrder - b.sortOrder);
    return m;
  }, [data]);

  const move = (items: NavItemRow[], idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= items.length) return;
    const next = items.slice();
    [next[idx], next[j]] = [next[j], next[idx]];
    reorder.mutate(next.map((i) => i.id));
  };

  const submit = async () => {
    if (!draft?.label.trim() || !draft.href.trim()) {
      toast('Label and link are required', 'info');
      return;
    }
    try {
      await save.mutateAsync({
        id: draft.id,
        group: draft.group,
        label: draft.label.trim(),
        href: draft.href.trim(),
        isExternal: draft.isExternal,
      });
      toast(draft.id ? 'Link updated' : 'Link added', 'success');
      setDraft(null);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Save failed', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="text-muted" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Navigation"
        subtitle="The links in the site header and footer. Changes show on the site within a minute."
      />

      <div className="space-y-6">
        {GROUPS.map((g) => {
          const items = byGroup.get(g.key) ?? [];
          return (
            <Card
              key={g.key}
              title={g.label}
              description={g.hint}
              actions={
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    setDraft({ group: g.key, label: '', href: '', isExternal: false })
                  }
                >
                  <Plus className="h-4 w-4" /> Add link
                </Button>
              }
            >
              {items.length === 0 ? (
                <p className="text-muted text-[13px]">No links in this group.</p>
              ) : (
                <ul className="divide-line divide-y">
                  {items.map((it, idx) => (
                    <li key={it.id} className="flex items-center gap-3 py-2.5">
                      <div className="flex flex-col">
                        <button
                          onClick={() => move(items, idx, -1)}
                          disabled={idx === 0}
                          className="text-muted hover:text-ink disabled:opacity-30"
                          aria-label="Move up"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => move(items, idx, 1)}
                          disabled={idx === items.length - 1}
                          className="text-muted hover:text-ink disabled:opacity-30"
                          aria-label="Move down"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() =>
                          setDraft({
                            id: it.id,
                            group: it.group,
                            label: it.label,
                            href: it.href,
                            isExternal: it.isExternal,
                          })
                        }
                        className="min-w-0 flex-1 text-left"
                      >
                        <span className="text-ink text-[14px] font-medium">{it.label}</span>
                        <span className="text-muted flex items-center gap-1 text-[12px]">
                          {it.href}
                          {it.isExternal && <ExternalLink className="h-3 w-3" />}
                        </span>
                      </button>
                      <button
                        onClick={async () => {
                          const ok = await confirm({
                            title: `Remove “${it.label}”?`,
                            danger: true,
                            confirmLabel: 'Remove',
                          });
                          if (!ok) return;
                          await del.mutateAsync(it.id);
                          toast('Removed', 'success');
                        }}
                        className="text-muted hover:text-[--color-danger-600]"
                        aria-label="Remove"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          );
        })}
      </div>

      <Dialog
        open={!!draft}
        onClose={() => setDraft(null)}
        title={draft?.id ? 'Edit link' : 'New link'}
        footer={
          <div className="flex w-full justify-end">
            <Button size="sm" loading={save.isPending} onClick={submit}>
              Save
            </Button>
          </div>
        }
      >
        {draft && (
          <div className="space-y-4">
            <Field label="Label" required>
              <Input
                autoFocus
                value={draft.label}
                onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                placeholder="What's New"
              />
            </Field>
            <Field label="Link" required hint="A path like /reads, or a full URL for external.">
              <Input
                value={draft.href}
                onChange={(e) => setDraft({ ...draft, href: e.target.value })}
                placeholder="/reads"
              />
            </Field>
            <Toggle
              checked={draft.isExternal}
              onChange={(v) => setDraft({ ...draft, isExternal: v })}
              label="Opens in a new tab (external)"
            />
          </div>
        )}
      </Dialog>
    </div>
  );
}
