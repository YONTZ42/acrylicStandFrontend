// src/shared/api/errors.ts
export type ApiErrorPayload = {
  detail?: string;
  message?: string;
  errors?: unknown;
  [k: string]: unknown;
};

export class ApiError extends Error {
  public readonly status: number;
  public readonly url?: string;
  public readonly payload?: ApiErrorPayload | unknown;

  constructor(args: { status: number; message: string; url?: string; payload?: unknown }) {
    super(args.message);
    this.name = "ApiError";
    this.status = args.status;
    this.url = args.url;
    this.payload = args.payload;
  }
}

export const isApiError = (e: unknown): e is ApiError =>
  typeof e === "object" && e !== null && (e as any).name === "ApiError" && typeof (e as any).status === "number";
