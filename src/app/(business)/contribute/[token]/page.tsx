import type { Metadata } from 'next';
import { ApiError, apiGet } from '@/lib/api/client';
import { getCities } from '@/lib/api/content';
import { ContributeDetailForm } from '@/components/business/contribute-detail-form';
import { CATEGORY_FIELDS } from '@/lib/contribute/field-schema';

export const metadata: Metadata = {
  title: 'Contribute',
  robots: { index: false, follow: false },
};

interface FormMeta {
  name: string;
  email: string;
  category: string;
}

export default async function ContributeTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  let meta: FormMeta | null = null;
  let error: string | null = null;
  try {
    meta = await apiGet<FormMeta>(`/contributor-interest/form/${token}`);
  } catch (e) {
    error =
      e instanceof ApiError && e.status === 410
        ? 'This link has expired. Ask us for a new one.'
        : 'This link is invalid or has already been used.';
  }

  if (error || !meta) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-heading text-2xl font-bold text-gray-900">Link not available</h1>
        <p className="mt-3 text-gray-600">{error}</p>
      </div>
    );
  }

  const categoryConfig = CATEGORY_FIELDS[meta.category];
  const cities = await getCities().catch(() => []);

  return (
    <ContributeDetailForm
      token={token}
      name={meta.name}
      categoryLabel={categoryConfig?.label ?? meta.category}
      fields={categoryConfig?.fields ?? []}
      cities={cities}
    />
  );
}
