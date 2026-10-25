/** Tenda (toldo): vertikalne pruge verde/fondo sa polukružnim donjim ivicama, iznad crnog footera. */
export default function Tenda() {
  return (
    <svg aria-hidden="true" className="block h-7 w-full md:h-9" preserveAspectRatio="none">
      <defs>
        <pattern id="tenda-pruge" width="64" height="36" patternUnits="userSpaceOnUse">
          <path d="M0 0h32v18a16 16 0 0 1-32 0z" fill="var(--color-verde)" />
          <path d="M32 0h32v18a16 16 0 0 1-32 0z" fill="var(--color-fondo)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#tenda-pruge)" />
    </svg>
  );
}
