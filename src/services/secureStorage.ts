const STORAGE_KEY = 'inaivo_auth_session';

function getStorage(): Storage {
  if (typeof localStorage !== 'undefined') return localStorage;
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => { map.set(k, v); },
    removeItem: (k: string) => { map.delete(k); },
    clear: () => { map.clear(); },
    key: (i: number) => Array.from(map.keys())[i] ?? null,
    length: map.size,
  } as Storage;
}

export interface StoredSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export async function saveSession(session: StoredSession): Promise<void> {
  getStorage().setItem(STORAGE_KEY, JSON.stringify(session));
}

export async function loadSession(): Promise<StoredSession | null> {
  const raw = getStorage().getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  getStorage().removeItem(STORAGE_KEY);
}
