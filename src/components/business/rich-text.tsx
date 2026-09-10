import type { ReactNode } from 'react';

/**
 * Minimal renderer for Tiptap / ProseMirror JSON (`content.body`). Covers the
 * nodes the CMS editor produces: paragraph, heading, bullet/ordered lists,
 * blockquote, and text marks (bold, italic, code, link). Unknown nodes fall
 * back to rendering their children so nothing is silently dropped.
 */
type Mark = { type: string; attrs?: Record<string, unknown> };
type Node = {
  type: string;
  content?: Node[];
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: Mark[];
};

function nodeText(node: Node): string {
  if (node.text) return node.text;
  return (node.content ?? []).map(nodeText).join('');
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

/** Pull the h2/h3 headings out of a Tiptap doc, with the same ids RichText emits. */
export function extractHeadings(doc: unknown): { id: string; text: string; level: number }[] {
  if (!doc || typeof doc !== 'object') return [];
  const root = doc as Node;
  return (root.content ?? [])
    .filter((n) => n.type === 'heading')
    .map((n) => {
      const text = nodeText(n);
      return { id: slugify(text), text, level: Number(n.attrs?.level ?? 2) };
    })
    .filter((h) => h.text.length > 0);
}

function withMarks(text: string, marks: Mark[] | undefined, key: number): ReactNode {
  let el: ReactNode = text;
  for (const mark of marks ?? []) {
    if (mark.type === 'bold') el = <strong>{el}</strong>;
    else if (mark.type === 'italic') el = <em>{el}</em>;
    else if (mark.type === 'code')
      el = <code className="bg-canvas rounded px-1 py-0.5 text-[0.9em]">{el}</code>;
    else if (mark.type === 'link') {
      const href = String(mark.attrs?.href ?? '#');
      const external = /^https?:\/\//.test(href);
      el = (
        <a
          href={href}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className="text-brand-600 underline decoration-brand-600/30 underline-offset-2 hover:decoration-brand-600"
        >
          {el}
        </a>
      );
    }
  }
  return <span key={key}>{el}</span>;
}

function children(nodes: Node[] | undefined): ReactNode {
  return (nodes ?? []).map((n, i) => renderNode(n, i));
}

function renderNode(node: Node, key: number): ReactNode {
  switch (node.type) {
    case 'doc':
      return children(node.content);
    case 'paragraph':
      return (
        <p key={key} className="text-muted-700 mt-4 text-[17px] leading-relaxed">
          {children(node.content)}
        </p>
      );
    case 'heading': {
      const level = Number(node.attrs?.level ?? 2);
      const id = slugify(nodeText(node));
      return level <= 2 ? (
        <h2
          id={id}
          key={key}
          className="font-heading text-ink mt-10 scroll-mt-28 text-2xl font-bold"
        >
          {children(node.content)}
        </h2>
      ) : (
        <h3
          id={id}
          key={key}
          className="font-heading text-ink mt-8 scroll-mt-28 text-xl font-bold"
        >
          {children(node.content)}
        </h3>
      );
    }
    case 'bulletList':
      return (
        <ul key={key} className="text-muted-700 mt-4 list-disc space-y-1.5 pl-6 text-[17px]">
          {children(node.content)}
        </ul>
      );
    case 'orderedList':
      return (
        <ol key={key} className="text-muted-700 mt-4 list-decimal space-y-1.5 pl-6 text-[17px]">
          {children(node.content)}
        </ol>
      );
    case 'listItem':
      return (
        <li key={key}>
          {(node.content ?? []).map((c, i) =>
            c.type === 'paragraph' ? <span key={i}>{children(c.content)}</span> : renderNode(c, i),
          )}
        </li>
      );
    case 'blockquote':
      return (
        <blockquote
          key={key}
          className="border-line text-muted-700 mt-4 border-l-4 pl-4 italic"
        >
          {children(node.content)}
        </blockquote>
      );
    case 'text':
      return withMarks(node.text ?? '', node.marks, key);
    case 'hardBreak':
      return <br key={key} />;
    default:
      return node.content ? <div key={key}>{children(node.content)}</div> : null;
  }
}

export function RichText({ doc, className = 'mt-8' }: { doc: unknown; className?: string }) {
  if (!doc || typeof doc !== 'object') return null;
  const root = doc as Node;
  if (!Array.isArray(root.content) || root.content.length === 0) return null;
  return <div className={className}>{renderNode(root, 0)}</div>;
}
