// src/shared/api/http.ts
import { ApiError } from "./errors";
import { readAccessToken, readGuestId } from "@/shared/auth/storage";

const DEFAULT_TIMEOUT_MS = 30_000;

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestOptions = {
  baseUrl?: string;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  timeoutMs?: number;
};

function buildUrl(baseUrl: string | undefined, path: string): string {
  if (!baseUrl) return path;
  const b = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

async function readBodySafely(res: Response): Promise<unknown> {
  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }
  try {
    return await res.text();
  } catch {
    return null;
  }
}

export type HttpClient = {
  get<T>(path: string, opts?: RequestOptions): Promise<T>;
  post<TRes, TBody = unknown>(path: string, body?: TBody, opts?: RequestOptions): Promise<TRes>;
  put<TRes, TBody = unknown>(path: string, body?: TBody, opts?: RequestOptions): Promise<TRes>;
  patch<TRes, TBody = unknown>(path: string, body?: TBody, opts?: RequestOptions): Promise<TRes>;
  del<T>(path: string, opts?: RequestOptions): Promise<T>;
};

async function request<T>(method: HttpMethod, path: string, body?: unknown, opts?: RequestOptions): Promise<T> {
  const controller = new AbortController();
  const timeoutMs = opts?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const signal = opts?.signal
    ? (() => {
        opts.signal!.addEventListener("abort", () => controller.abort(), { once: true });
        return controller.signal;
      })()
    : controller.signal;

  const baseUrl = opts?.baseUrl ?? API_BASE_URL;
  const url = buildUrl(baseUrl, path);

  const headers: Record<string, string> = {
    ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    ...(opts?.headers ?? {}),
  };

  // ✅ guest は常に付与（仕様通り）
  const guestId = readGuestId();
  if (guestId) headers["X-Guest-Id"] = guestId;

  // ✅ access token があるなら Bearer も付与（dj-rest-authをJWT運用でもOKにする）
  const access = readAccessToken();
  if (access) headers["Authorization"] = `Bearer ${access}`;

  try {
    const res = await fetch(url, {
      method,
      headers,
      credentials: "include",
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });

    if (!res.ok) {
      const payload = await readBodySafely(res);
      const msg =
        (payload && typeof payload === "object" && (payload as any).detail) ||
        (payload && typeof payload === "object" && (payload as any).message) ||
        `Request failed: ${res.status}`;

      throw new ApiError({ status: res.status, message: String(msg), url, payload });
    }

    if (res.status === 204) return undefined as T;

    const ct = res.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) return (await res.json()) as T;
    return (await res.text()) as unknown as T;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const http: HttpClient = {
  get: (path, opts) => request("GET", path, undefined, opts),
  post: (path, body, opts) => request("POST", path, body, opts),
  put: (path, body, opts) => request("PUT", path, body, opts),
  patch: (path, body, opts) => request("PATCH", path, body, opts),
  del: (path, opts) => request("DELETE", path, undefined, opts),
};