import { Platform } from 'react-native';
import type {
  Problem,
} from '@/src/types';
import { clearSession, loadSession, saveSession } from './secureStorage';

export const DEMO_MODE = true;

export const API_BASE_URL =
  (Platform.OS === 'web'
    ? (process.env.EXPO_PUBLIC_API_URL as string | undefined)
    : (process.env.EXPO_PUBLIC_API_URL as string | undefined)) ||
  'http://localhost:8080/api/v1';

export class ApiError extends Error {
  problem: Problem;
  status: number;
  constructor(problem: Problem, status: number) {
    super(problem.title || problem.detail || 'Request failed');
    this.problem = problem;
    this.status = status;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
  idempotencyKey?: string;
  skipAuth?: boolean;
}

function buildQuery(query?: RequestOptions['query']): string {
  if (!query) return '';
  const params = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return params.length ? `?${params.join('&')}` : '';
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    const session = await loadSession();
    if (!session?.refreshToken) return false;
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: session.refreshToken }),
      });
      if (!res.ok) {
        await clearSession();
        return false;
      }
      const data = await res.json();
      await saveSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: Date.now() + data.expiresInSeconds * 1000,
      });
      return true;
    } catch {
      await clearSession();
      return false;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

export async function apiFetch<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query, headers = {}, idempotencyKey, skipAuth } = opts;
  const url = `${API_BASE_URL}${path}${buildQuery(query)}`;

  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };
  if (idempotencyKey) finalHeaders['Idempotency-Key'] = idempotencyKey;

  if (!skipAuth) {
    const session = await loadSession();
    if (session?.accessToken) {
      finalHeaders['Authorization'] = `Bearer ${session.accessToken}`;
    }
  }

  const doFetch = () =>
    fetch(url, {
      method,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

  let res = await doFetch();

  if (res.status === 401 && !skipAuth) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      const session = await loadSession();
      if (session?.accessToken) {
        finalHeaders['Authorization'] = `Bearer ${session.accessToken}`;
      }
      res = await doFetch();
    }
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const parsed = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const problem: Problem = parsed ?? {
      title: `HTTP ${res.status}`,
      status: res.status,
      code: 'HTTP_ERROR',
    };
    throw new ApiError(problem, res.status);
  }

  return parsed as T;
}

export function genIdempotencyKey(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
