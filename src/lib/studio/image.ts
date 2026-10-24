import { slugify } from "./slug";

export interface PreparedImage {
  /** Putanja na sajtu, npr. /blog/ser-ili-estar/plaza.jpg */
  publicPath: string;
  base64: string;
  /** blob: URL za trenutni pregled, dok slika još nije u repou */
  previewUrl: string;
}

/** Smanjuje fotografiju u browseru (max 1920px, JPEG ~82%) da sajt ostane brz. */
export async function prepareImage(file: File, postSlug: string, maxWidth = 1920): Promise<PreparedImage> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Slika nije mogla da se obradi."))), "image/jpeg", 0.82),
  );
  const buffer = new Uint8Array(await blob.arrayBuffer());
  let binary = "";
  for (let i = 0; i < buffer.length; i += 0x8000) {
    binary += String.fromCharCode(...buffer.subarray(i, i + 0x8000));
  }

  const name = slugify(file.name.replace(/\.[^.]+$/, "")) || "slika";
  const stamp = Date.now().toString(36).slice(-4);
  return {
    publicPath: `/blog/${postSlug || "novi-post"}/${name}-${stamp}.jpg`,
    base64: btoa(binary),
    previewUrl: URL.createObjectURL(blob),
  };
}
