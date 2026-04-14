import "server-only";

type Entry = {
  count: number;
  expiresAt: number;
};

const store = new Map<string, Entry>();

export function getRequestKey(rawKey: string) {
  return rawKey.trim().toLowerCase() || "unknown";
}

export function takeRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const saved = store.get(key);

  if (!saved || saved.expiresAt <= now) {
    store.set(key, { count: 1, expiresAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (saved.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  saved.count += 1;
  store.set(key, saved);
  return { allowed: true, remaining: Math.max(limit - saved.count, 0) };
}
