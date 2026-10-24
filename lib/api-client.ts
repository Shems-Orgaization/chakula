// lib/api-client.ts
import { errorMessage, MESSAGES } from "./messages";
import { toast } from "sonner";

export type ApiResponse<T = any> = 
  | { ok: true; data: T; error: null; status: number }
  | { ok: false; data: null; error: string; status: number; code?: string };

export async function apiClient<T = any>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  if (typeof window !== "undefined" && !navigator.onLine) {
    return { ok: false, data: null, error: MESSAGES.network.offline, status: 0 };
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      // JSON parse failed (e.g., 204 No Content)
    }

    if (!response.ok) {
      const code = data?.code;
      
      if (response.status === 401) {
        toast.error(MESSAGES.auth.sessionExpired);
        if (typeof window !== "undefined" && !window.location.pathname.startsWith('/login')) {
          window.location.href = "/login?reason=expired";
        }
        return { ok: false, data: null, error: MESSAGES.auth.sessionExpired, status: 401, code };
      }

      const friendlyError = errorMessage(response.status, code);
      return { ok: false, data: null, error: friendlyError, status: response.status, code };
    }

    return { ok: true, data: data as T, error: null, status: response.status };
  } catch (err) {
    return { ok: false, data: null, error: MESSAGES.network.generic, status: 0 };
  }
}