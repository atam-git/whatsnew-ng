type Tone = 'plain' | 'surface' | 'pink' | 'brand';

/**
 * Wraps a homepage section. `plain` sits on the page background inside the
 * content column; the others break out to a full-bleed coloured band with the
 * content re-centred. The break-out relies on `html { overflow-x: hidden }`
 * (globals.css) so 100vw never adds a horizontal scrollbar.
 */
export function SectionBand({
  tone = 'plain',
  className = '',
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  if (tone === 'plain') {
    return <section className={`mx-auto max-w-6xl ${className}`}>{children}</section>;
  }

  const bg =
    tone === 'surface'
      ? 'bg-surface'
      : tone === 'pink'
        ? 'bg-brand-50'
        : 'bg-brand-600 text-white';
  const pad = tone === 'brand' ? 'py-16' : 'py-14';

  return (
    <section className={`relative left-1/2 w-screen -translate-x-1/2 ${bg}`}>
      <div className={`mx-auto max-w-6xl px-4 ${pad} ${className}`}>{children}</div>
    </section>
  );
}
