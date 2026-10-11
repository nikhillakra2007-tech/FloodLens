function getApiBase(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  if (envUrl) {
    return envUrl.endsWith("/api/v1") ? envUrl : `${envUrl.replace(/\/+$/, "")}/api/v1`;
  }
  // In the browser, use relative path so Next.js rewrites proxy to backend with 0 CORS/port issues
  if (typeof window !== "undefined") {
    return "/api/v1";
  }
  // On the server (SSR), call backend directly
  return "http://localhost:8000/api/v1";
}

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const apiBase = getApiBase();
  const url = `${apiBase}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });

  if (!res.ok) {
    const rawError = await res.json().catch(() => null);
    const errCode = rawError?.error?.code ?? rawError?.code ?? "UNKNOWN";
    const errMsg =
      rawError?.error?.message ??
      rawError?.message ??
      (typeof rawError?.detail === "string" ? rawError.detail : null) ??
      `API error: ${res.status}`;
    throw new ApiError(errCode, errMsg, res.status);
  }

  return res.json();
}

export function buildQueryString(params: Record<string, string | number | undefined>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      searchParams.set(key, String(value));
    }
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}
