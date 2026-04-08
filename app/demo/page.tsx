"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import {
  getApiOperations,
  getApiStats,
  getApiTags,
  getRequestBodyTemplateBySchemaName,
  tokaTribeOpenApi,
} from "@/lib/api/openapi";

type ApiResult = {
  action: string;
  ok: boolean;
  status?: number;
  payload: unknown;
};

const DEFAULT_BASE_URL = "http://talentland-toka.eastus2.cloudapp.azure.com";
const SWAGGER_OPERATIONS = getApiOperations();
const SWAGGER_STATS = getApiStats();
const SWAGGER_TAGS = ["all", ...getApiTags()];
const FORBIDDEN_HEADER_KEYS = new Set(["host", "content-length"]);

export default function DemoPage() {
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL);
  const [token, setToken] = useState("");
  const [extraHeadersJson, setExtraHeadersJson] = useState("{}");
  const [tagFilter, setTagFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [operationId, setOperationId] = useState(SWAGGER_OPERATIONS[0]?.operationId ?? "");
  const [pathParamsJson, setPathParamsJson] = useState("{}");
  const [bodyJson, setBodyJson] = useState("{}");
  const [message, setMessage] = useState("");
  const [loadingAction, setLoadingAction] = useState("");
  const [lastResult, setLastResult] = useState<ApiResult | null>(null);

  const filteredOperations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return SWAGGER_OPERATIONS.filter((operation) => {
      const matchesTag = tagFilter === "all" || operation.tag === tagFilter;
      if (!matchesTag) return false;
      if (!query) return true;

      return (
        operation.operationId.toLowerCase().includes(query)
        || operation.path.toLowerCase().includes(query)
        || operation.summary.toLowerCase().includes(query)
      );
    });
  }, [search, tagFilter]);

  const selectedOperation = useMemo(
    () => filteredOperations.find((operation) => operation.operationId === operationId) ?? filteredOperations[0] ?? SWAGGER_OPERATIONS[0],
    [filteredOperations, operationId],
  );

  function normalizeBaseUrl(urlValue: string): string | null {
    try {
      const parsed = new URL(urlValue);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        return null;
      }
      return parsed.toString().replace(/\/+$/, "");
    } catch {
      return null;
    }
  }

  function parseSafeHeaders(raw: string): { ok: true; headers: Record<string, string> } | { ok: false; message: string } {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw || "{}");
    } catch {
      return { ok: false, message: "Headers JSON inválido." };
    }

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { ok: false, message: "Headers debe ser un objeto JSON." };
    }

    const headers: Record<string, string> = {};

    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      const normalizedKey = key.trim();
      if (!normalizedKey) continue;
      if (FORBIDDEN_HEADER_KEYS.has(normalizedKey.toLowerCase())) {
        continue;
      }
      headers[normalizedKey] = String(value);
    }

    return { ok: true, headers };
  }

  function onChangeOperation(nextOperationId: string) {
    setOperationId(nextOperationId);
    setMessage("");

    const operation = SWAGGER_OPERATIONS.find((item) => item.operationId === nextOperationId);
    if (!operation) return;

    const pathParams: Record<string, string> = {};
    for (const paramName of operation.pathParamNames) {
      pathParams[paramName] = "";
    }
    setPathParamsJson(JSON.stringify(pathParams, null, 2));

    if (operation.hasBody) {
      setBodyJson(getRequestBodyTemplateBySchemaName(operation.requestSchemaName));
    } else {
      setBodyJson("{}");
    }
  }

  function resolvePath(pathTemplate: string, rawPathParams: string) {
    let pathParams: Record<string, string> = {};

    try {
      pathParams = JSON.parse(rawPathParams || "{}");
    } catch {
      return { path: pathTemplate, missing: ["pathParams JSON inválido"] };
    }

    const missing: string[] = [];

    const path = pathTemplate.replace(/\{([^}]+)\}/g, (_, key: string) => {
      const value = pathParams[key];
      if (!value) {
        missing.push(key);
        return `{${key}}`;
      }
      return encodeURIComponent(value);
    });

    return { path, missing };
  }

  async function callApi(action: string, path: string, options: RequestInit = {}) {
    setLoadingAction(action);
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    try {
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 20000);

      const response = await fetch(`${baseUrl}${path}`, {
        ...options,
        signal: controller.signal,
      });
      let payload: unknown;

      try {
        payload = await response.json();
      } catch {
        payload = await response.text();
      }

      setLastResult({
        action,
        ok: response.ok,
        status: response.status,
        payload,
      });
    } catch (error) {
      setLastResult({
        action,
        ok: false,
        payload: {
          message: "No se pudo conectar con la API. Revisa CORS, red, timeout o URL base.",
          error: error instanceof Error ? error.message : String(error),
        },
      });
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      setLoadingAction("");
    }
  }

  function onExecuteOperation(event: FormEvent) {
    event.preventDefault();

    if (!selectedOperation) return;

    const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
    if (!normalizedBaseUrl) {
      setMessage("La URL base no es válida. Debe iniciar con http:// o https://");
      return;
    }

    if (selectedOperation.secured && !token.trim()) {
      setMessage("Esta operación requiere JWT. Ingresa token antes de ejecutar.");
      return;
    }

    const resolved = resolvePath(selectedOperation.path, pathParamsJson);
    if (resolved.missing.length > 0) {
      setMessage(`Faltan valores para: ${resolved.missing.join(", ")}`);
      return;
    }

    const parsedHeadersResult = parseSafeHeaders(extraHeadersJson);
    if (!parsedHeadersResult.ok) {
      setMessage(parsedHeadersResult.message);
      return;
    }

    let parsedBody: unknown = undefined;
    if (selectedOperation.hasBody) {
      try {
        parsedBody = JSON.parse(bodyJson || "{}");
      } catch {
        setMessage("Body JSON inválido.");
        return;
      }
    }

    const headers: Record<string, string> = {
      ...parsedHeadersResult.headers,
    };

    if (selectedOperation.hasBody) {
      headers["Content-Type"] = "application/json";
    }

    if (selectedOperation.secured && token) {
      headers.Authorization = `Bearer ${token}`;
    }

    setMessage("");

    setBaseUrl(normalizedBaseUrl);

    callApi(`OpenAPI ${selectedOperation.method} ${selectedOperation.path}`, resolved.path, {
      method: selectedOperation.method,
      headers,
      body: selectedOperation.hasBody ? JSON.stringify(parsedBody) : undefined,
    });
  }

  return (
    <main className="demo-page">
      <header className="demo-header">
        <div>
          <h1>Swagger Runner</h1>
          <p>Esta vista usa exclusivamente el OpenAPI integrado como fuente de verdad.</p>
        </div>
        <Link href="/" className="demo-back-link">Volver a landing</Link>
      </header>

      <section className="demo-panel">
        <h2>Resumen del contrato</h2>
        <p>
          <strong>{tokaTribeOpenApi.info?.title}</strong> v{tokaTribeOpenApi.info?.version} · OpenAPI {tokaTribeOpenApi.openapi}
        </p>
        <p>
          Endpoints: {SWAGGER_STATS.endpointCount} · Operaciones: {SWAGGER_STATS.operationCount} · Tags: {SWAGGER_STATS.tagCount} · Seguras (JWT): {SWAGGER_STATS.securedCount}
        </p>
      </section>

      <section className="demo-panel">
        <h2>Configuración</h2>
        <div className="demo-grid">
          <label>
            URL base API
            <input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="https://api.tu-dominio.com" />
          </label>
          <label>
            JWT (opcional si la operación es pública)
            <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="Bearer token" />
          </label>
          <label>
            Headers extra JSON
            <input value={extraHeadersJson} onChange={(e) => setExtraHeadersJson(e.target.value)} placeholder='{"X-App-Id":"abc"}' />
          </label>
        </div>
      </section>

      <section className="demo-panel">
        <h2>Ejecutor OpenAPI</h2>
        <form className="demo-actions" onSubmit={onExecuteOperation}>
          <div className="demo-grid">
            <label>
              Filtrar por tag
              <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)}>
                {SWAGGER_TAGS.map((tag) => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </label>
            <label>
              Buscar operación
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="operationId, ruta o resumen"
              />
            </label>
            <label>
              Resultados
              <input value={String(filteredOperations.length)} readOnly />
            </label>
          </div>

          <label>
            Operación
            <select value={selectedOperation?.operationId ?? ""} onChange={(e) => onChangeOperation(e.target.value)}>
              {filteredOperations.map((operation) => (
                <option key={operation.id} value={operation.operationId}>
                  [{operation.tag}] {operation.method} {operation.path} - {operation.summary}
                </option>
              ))}
            </select>
          </label>

          <div className="demo-grid">
            <label>
              Método
              <input value={selectedOperation?.method ?? ""} readOnly />
            </label>
            <label>
              Ruta
              <input value={selectedOperation?.path ?? ""} readOnly />
            </label>
            <label>
              Seguridad
              <input value={selectedOperation?.secured ? "JWT requerida" : "Pública"} readOnly />
            </label>
          </div>

          <label>
            Path params JSON
            <textarea
              value={pathParamsJson}
              onChange={(e) => setPathParamsJson(e.target.value)}
              rows={3}
              placeholder='{"tribeId":"abc123"}'
            />
          </label>

          <label>
            Body JSON
            <textarea
              value={bodyJson}
              onChange={(e) => setBodyJson(e.target.value)}
              rows={8}
              placeholder='{"authCode":"QZvGrF"}'
              disabled={!selectedOperation?.hasBody}
            />
          </label>

          <button type="submit" disabled={!selectedOperation || loadingAction.startsWith("OpenAPI")}>
            {loadingAction.startsWith("OpenAPI") ? "Ejecutando..." : "Ejecutar operación"}
          </button>
        </form>

        {selectedOperation?.requestSchemaName ? (
          <p>Schema request body: <strong>{selectedOperation.requestSchemaName}</strong></p>
        ) : null}

        {message ? <p style={{ color: "#b91c1c" }} role="alert" aria-live="polite">{message}</p> : null}
      </section>

      <section className="demo-panel">
        <h2>Última respuesta</h2>
        {lastResult ? (
          <>
            <p>
              <strong>{lastResult.action}</strong> · {lastResult.ok ? "OK" : "Error"}
              {lastResult.status ? ` · HTTP ${lastResult.status}` : ""}
            </p>
            <pre>{JSON.stringify(lastResult.payload, null, 2)}</pre>
          </>
        ) : (
          <p>Ejecuta una operación para ver resultados.</p>
        )}
      </section>
    </main>
  );
}
