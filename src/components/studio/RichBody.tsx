"use client";

import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extensions";
import { Markdown } from "@tiptap/markdown";
import { FileButton } from "./Fields";

/**
 * Telo posta. Dozvoljeno je samo ono što .prose u globals.css stilizuje (podnaslovi, liste,
 * citat, link, slika), pa tekst iz Studija uvek izgleda kao ostatak bloga.
 */
export function useBodyEditor(markdown: string, onChange: (markdown: string) => void) {
  return useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        strike: false,
        underline: false,
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      Image.configure({ inline: false }),
      Placeholder.configure({ placeholder: "Uvod: 2–3 rečenice, lično, na „ti“. Zašto je ova tema važna baš tebi…" }),
      Markdown,
    ],
    content: markdown,
    contentType: "markdown",
    onUpdate: ({ editor }) => onChange(editor.getMarkdown()),
  });
}

export function BodyContent({ editor }: { editor: Editor | null }) {
  return <EditorContent editor={editor} className="studio-body" />;
}

function ToolButton({
  active,
  onClick,
  label,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`min-w-9 px-2 py-1.5 text-sm transition-colors ${
        active ? "bg-negro text-blanco" : "text-negro hover:bg-blanco"
      }`}
    >
      {children}
    </button>
  );
}

export function Toolbar({ editor, onImage }: { editor: Editor | null; onImage: (file: File) => void }) {
  // Editor nastaje tek posle prvog renderovanja (immediatelyRender: false).
  return editor ? <ToolbarButtons editor={editor} onImage={onImage} /> : null;
}

function ToolbarButtons({ editor, onImage }: { editor: Editor; onImage: (file: File) => void }) {
  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      h2: editor.isActive("heading", { level: 2 }),
      h3: editor.isActive("heading", { level: 3 }),
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      link: editor.isActive("link"),
      bullet: editor.isActive("bulletList"),
      ordered: editor.isActive("orderedList"),
      quote: editor.isActive("blockquote"),
    }),
  });
  const chain = () => editor.chain().focus();

  const setLink = () => {
    const previous = editor.getAttributes("link").href ?? "";
    const url = window.prompt("Adresa linka (prazno = ukloni link):", previous);
    if (url === null) return;
    if (!url.trim()) chain().extendMarkRange("link").unsetLink().run();
    else chain().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-1" role="toolbar" aria-label="Oblikovanje teksta">
      <ToolButton label="Podnaslov" active={state.h2} onClick={() => chain().toggleHeading({ level: 2 }).run()}>
        <span className="font-display text-base">H2</span>
      </ToolButton>
      <ToolButton label="Manji podnaslov" active={state.h3} onClick={() => chain().toggleHeading({ level: 3 }).run()}>
        <span className="font-display text-base italic">H3</span>
      </ToolButton>
      <span className="mx-1 h-5 w-px bg-linija" />
      <ToolButton label="Podebljano" active={state.bold} onClick={() => chain().toggleBold().run()}>
        <b className="font-medium">B</b>
      </ToolButton>
      <ToolButton label="Kurziv" active={state.italic} onClick={() => chain().toggleItalic().run()}>
        <i className="font-display text-base">I</i>
      </ToolButton>
      <ToolButton label="Link" active={state.link} onClick={setLink}>
        <span className="underline decoration-naranja underline-offset-2">link</span>
      </ToolButton>
      <span className="mx-1 h-5 w-px bg-linija" />
      <ToolButton label="Lista" active={state.bullet} onClick={() => chain().toggleBulletList().run()}>
        •—
      </ToolButton>
      <ToolButton label="Numerisana lista" active={state.ordered} onClick={() => chain().toggleOrderedList().run()}>
        1.
      </ToolButton>
      <ToolButton label="Citat" active={state.quote} onClick={() => chain().toggleBlockquote().run()}>
        <span className="font-display text-lg leading-none">“</span>
      </ToolButton>
      <FileButton onFile={onImage} className="min-w-9 px-2 py-1.5 text-sm text-negro hover:bg-blanco">
        + fotografija
      </FileButton>
      <span className="mx-1 h-5 w-px bg-linija" />
      <ToolButton label="Poništi" onClick={() => chain().undo().run()}>
        ↶
      </ToolButton>
      <ToolButton label="Vrati" onClick={() => chain().redo().run()}>
        ↷
      </ToolButton>
    </div>
  );
}
