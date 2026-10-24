const LETTERS: Record<string, string> = { č: "c", ć: "c", š: "s", ž: "z", đ: "dj", ñ: "n" };

/** „Ser ili estar: kada koji?“ → "ser-ili-estar-kada-koji" (bez kvačica, za URL i ime fajla). */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[čćšžđñ]/g, (ch) => LETTERS[ch])
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
}
