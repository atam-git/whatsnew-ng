'use client';

import { useEffect, useState } from 'react';
import { CalendarClock } from 'lucide-react';
import {
  useNewsletterSettings,
  useSaveNewsletterSettings,
  type NewsletterSettings,
} from '@/lib/cms/admin-hooks';
import { Card, Field, Input, Toggle, Button, useToast } from './ui';

const PRESETS: { label: string; cron: string }[] = [
  { label: 'Wed 08:00', cron: '0 8 * * 3' },
  { label: 'Fri 07:30', cron: '30 7 * * 5' },
  { label: 'Mon 06:00', cron: '0 6 * * 1' },
  { label: '1st of month, 09:00', cron: '0 9 1 * *' },
];

function fmt(iso: string | null, timezone: string): string {
  if (!iso) return '-';
  try {
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timezone,
    }).format(new Date(iso));
  } catch {
    return new Date(iso).toISOString();
  }
}

export function NewsletterSchedule() {
  const toast = useToast();
  const { data } = useNewsletterSettings();
  const save = useSaveNewsletterSettings();

  const [form, setForm] = useState<{ cron: string; timezone: string; enabled: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data && !form) {
      setForm({ cron: data.cron, timezone: data.timezone, enabled: data.enabled });
    }
  }, [data, form]);

  if (!data || !form) return null;

  const dirty =
    form.cron !== data.cron || form.timezone !== data.timezone || form.enabled !== data.enabled;

  const onSave = async () => {
    setError(null);
    try {
      const res = (await save.mutateAsync({
        cron: form.cron.trim(),
        timezone: form.timezone.trim(),
        enabled: form.enabled,
      })) as NewsletterSettings;
      setForm({ cron: res.cron, timezone: res.timezone, enabled: res.enabled });
      toast('Schedule updated', 'success');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save the schedule');
    }
  };

  return (
    <Card className="mb-4">
      <div className="flex items-start gap-3">
        <div className="bg-brand-50 text-brand-600 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
          <CalendarClock className="h-[18px] w-[18px]" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-ink text-sm font-semibold">Weekly schedule</h3>
          <p className="text-muted text-[13px]">
            When to auto-draft a new issue with the week&apos;s published items. Drafts wait for you
            to review and send - nothing goes out automatically.
          </p>

          <div className="mt-3">
            <Toggle
              checked={form.enabled}
              onChange={(v) => setForm({ ...form, enabled: v })}
              label="Auto-draft a new issue every week"
            />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              label="Cron expression"
              hint="minute · hour · day-of-month · month · day-of-week"
            >
              <Input
                value={form.cron}
                onChange={(e) => setForm({ ...form, cron: e.target.value })}
                disabled={!form.enabled}
                spellCheck={false}
                className="font-mono"
              />
            </Field>
            <Field label="Timezone" hint="IANA name, e.g. Africa/Lagos, Europe/London">
              <Input
                value={form.timezone}
                onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                disabled={!form.enabled}
                spellCheck={false}
              />
            </Field>
          </div>

          {form.enabled && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.cron}
                  type="button"
                  onClick={() => setForm({ ...form, cron: p.cron })}
                  className={`rounded-full border px-2.5 py-1 text-[12px] transition ${
                    form.cron === p.cron
                      ? 'border-brand-600 bg-brand-50 text-brand-700'
                      : 'border-line text-muted hover:border-brand-300 hover:text-ink'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          {error && <p className="mt-3 text-[12px] text-[--color-danger-600]">{error}</p>}

          <div className="mt-4 flex items-center gap-3">
            <Button size="sm" onClick={onSave} loading={save.isPending} disabled={!dirty}>
              Save schedule
            </Button>
            <span className="text-muted text-[12px]">
              {data.enabled ? (
                <>
                  Next run: <span className="text-ink font-medium">{fmt(data.nextRun, data.timezone)}</span>{' '}
                  ({data.timezone})
                </>
              ) : (
                'Auto-draft is paused'
              )}
              {data.updatedBy && ` · last changed by ${data.updatedBy}`}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
