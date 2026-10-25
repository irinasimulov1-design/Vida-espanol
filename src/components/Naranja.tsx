/** Mala narandža sa zelenim listom: logo i potpis brenda (ravan stil, bez kontura). */
export default function Naranja({ className = "h-6 w-6", title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <circle cx="15" cy="19" r="11" fill="var(--color-naranja)" />
      <path d="M15.5 8.5c0-2 .4-3.6 1.4-5" stroke="var(--color-verde)" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <path d="M16.6 6.2c1.6-3.4 5.6-4.6 9.4-3.4-1.4 3.6-5.4 5.2-9.4 3.4z" fill="var(--color-verde)" />
    </svg>
  );
}
