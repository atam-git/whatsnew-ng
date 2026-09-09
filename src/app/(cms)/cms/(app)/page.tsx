import Link from 'next/link';

const CARDS = [
  { label: 'Add a Read', href: '/cms/content/reads' },
  { label: 'Review submissions', href: '/cms/submissions' },
  { label: 'Build this week’s issue', href: '/cms/newsletter' },
  { label: 'Curate the homepage', href: '/cms/homepage' },
];

export default function CmsDashboard() {
  return (
    <div>
      <h1 className="text-xl font-bold">Dashboard</h1>
      <p className="text-muted mt-1 text-sm">
        Editorial workflow: draft → in review → scheduled → published → archived.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="border-line bg-surface rounded-lg border p-4 text-sm font-medium hover:shadow-sm"
          >
            {c.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
