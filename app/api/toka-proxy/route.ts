import { NextRequest, NextResponse } from "next/server";

type ProxyPayload = {
  baseUrl?: string;
  path?: string;
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
};

const ALLOWED_METHODS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"]);
const RESTRICTED_HEADERS = new Set(["host", "content-length", "connection"]);

function getAllowedOrigins(): string[] {
  const envList = (process.env.TOKA_PROXY_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (envList.length > 0) {
    return envList;
  }

  return [
    "http://talentland-toka.eastus2.cloudapp.azure.com",
    "https://talentland-toka.eastus2.cloudapp.azure.com",
  ];
}

function normalizeBaseUrl(baseUrl: string): string | null {
  try {
    const url = new URL(baseUrl);
    if (!["http:", "https:"].includes(url.protocol)) {
      return null;
    }

    return url.toString().replace(/\/+$/, "");
  } catch {
    return null;
  }
}

function sanitizeHeaders(headers: Record<string, string> | undefined) {
  const sanitized: Record<string, string> = {};

  if (!headers) {
    return sanitized;
  }

  for (const [key, value] of Object.entries(headers)) {
    const normalized = key.trim();
    if (!normalized) continue;
    if (RESTRICTED_HEADERS.has(normalized.toLowerCase())) continue;
    sanitized[normalized] = String(value);
  }

  return sanitized;
}

export async function POST(request: NextRequest) {
  let payload: ProxyPayload;

  try {
    payload = (await request.json()) as ProxyPayload;
  } catch {
    return NextResponse.json({ message: "JSON inválido en payload del proxy." }, { status: 400 });
  }

  const method = (payload.method ?? "GET").toUpperCase();
  if (!ALLOWED_METHODS.has(method)) {
    return NextResponse.json({ message: "Método HTTP no permitido por proxy." }, { status: 400 });
  }

  const path = payload.path ?? "/";
  if (!path.startsWith("/")) {
    return NextResponse.json({ message: "La ruta debe iniciar con /." }, { status: 400 });
  }

  const normalizedBase = normalizeBaseUrl(payload.baseUrl ?? "");
  if (!normalizedBase) {
    return NextResponse.json({ message: "baseUrl inválida para proxy." }, { status: 400 });
  }

  const allowedOrigins = getAllowedOrigins();
  if (!allowedOrigins.includes(normalizedBase)) {
    return NextResponse.json({
      message: "Origen no permitido por proxy.",
      allowedOrigins,
    }, { status: 403 });
  }

  const targetUrl = `${normalizedBase}${path}`;
  const headers = sanitizeHeaders(payload.headers);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    const upstream = await fetch(targetUrl, {
      method,
      headers,
      body: payload.body !== undefined ? JSON.stringify(payload.body) : undefined,
      signal: controller.signal,
      cache: "no-store",
      redirect: "follow",
    });

    const text = await upstream.text();
    const contentType = upstream.headers.get("content-type") ?? "text/plain; charset=utf-8";

    try {
      const json = JSON.parse(text);
      return NextResponse.json(json, { status: upstream.status });
    } catch {
      return new NextResponse(text, {
        status: upstream.status,
        headers: {
          "content-type": contentType,
          "cache-control": "no-store",
        },
      });
    }
  } catch {
    return NextResponse.json({ message: "No se pudo conectar al upstream desde proxy." }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}
