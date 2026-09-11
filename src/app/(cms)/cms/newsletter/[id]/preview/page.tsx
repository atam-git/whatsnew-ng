import Image from 'next/image';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { env } from '@/lib/env';
import { CloseButton } from './close-button';

async function getIssuePreview(id: string) {
  try {
    const cookieHeader = (await headers()).get('cookie') ?? '';
    const res = await fetch(`${env.apiUrl}/api/v1/newsletter/issues/${id}`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function NewsletterPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const issue = await getIssuePreview(id);

  if (!issue) notFound();

  const previewUrl = `/api/v1/newsletter/issues/${id}/preview`;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Newsletter Preview</h1>
          <CloseButton />
        </div>

        {/* Before it's opened - Inbox preview */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Before it&apos;s opened
          </p>
          <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-red-50">
              <Image 
                src="/Whatsnew.ng.png" 
                alt="Whatsnew.ng" 
                width={72} 
                height={48} 
                className="h-6 w-auto" 
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-sm font-semibold text-gray-900">
                  Whatsnew.ng
                </span>
                <span className="shrink-0 text-xs text-gray-500">now</span>
              </div>
              <p className="mt-1 truncate text-sm">
                <span className="font-semibold text-gray-900">
                  {issue.subject || 'Untitled issue'}
                </span>
                {issue.previewText && (
                  <span className="text-gray-600"> - {issue.previewText}</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Once opened - Email body */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Once opened
          </p>
          <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
            <iframe
              src={previewUrl}
              title="Email preview"
              className="h-[80vh] w-full bg-white"
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
