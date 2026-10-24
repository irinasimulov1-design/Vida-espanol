"use client";

import { useLayoutEffect, useRef, useState, type TextareaHTMLAttributes } from "react";
import type { FaqItem } from "@/lib/posts";

/**
 * Polje koje izgleda kao tekst oko njega (nasleđuje font, boju, veličinu i poravnanje)
 * i raste sa sadržajem — tako naslov u Studiju izgleda kao naslov na sajtu.
 */
export function AutoText({
  value,
  onChange,
  className = "",
  ...props
}: Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange" | "value"> & {
  value: string;
  onChange: (value: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`block w-full resize-none overflow-hidden bg-transparent [color:inherit] [font:inherit] [letter-spacing:inherit] [text-align:inherit] outline-none placeholder:text-current placeholder:opacity-45 focus:bg-blanco/10 ${className}`}
      {...props}
    />
  );
}

export function CategoriesEditor({
  value,
  suggestions,
  onChange,
  light = false,
}: {
  value: string[];
  suggestions: string[];
  onChange: (value: string[]) => void;
  light?: boolean;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const name = draft.trim();
    if (name && !value.includes(name)) onChange([...value, name]);
    setDraft("");
  };

  return (
    <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
      {value.map((cat) => (
        <span key={cat} className="eyebrow flex items-center gap-2 bg-oro px-3 py-1 text-negro">
          {cat}
          <button type="button" aria-label={`Ukloni ${cat}`} onClick={() => onChange(value.filter((c) => c !== cat))}>
            ×
          </button>
        </span>
      ))}
      <input
        list="studio-kategorije"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add();
          }
        }}
        onBlur={add}
        placeholder="+ kategorija"
        className={`eyebrow w-48 border border-dashed bg-transparent px-3 py-1 outline-none ${
          light ? "border-blanco/60 text-blanco placeholder:text-blanco/70" : "border-negro/40 text-negro placeholder:text-negro/50"
        }`}
      />
      <datalist id="studio-kategorije">
        {suggestions.filter((s) => !value.includes(s)).map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
    </div>
  );
}

export function FaqEditor({ value, onChange }: { value: FaqItem[]; onChange: (value: FaqItem[]) => void }) {
  const update = (i: number, item: Partial<FaqItem>) =>
    onChange(value.map((old, j) => (j === i ? { ...old, ...item } : old)));
  const move = (i: number, by: number) => {
    const next = [...value];
    const [item] = next.splice(i, 1);
    next.splice(i + by, 0, item);
    onChange(next);
  };

  return (
    <div className="mt-6">
      <div className="divide-y divide-linija border-y border-linija">
        {value.map((item, i) => (
          <div key={i} className="group py-4">
            <div className="flex items-start justify-between gap-4 font-medium text-negro">
              <AutoText
                value={item.pitanje}
                onChange={(pitanje) => update(i, { pitanje })}
                placeholder="Pitanje onako kako ga ljudi kucaju u Google?"
              />
              <span className="flex shrink-0 gap-2 text-sm text-negro/50">
                <button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Pomeri gore" className="disabled:opacity-30">↑</button>
                <button type="button" disabled={i === value.length - 1} onClick={() => move(i, 1)} aria-label="Pomeri dole" className="disabled:opacity-30">↓</button>
                <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="Ukloni pitanje" className="text-naranja">×</button>
              </span>
            </div>
            <div className="mt-3 leading-relaxed text-negro/80">
              <AutoText
                value={item.odgovor}
                onChange={(odgovor) => update(i, { odgovor })}
                placeholder="Kratak, samostalan odgovor (razumljiv i bez ostatka teksta)."
              />
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="mt-4 text-sm link"
        onClick={() => onChange([...value, { pitanje: "", odgovor: "" }])}
      >
        + Dodaj pitanje
      </button>
    </div>
  );
}

/** Dugme koje otvara izbor fajla (fotografije). */
export function FileButton({
  onFile,
  children,
  className,
}: {
  onFile: (file: File) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <button type="button" className={className} onClick={() => input.current?.click()}>
        {children}
      </button>
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />
    </>
  );
}
