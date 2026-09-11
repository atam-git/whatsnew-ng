'use client';

import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Heading2,
  Heading3,
  Link2,
  Link2Off,
  Undo2,
  Redo2,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type Doc = Record<string, unknown>;

function Btn({
  active,
  disabled,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-md transition disabled:opacity-40',
        active ? 'bg-brand-600 text-white' : 'text-muted-700 hover:bg-canvas',
      )}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const setLink = () => {
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Link URL', prev ?? 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="border-line flex flex-wrap items-center gap-0.5 border-b px-2 py-1.5">
      <Btn title="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Heading2 className="h-4 w-4" />
      </Btn>
      <Btn title="Heading 3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        <Heading3 className="h-4 w-4" />
      </Btn>
      <span className="bg-line mx-1 h-5 w-px" />
      <Btn title="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold className="h-4 w-4" />
      </Btn>
      <Btn title="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic className="h-4 w-4" />
      </Btn>
      <span className="bg-line mx-1 h-5 w-px" />
      <Btn title="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List className="h-4 w-4" />
      </Btn>
      <Btn title="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered className="h-4 w-4" />
      </Btn>
      <Btn title="Quote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote className="h-4 w-4" />
      </Btn>
      <span className="bg-line mx-1 h-5 w-px" />
      <Btn title="Add link" active={editor.isActive('link')} onClick={setLink}>
        <Link2 className="h-4 w-4" />
      </Btn>
      <Btn title="Remove link" disabled={!editor.isActive('link')} onClick={() => editor.chain().focus().unsetLink().run()}>
        <Link2Off className="h-4 w-4" />
      </Btn>
      <span className="bg-line mx-1 h-5 w-px" />
      <Btn title="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
        <Undo2 className="h-4 w-4" />
      </Btn>
      <Btn title="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
        <Redo2 className="h-4 w-4" />
      </Btn>
    </div>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write the full article…',
}: {
  value?: Doc | null;
  onChange: (doc: Doc) => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        // Tiptap v3's StarterKit bundles Link itself now - configure it here
        // instead of registering a second, separate Link extension.
        link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener' } },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value ?? '',
    editorProps: {
      attributes: {
        class:
          'prose-cms min-h-[220px] px-4 py-3 focus:outline-none text-[15px] leading-relaxed text-ink',
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getJSON() as Doc),
  });

  // Keep editor in sync when the form resets / loads a different record.
  useEffect(() => {
    if (!editor || !value) return;
    const current = JSON.stringify(editor.getJSON());
    if (current !== JSON.stringify(value)) editor.commands.setContent(value, { emitUpdate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, JSON.stringify(value)]);

  if (!editor) {
    return <div className="border-line bg-surface h-[280px] animate-pulse rounded-xl border" />;
  }

  return (
    <div className="border-line bg-surface overflow-hidden rounded-xl border">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
