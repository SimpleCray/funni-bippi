const BE = process.env.NEXT_PUBLIC_BE_URL ?? 'http://localhost:3001';

export interface SessionResponse {
  sessionId: string;
  userId: string;
}

export async function fetchSession(): Promise<SessionResponse> {
  const res = await fetch(`${BE}/session/init`, { method: 'POST' });
  if (!res.ok) throw new Error(`Session init failed: ${res.status}`);
  return res.json() as Promise<SessionResponse>;
}

export async function uploadImageFile(file: File, sessionId?: string | null): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${BE}/upload`, {
    method: 'POST',
    headers: sessionId ? { Authorization: sessionId } : {},
    body: form,
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  const { imageUrl } = (await res.json()) as { imageUrl: string };
  return `${BE}${imageUrl}`;
}
