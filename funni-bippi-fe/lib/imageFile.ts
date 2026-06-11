const MIME_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
};

const ACCEPTED = new Set(Object.keys(MIME_EXT));

/** Re-wrap clipboard/pasted files so upload gets a stable name, type, and bytes. */
export async function normalizeImageFile(file: File): Promise<File | null> {
  if (!file.size) return null;

  const buf = await file.arrayBuffer();
  const type = file.type && ACCEPTED.has(file.type) ? file.type : 'image/png';
  const ext = MIME_EXT[type] ?? '.png';
  const name = file.name?.includes('.') ? file.name : `image${ext}`;

  return new File([buf], name, { type, lastModified: Date.now() });
}
