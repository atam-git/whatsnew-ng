'use client';

import { useEffect, useState } from 'react';
import { usePage, useSavePage } from '@/lib/cms/admin-hooks';
import { PAGE_SCHEMAS, type PageField, type PageSection } from '@/lib/cms/page-schema';
import { PageHeader, Card, Button, Field, Input, Textarea, useToast } from './ui';
import { RichTextEditor } from './rich-text-editor';
import { RepeaterField } from './repeater-field';
import { StringListInput } from './field-renderer';

type Data = Record<string, unknown>;

/**
 * Editor for a fixed static page (About, Privacy, Terms, Work with Us).
 * Content only — the slug is fixed and pages cannot be created or deleted here.
 */
export function PageEditor({ id }: { id: string }) {
  const toast = useToast();
  const { data, isLoading } = usePage(id);
  const save = useSavePage();

  const [title, setTitle] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [body, setBody] = useState<any>(null);
  const [structured, setStructured] = useState<Data>({});

  useEffect(() => {
    if (!data) return;
    setTitle(data.title);
    setSeoTitle(data.seoTitle ?? '');
    setSeoDescription(data.seoDescription ?? '');
    setBody(data.body ?? null);
    setStructured((data.data as Data) ?? {});
  }, [data]);

  const sections: PageSection[] = data ? (PAGE_SCHEMAS[data.slug] ?? []) : [];

  const submit = async () => {
    if (!title.trim()) {
      toast('Give the page a title', 'info');
      return;
    }
    try {
      await save.mutateAsync({
        id,
        title,
        seoTitle: seoTitle || undefined,
        seoDescription: seoDescription || undefined,
        body,
        ...(sections.length ? { data: structured } : {}),
      });
      toast('Saved', 'success');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Save failed', 'error');
    }
  };

  if (isLoading) {
    return <div className="border-line bg-surface h-96 animate-pulse rounded-2xl border" />;
  }
  if (!data) {
    return (
      <div>
        <PageHeader backHref="/cms/pages" title="Page not found" />
        <p className="text-muted text-sm">
          This page has not been seeded yet. Run <code>npm run db:seed</code> in the backend.
        </p>
      </div>
    );
  }

  const setField = (key: string, value: unknown) =>
    setStructured((s) => ({ ...s, [key]: value }));

  return (
    <div>
      <PageHeader
        backHref="/cms/pages"
        title={title || data.title}
        subtitle={`Live at /${data.slug}`}
        actions={
          <Button loading={save.isPending} onClick={submit}>
            Save
          </Button>
        }
      />

      <div className="mx-auto max-w-3xl space-y-6">
        <Card title="Basics">
          <div className="space-y-4">
            <Field label="Title" required>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>
            <Field
              label={sections.length ? 'Body / story' : 'Body'}
              hint={
                sections.length
                  ? 'The narrative prose block on the page. Structured sections are below.'
                  : undefined
              }
            >
              <RichTextEditor value={body} onChange={setBody} />
            </Field>
          </div>
        </Card>

        {sections.map((section) => (
          <Card key={section.title} title={section.title}>
            <div className="space-y-4">
              {section.fields.map((f) => (
                <PageFieldControl
                  key={f.key}
                  field={f}
                  value={structured[f.key]}
                  onChange={(v) => setField(f.key, v)}
                />
              ))}
            </div>
          </Card>
        ))}

        <Card title="SEO">
          <div className="space-y-4">
            <Field label="SEO title">
              <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
            </Field>
            <Field label="SEO description">
              <Textarea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                rows={2}
              />
            </Field>
          </div>
        </Card>
      </div>
    </div>
  );
}

function PageFieldControl({
  field,
  value,
  onChange,
}: {
  field: PageField;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  if (field.kind === 'text') {
    return (
      <Field label={field.label} hint={field.help}>
        <Input
          value={String(value ?? '')}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      </Field>
    );
  }

  if (field.kind === 'textarea') {
    return (
      <Field label={field.label} hint={field.help}>
        <Textarea
          rows={3}
          value={String(value ?? '')}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      </Field>
    );
  }

  if (field.kind === 'list') {
    return (
      <Field label={field.label} hint={field.help}>
        <StringListInput
          value={Array.isArray(value) ? (value as string[]) : []}
          onChange={onChange}
          placeholder={field.placeholder}
        />
      </Field>
    );
  }

  if (field.kind === 'repeater') {
    return (
      <div>
        {field.label && (
          <p className="text-ink mb-1.5 text-[13px] font-semibold">{field.label}</p>
        )}
        {field.help && <p className="text-muted mb-2 text-[12px]">{field.help}</p>}
        <RepeaterField
          value={Array.isArray(value) ? (value as Record<string, unknown>[]) : []}
          onChange={onChange}
          fields={field.fields ?? []}
          addLabel={field.addLabel}
        />
      </div>
    );
  }

  if (field.kind === 'group') {
    const obj = (value ?? {}) as Record<string, unknown>;
    return (
      <div className="border-line bg-canvas/40 grid gap-3 rounded-xl border p-3 sm:grid-cols-2">
        {(field.fields ?? []).map((sub) => (
          <Field
            key={sub.key}
            label={sub.label}
            hint={sub.help}
            className={sub.kind === 'textarea' ? 'sm:col-span-2' : undefined}
          >
            {sub.kind === 'textarea' ? (
              <Textarea
                rows={2}
                value={String(obj[sub.key] ?? '')}
                placeholder={sub.placeholder}
                onChange={(e) => onChange({ ...obj, [sub.key]: e.target.value })}
              />
            ) : (
              <Input
                value={String(obj[sub.key] ?? '')}
                placeholder={sub.placeholder}
                onChange={(e) => onChange({ ...obj, [sub.key]: e.target.value })}
              />
            )}
          </Field>
        ))}
      </div>
    );
  }

  return null;
}
