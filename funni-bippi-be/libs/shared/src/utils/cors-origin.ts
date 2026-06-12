const NGROK_HOST_REGEX = /\.ngrok-free\.(dev|app)$|\.ngrok\.io$|\.ngrok\.app$/;
const VERCEL_HOST_REGEX = /\.vercel\.app$/;

export function buildCorsOriginValidator(feUrl?: string) {
  const allowed = new Set(
    (feUrl ?? 'http://localhost:3000')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  );

  return (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) => {
    if (!origin || allowed.has(origin)) {
      callback(null, true);
      return;
    }

    try {
      const { hostname } = new URL(origin);
      callback(
        null,
        NGROK_HOST_REGEX.test(hostname) || VERCEL_HOST_REGEX.test(hostname),
      );
    } catch {
      callback(null, false);
    }
  };
}
