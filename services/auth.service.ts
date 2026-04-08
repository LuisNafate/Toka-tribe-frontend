import type { BackendAuthEnvelope } from "@/types/toka";

export const SESSION_TOKEN_KEY = "tokatribe.session.jwt";

function getApiBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL no está configurado.");
  }
  return baseUrl.replace(/\/$/, "");
}

function extractToken(payload: BackendAuthEnvelope): string | null {
  return payload.data?.accessToken ?? payload.accessToken ?? payload.token ?? payload.jwt ?? null;
}

export async function exchangeAuthCode(code: string): Promise<{ token: string; raw: BackendAuthEnvelope }> {
  const apiBase = getApiBaseUrl();

  const response = await fetch(`${apiBase}/auth/toka/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ authCode: code }),
  });

  let payload: BackendAuthEnvelope = {};
  try {
    payload = (await response.json()) as BackendAuthEnvelope;
  } catch {
    payload = {};
  }

  if (!response.ok) {
    const message = payload.message || `Error HTTP ${response.status} al intercambiar authCode.`;
    throw new Error(message);
  }

  const token = extractToken(payload);
  if (!token) {
    throw new Error("El backend no devolvió un token JWT válido.");
  }

  return { token, raw: payload };
}

export function saveSessionToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_TOKEN_KEY, token);
}

export function getSessionToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_TOKEN_KEY);
}

export function clearSessionToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_TOKEN_KEY);
}
