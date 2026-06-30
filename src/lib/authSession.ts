const API_BASE = import.meta.env.VITE_API_URL ?? "";

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export const isApiConfigured = Boolean(API_BASE);

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        accessToken = null;
        return null;
      }

      const body = (await response.json()) as { access_token: string };
      accessToken = body.access_token;
      return accessToken;
    } catch {
      accessToken = null;
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiFetch(
  path: string,
  init: RequestInit = {},
  token?: string | null
): Promise<Response> {
  const authToken = token ?? accessToken;
  const headers = new Headers(init.headers);

  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  let response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  if (response.status === 401 && authToken) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers.set("Authorization", `Bearer ${newToken}`);
      response = await fetch(`${API_BASE}${path}`, {
        ...init,
        headers,
        credentials: "include",
      });
    }
  }

  return response;
}
