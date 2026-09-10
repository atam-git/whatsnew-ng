'use client';

import { useEffect, useState } from 'react';
import { useSiteSettings, useSaveSiteSettings, type SiteSettingsRow } from '@/lib/cms/admin-hooks';
import { PageHeader, Card, Field, Input, Button, Spinner, useToast } from './ui';

type Form = {
  contactEmail: string;
  phone: string;
  addressLine: string;
  twitterUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
};

const toForm = (s: SiteSettingsRow): Form => ({
  contactEmail: s.contactEmail ?? '',
  phone: s.phone ?? '',
  addressLine: s.addressLine ?? '',
  twitterUrl: s.twitterUrl ?? '',
  instagramUrl: s.instagramUrl ?? '',
  facebookUrl: s.facebookUrl ?? '',
  tiktokUrl: s.tiktokUrl ?? '',
  youtubeUrl: s.youtubeUrl ?? '',
});

const SOCIALS: [keyof Form, string, string][] = [
  ['twitterUrl', 'Twitter / X', 'https://twitter.com/whatsnewng'],
  ['instagramUrl', 'Instagram', 'https://instagram.com/whatsnewng'],
  ['facebookUrl', 'Facebook', 'https://facebook.com/whatsnewng'],
  ['tiktokUrl', 'TikTok', 'https://tiktok.com/@whatsnewng'],
  ['youtubeUrl', 'YouTube', 'https://youtube.com/@whatsnewng'],
];

export function SettingsView() {
  const toast = useToast();
  const { data, isLoading } = useSiteSettings();
  const save = useSaveSiteSettings();

  const [form, setForm] = useState<Form | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data && !form) setForm(toForm(data));
  }, [data, form]);

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => (f ? { ...f, [k]: e.target.value } : f));

  const dirty = !!data && !!form && JSON.stringify(toForm(data)) !== JSON.stringify(form);

  const onSave = async () => {
    if (!form) return;
    setError(null);
    // Send trimmed values; empty strings clear the optional fields server-side.
    const payload = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, v.trim()]),
    ) as unknown as Partial<SiteSettingsRow>;
    try {
      const res = await save.mutateAsync(payload);
      setForm(toForm(res));
      toast('Settings saved', 'success');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save');
    }
  };

  return (
    <div>
      <PageHeader title="Settings" subtitle="Contact details and social links for the footer and Contact page." />

      {isLoading || !form ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <div className="max-w-2xl space-y-4">
          <Card title="Contact">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Contact email" hint="Shown in the footer and Contact page">
                <Input type="email" value={form.contactEmail} onChange={set('contactEmail')} placeholder="hello@whatsnew.ng" />
              </Field>
              <Field label="Phone" hint="Optional - hidden if blank">
                <Input value={form.phone} onChange={set('phone')} placeholder="+234 …" />
              </Field>
              <Field label="Address line" hint="Optional - hidden if blank" className="sm:col-span-2">
                <Input value={form.addressLine} onChange={set('addressLine')} placeholder="Lagos, Nigeria" />
              </Field>
            </div>
          </Card>

          <Card title="Social links" description="Leave a field blank to hide that icon. Full URLs.">
            <div className="grid gap-4 sm:grid-cols-2">
              {SOCIALS.map(([key, label, ph]) => (
                <Field key={key} label={label}>
                  <Input value={form[key]} onChange={set(key)} placeholder={ph} spellCheck={false} />
                </Field>
              ))}
            </div>
          </Card>

          {error && <p className="text-[13px] text-[--color-danger-600]">{error}</p>}

          <div className="flex items-center gap-3">
            <Button onClick={onSave} loading={save.isPending} disabled={!dirty}>
              Save changes
            </Button>
            {data?.updatedAt && (
              <span className="text-muted text-[12px]">
                Last saved {new Date(data.updatedAt).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
