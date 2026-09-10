'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowDown, ArrowUp, X, Sparkles, Eye, Send } from 'lucide-react';
import {
  useIssue,
  useUpdateIssue,
  useIssueAction,
  useDeleteIssue,
  useSendTestIssue,
  issuePreviewUrl,
} from '@/lib/cms/admin-hooks';
import { useCities } from '@/lib/cms/hooks';
import { PageHeader, Card, Button, Field, Input, Textarea, Select, Dialog, useToast, useConfirm } from './ui';
import { StatusBadge } from './ui/status-badge';
import { RichTextEditor } from './rich-text-editor';
import { ContentPicker } from './content-picker';

interface Item {
  contentId: string;
  title: string;
  type: string;
  status: string;
}

export function NewsletterEditor({ id }: { id: string }) {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const { data, isLoading } = useIssue(id);
  const update = useUpdateIssue();
  const action = useIssueAction();
  const del = useDeleteIssue();
  const sendTest = useSendTestIssue();
  const cities = useCities();

  const [subject, setSubject] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [cityId, setCityId] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [intro, setIntro] = useState<any>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [dirty, setDirty] = useState(false);
  const [scheduleAt, setScheduleAt] = useState('');
  const [testOpen, setTestOpen] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  useEffect(() => {
    if (!data || dirty) return;
    setSubject(data.subject);
    setPreviewText(data.previewText ?? '');
    setCityId(data.cityId ?? '');
    setIntro(data.intro ?? null);
    setItems(
      data.items.map((i) => ({
        contentId: i.contentId,
        title: i.content.title,
        type: i.content.type,
        status: i.content.status,
      })),
    );
  }, [data, dirty]);

  const sent = data?.status === 'SENT' || data?.status === 'SENDING';
  const ids = useMemo(() => items.map((i) => i.contentId), [items]);

  const move = (idx: number, dir: -1 | 1) => {
    const next = items.slice();
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    setItems(next);
    setDirty(true);
  };

  const save = async () => {
    try {
      await update.mutateAsync({
        id,
        subject,
        previewText: previewText || undefined,
        cityId: cityId || undefined,
        intro,
        contentIds: ids,
      });
      setDirty(false);
      toast('Saved', 'success');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Save failed', 'error');
    }
  };

  const autofill = async () => {
    if (dirty) {
      const ok = await confirm({ title: 'Autofill replaces the current item list. Continue?' });
      if (!ok) return;
    }
    await action.mutateAsync({ id, action: 'autofill' });
    setDirty(false);
    toast('Filled from the last 7 days', 'success');
  };

  if (isLoading) {
    return <div className="border-line bg-surface h-96 animate-pulse rounded-2xl border" />;
  }

  return (
    <div>
      <PageHeader
        backHref="/cms/newsletter"
        title={subject || 'Untitled issue'}
        actions={
          <>
            {data && (
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  const ok = await confirm({ title: 'Delete this issue?', danger: true, confirmLabel: 'Delete' });
                  if (!ok) return;
                  await del.mutateAsync(id);
                  toast('Deleted', 'success');
                  router.push('/cms/newsletter');
                }}
              >
                Delete
              </Button>
            )}
            <Button loading={update.isPending} onClick={save} disabled={sent}>
              Save
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0 space-y-6">
          <Card title="Issue">
            <div className="space-y-4">
              <Field label="Subject line" required>
                <Input value={subject} onChange={(e) => { setSubject(e.target.value); setDirty(true); }} />
              </Field>
              <Field label="Preview text" hint="Shown after the subject in most inboxes.">
                <Textarea
                  value={previewText}
                  rows={2}
                  onChange={(e) => { setPreviewText(e.target.value); setDirty(true); }}
                />
              </Field>
              <Field label="Intro">
                <RichTextEditor value={intro} onChange={(v) => { setIntro(v); setDirty(true); }} />
              </Field>
            </div>
          </Card>

          <Card
            title={`Items (${items.length})`}
            actions={
              <Button size="sm" variant="secondary" loading={action.isPending} onClick={autofill}>
                <Sparkles className="h-4 w-4" /> Autofill
              </Button>
            }
          >
            {items.length === 0 ? (
              <p className="text-muted text-[13px]">No items yet — autofill or search below.</p>
            ) : (
              <ul className="divide-line divide-y">
                {items.map((it, idx) => (
                  <li key={it.contentId} className="flex items-center gap-2 py-2">
                    <span className="text-muted w-5 shrink-0 text-center text-[12px] tabular-nums">{idx + 1}</span>
                    <span className="text-ink min-w-0 flex-1 truncate text-[13px]">{it.title}</span>
                    <span className="text-muted text-[11px] uppercase">{it.type}</span>
                    {it.status !== 'PUBLISHED' && <StatusBadge status={it.status} />}
                    <button type="button" onClick={() => move(idx, -1)} className="text-muted hover:text-ink disabled:opacity-30" disabled={idx === 0}>
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => move(idx, 1)} className="text-muted hover:text-ink disabled:opacity-30" disabled={idx === items.length - 1}>
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => { setItems(items.filter((_, i) => i !== idx)); setDirty(true); }}
                      className="text-muted hover:text-[--color-danger-600]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4">
              <ContentPicker
                excludeIds={ids}
                onAdd={(c) => {
                  setItems([...items, { contentId: c.id, title: c.title, type: c.type, status: c.status }]);
                  setDirty(true);
                }}
              />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Status">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted text-[13px]">State</span>
                <StatusBadge status={data?.status ?? 'DRAFT'} />
              </div>
              {data?.scheduledFor && (
                <p className="text-muted text-[12px]">Scheduled for {new Date(data.scheduledFor).toLocaleString()}</p>
              )}
              {data?.sentAt && (
                <p className="text-muted text-[12px]">Sent {new Date(data.sentAt).toLocaleString()}</p>
              )}
            </div>
          </Card>

          <Card title="Review">
            <div className="space-y-2">
              <p className="text-muted text-[12px]">See exactly what lands in the inbox.</p>
              <Button
                size="sm"
                variant="secondary"
                className="w-full"
                onClick={async () => {
                  if (dirty) await save();
                  window.open(issuePreviewUrl(id), '_blank', 'noopener');
                }}
              >
                <Eye className="h-4 w-4" /> Preview email
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="w-full"
                onClick={async () => {
                  if (dirty) await save();
                  setTestOpen(true);
                }}
              >
                <Send className="h-4 w-4" /> Send a test
              </Button>
            </div>
          </Card>

          <Card title="City edition">
            <Select
              value={cityId}
              onChange={(e) => { setCityId(e.target.value); setDirty(true); }}
              disabled={sent}
            >
              <option value="">All subscribers</option>
              {(cities.data ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </Card>

          {!sent && (
            <Card title="Send">
              <div className="space-y-3">
                <Field label="Schedule for">
                  <Input type="datetime-local" value={scheduleAt} onChange={(e) => setScheduleAt(e.target.value)} />
                </Field>
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full"
                  loading={action.isPending}
                  onClick={async () => {
                    if (!scheduleAt) return;
                    if (dirty) await save();
                    await action.mutateAsync({ id, action: 'schedule', body: { scheduledFor: new Date(scheduleAt).toISOString() } });
                    toast('Scheduled', 'success');
                  }}
                >
                  Schedule
                </Button>
                <Button
                  size="sm"
                  className="w-full"
                  loading={action.isPending}
                  onClick={async () => {
                    const ok = await confirm({
                      title: 'Send this issue now?',
                      message: `It goes to every ${cityId ? 'subscriber in this city' : 'active subscriber'}.`,
                    });
                    if (!ok) return;
                    if (dirty) await save();
                    await action.mutateAsync({ id, action: 'send' });
                    toast('Sending…', 'success');
                  }}
                >
                  Send now
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      <Dialog
        open={testOpen}
        onClose={() => setTestOpen(false)}
        title="Send a test email"
        size="sm"
        footer={
          <div className="flex w-full justify-end">
            <Button
              size="sm"
              loading={sendTest.isPending}
              onClick={async () => {
                try {
                  const res = await sendTest.mutateAsync({ id, email: testEmail || undefined });
                  toast(`Test sent to ${res.email}`, 'success');
                  setTestOpen(false);
                } catch (e) {
                  toast(e instanceof Error ? e.message : 'Could not send test', 'error');
                }
              }}
            >
              Send test
            </Button>
          </div>
        }
      >
        <Field label="To" hint="Leave blank to send to your own admin email.">
          <Input
            type="email"
            autoFocus
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </Field>
      </Dialog>
    </div>
  );
}
