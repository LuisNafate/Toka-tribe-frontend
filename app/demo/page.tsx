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

type BridgePayload = {
  authCode?: string;
  authcode?: string;
  [key: string]: unknown;
};

type BridgeApi = {
  call: (
    method: string,
    payload: Record<string, unknown>,
    callback?: (response: BridgePayload) => void,
  ) => void;
};

const DEFAULT_BASE_URL = process.env.NEXT_PUBLIC_TOKA_API_BASE_URL ?? "http://talentland-toka.eastus2.cloudapp.azure.com";
const SWAGGER_OPERATIONS = getApiOperations();
const SWAGGER_STATS = getApiStats();
const SWAGGER_TAGS = ["all", ...getApiTags()];
const FORBIDDEN_HEADER_KEYS = new Set(["host", "content-length"]);

export default function DemoPage() {
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL);
  const [useServerProxy, setUseServerProxy] = useState(true);
  const [token, setToken] = useState("");
  const [extraHeadersJson, setExtraHeadersJson] = useState("{}");
  const [tagFilter, setTagFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [operationId, setOperationId] = useState(SWAGGER_OPERATIONS[0]?.operationId ?? "");
  const [pathParamsJson, setPathParamsJson] = useState("{}");
  const [bodyJson, setBodyJson] = useState("{}");

  const [appId, setAppId] = useState("");
  const [merchantCode, setMerchantCode] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [authCodesCsv, setAuthCodesCsv] = useState("");
  const [userId, setUserId] = useState("");
  const [orderTitle, setOrderTitle] = useState("Demo TokaTribe");
  const [orderAmountValue, setOrderAmountValue] = useState("500");
  const [paymentId, setPaymentId] = useState("");
  const [paymentUrl, setPaymentUrl] = useState("");
  const [refundAmountValue, setRefundAmountValue] = useState("500");
  const [refundId, setRefundId] = useState("");

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

  function isValidAppId(value: string) {
    return value.trim().length === 16;
  }

  function isValidMerchantCode(value: string) {
    return value.trim().length === 5;
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

  function getResultData(payload: unknown): Record<string, unknown> | null {
    if (!payload || typeof payload !== "object") return null;
    const maybeData = (payload as { data?: unknown }).data;
    if (!maybeData || typeof maybeData !== "object") return null;
    return maybeData as Record<string, unknown>;
  }

  function toHeaderRecord(headers: HeadersInit | undefined): Record<string, string> {
    if (!headers) return {};

    if (Array.isArray(headers)) {
      return Object.fromEntries(headers.map(([key, value]) => [key, String(value)]));
    }

    if (headers instanceof Headers) {
      const collected: Record<string, string> = {};
      headers.forEach((value, key) => {
        collected[key] = value;
      });
      return collected;
    }

    return Object.fromEntries(Object.entries(headers).map(([key, value]) => [key, String(value)]));
  }

  function toSerializableBody(body: BodyInit | null | undefined): unknown {
    if (body == null) return undefined;
    if (typeof body !== "string") return String(body);

    try {
      return JSON.parse(body);
    } catch {
      return body;
    }
  }

  async function callApi(action: string, path: string, options: RequestInit = {}) {
    setLoadingAction(action);
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    try {
      const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
      if (!normalizedBaseUrl) {
        const invalidResult: ApiResult = {
          action,
          ok: false,
          payload: { message: "La URL base no es válida." },
        };
        setLastResult(invalidResult);
        return invalidResult;
      }

      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 20000);

      const response = useServerProxy
        ? await fetch("/api/toka-proxy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            baseUrl: normalizedBaseUrl,
            path,
            method: (options.method ?? "GET").toUpperCase(),
            headers: toHeaderRecord(options.headers),
            body: toSerializableBody(options.body),
          }),
          signal: controller.signal,
        })
        : await fetch(`${normalizedBaseUrl}${path}`, {
          ...options,
          signal: controller.signal,
        });

      let payload: unknown;
      try {
        payload = await response.json();
      } catch {
        payload = await response.text();
      }

      const result: ApiResult = {
        action,
        ok: response.ok,
        status: response.status,
        payload,
      };

      setLastResult(result);
      return result;
    } catch (error) {
      const result: ApiResult = {
        action,
        ok: false,
        payload: {
          message: "No se pudo conectar con la API. Revisa CORS, red, timeout o URL base.",
          error: error instanceof Error ? error.message : String(error),
        },
      };

      setLastResult(result);
      return result;
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      setLoadingAction("");
    }
  }

  async function onExecuteOperation(event: FormEvent) {
    event.preventDefault();

    if (!selectedOperation) return;

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

    await callApi(`OpenAPI ${selectedOperation.method} ${selectedOperation.path}`, resolved.path, {
      method: selectedOperation.method,
      headers,
      body: selectedOperation.hasBody ? JSON.stringify(parsedBody) : undefined,
    });
  }

  function getBridge(): BridgeApi | null {
    if (typeof window === "undefined") return null;
    const maybeBridge = (window as Window & { AlipayJSBridge?: BridgeApi }).AlipayJSBridge;
    return maybeBridge ?? null;
  }

  async function onGetDigitalIdentityCode(event: FormEvent) {
    event.preventDefault();
    const bridge = getBridge();

    if (!bridge) {
      setMessage("AlipayJSBridge no está disponible en este navegador. Ejecuta dentro de mini app.");
      return;
    }

    setLoadingAction("Bridge auth code");

    try {
      const result = await new Promise<BridgePayload>((resolve) => {
        bridge.call(
          "getUserDigitalIdentityAuthCode",
          {
            usage: "Autenticar usuario en TokaTribe",
            scopes: ["USER_ID", "USER_AVATAR", "USER_NICKNAME"],
          },
          (response) => resolve(response),
        );
      });

      const code = result.authCode ?? result.authcode;
      if (code) {
        setAuthCode(String(code));
        setMessage("Auth code obtenido desde JSBridge.");
      } else {
        setMessage("No se obtuvo authCode del JSBridge.");
      }
    } finally {
      setLoadingAction("");
    }
  }

  async function onLegacyAuthenticate(event: FormEvent) {
    event.preventDefault();

    if (!isValidAppId(appId)) {
      setMessage("X-App-Id debe tener exactamente 16 caracteres.");
      return;
    }

    if (!authCode.trim()) {
      setMessage("Ingresa un authCode antes de autenticar.");
      return;
    }

    setMessage("");

    const result = await callApi("Legacy POST /v1/user/authenticate", "/v1/user/authenticate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-App-Id": appId.trim(),
      },
      body: JSON.stringify({ authcode: authCode.trim() }),
    });

    const data = getResultData(result.payload);
    const nextToken = data?.accessToken;
    const nextUserId = data?.userId;

    if (typeof nextToken === "string") {
      setToken(nextToken);
    }

    if (typeof nextUserId === "string") {
      setUserId(nextUserId);
    }
  }

  async function onLegacyUserInfo(event: FormEvent) {
    event.preventDefault();

    if (!isValidAppId(appId)) {
      setMessage("X-App-Id debe tener exactamente 16 caracteres.");
      return;
    }

    if (!token.trim()) {
      setMessage("Se requiere JWT para consultar /v1/user/info.");
      return;
    }

    const authCodes = authCodesCsv
      .split(",")
      .map((code) => code.trim())
      .filter(Boolean)
      .slice(0, 5);

    if (authCodes.length === 0) {
      setMessage("Ingresa al menos un authCode en authCodes CSV.");
      return;
    }

    setMessage("");

    await callApi("Legacy POST /v1/user/info", "/v1/user/info", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-App-Id": appId.trim(),
        Authorization: `Bearer ${token.trim()}`,
      },
      body: JSON.stringify({ authCodes }),
    });
  }

  async function onLegacyCreatePayment(event: FormEvent) {
    event.preventDefault();

    if (!isValidAppId(appId)) {
      setMessage("X-App-Id debe tener exactamente 16 caracteres.");
      return;
    }

    if (!isValidMerchantCode(merchantCode)) {
      setMessage("Alipay-MerchantCode debe tener exactamente 5 caracteres.");
      return;
    }

    if (!token.trim() || !userId.trim()) {
      setMessage("Se requiere JWT y userId para crear pago.");
      return;
    }

    setMessage("");

    const result = await callApi("Legacy POST /v1/payment/create", "/v1/payment/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-App-Id": appId.trim(),
        Authorization: `Bearer ${token.trim()}`,
        "Alipay-MerchantCode": merchantCode.trim(),
      },
      body: JSON.stringify({
        userId: userId.trim(),
        orderTitle: orderTitle.trim() || "Demo TokaTribe",
        orderAmount: {
          value: orderAmountValue.trim() || "500",
          currency: "MXN",
        },
      }),
    });

    const data = getResultData(result.payload);
    const nextPaymentId = data?.paymentId;
    const nextPaymentUrl = data?.paymentUrl;

    if (typeof nextPaymentId === "string") {
      setPaymentId(nextPaymentId);
    }

    if (typeof nextPaymentUrl === "string") {
      setPaymentUrl(nextPaymentUrl);
    }
  }

  async function onLegacyPaymentInquiry(event: FormEvent) {
    event.preventDefault();

    if (!isValidAppId(appId) || !token.trim() || !paymentId.trim()) {
      setMessage("Se requiere X-App-Id válido, JWT y paymentId para inquiry.");
      return;
    }

    setMessage("");

    await callApi("Legacy POST /v1/payment/inquiry", "/v1/payment/inquiry", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-App-Id": appId.trim(),
        Authorization: `Bearer ${token.trim()}`,
      },
      body: JSON.stringify({ paymentId: paymentId.trim() }),
    });
  }

  async function onLegacyPaymentClose(event: FormEvent) {
    event.preventDefault();

    if (!isValidAppId(appId) || !token.trim() || !paymentId.trim()) {
      setMessage("Se requiere X-App-Id válido, JWT y paymentId para close.");
      return;
    }

    setMessage("");

    await callApi("Legacy POST /v1/payment/close", "/v1/payment/close", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-App-Id": appId.trim(),
        Authorization: `Bearer ${token.trim()}`,
      },
      body: JSON.stringify({ paymentId: paymentId.trim() }),
    });
  }

  async function onLegacyRefundCreate(event: FormEvent) {
    event.preventDefault();

    if (!isValidAppId(appId) || !token.trim() || !paymentId.trim() || !userId.trim()) {
      setMessage("Se requiere X-App-Id válido, JWT, userId y paymentId para refund.");
      return;
    }

    if (!isValidMerchantCode(merchantCode)) {
      setMessage("Alipay-MerchantCode debe tener exactamente 5 caracteres.");
      return;
    }

    setMessage("");

    const result = await callApi("Legacy POST /v1/payment/refund", "/v1/payment/refund", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-App-Id": appId.trim(),
        Authorization: `Bearer ${token.trim()}`,
        "Alipay-MerchantCode": merchantCode.trim(),
      },
      body: JSON.stringify({
        userId: userId.trim(),
        paymentId: paymentId.trim(),
        refundAmount: {
          value: refundAmountValue.trim() || "500",
          currency: "MXN",
        },
      }),
    });

    const data = getResultData(result.payload);
    const nextRefundId = data?.refundId;

    if (typeof nextRefundId === "string") {
      setRefundId(nextRefundId);
    }
  }

  async function onLegacyRefundInquiry(event: FormEvent) {
    event.preventDefault();

    if (!isValidAppId(appId) || !token.trim() || !refundId.trim()) {
      setMessage("Se requiere X-App-Id válido, JWT y refundId para inquiry-refund.");
      return;
    }

    setMessage("");

    await callApi("Legacy POST /v1/payment/inquiry-refund", "/v1/payment/inquiry-refund", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-App-Id": appId.trim(),
        Authorization: `Bearer ${token.trim()}`,
      },
      body: JSON.stringify({ refundId: refundId.trim() }),
    });
  }

  async function onOpenPaymentInBridge(event: FormEvent) {
    event.preventDefault();

    if (!paymentUrl.trim()) {
      setMessage("No hay paymentUrl para abrir.");
      return;
    }

    const bridge = getBridge();
    if (bridge) {
      bridge.call("pay", { paymentUrl: paymentUrl.trim() });
      setMessage("Flujo de pago enviado al bridge.");
      return;
    }

    window.open(paymentUrl.trim(), "_blank", "noopener,noreferrer");
    setMessage("Bridge no disponible: se abrió paymentUrl en nueva pestaña.");
  }

  return (
    <main className="demo-page">
      <header className="demo-header">
        <div>
          <h1>Runner Integral API</h1>
          <p>Incluye pruebas Swagger y flujo legacy de autenticación Toka para validar extremo a extremo.</p>
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
        <h2>Configuración común</h2>
        <div className="demo-grid">
          <label>
            URL base API
            <input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="https://api.tu-dominio.com" />
          </label>
          <label>
            JWT
            <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="Bearer token" />
          </label>
          <label>
            Headers extra JSON
            <input value={extraHeadersJson} onChange={(e) => setExtraHeadersJson(e.target.value)} placeholder='{"X-App-Id":"abc"}' />
          </label>
          <label>
            Transporte
            <select value={useServerProxy ? "proxy" : "direct"} onChange={(e) => setUseServerProxy(e.target.value === "proxy")}>
              <option value="proxy">Proxy seguro (recomendado en HTTPS)</option>
              <option value="direct">Directo desde navegador</option>
            </select>
          </label>
        </div>
        <p className="subtle" style={{ marginTop: 10 }}>
          En Vercel HTTPS, usa proxy para evitar bloqueo por mixed-content al consumir APIs HTTP.
        </p>
      </section>

      <section className="demo-panel">
        <h2>Flujo legacy Toka auth y pagos</h2>
        <div className="demo-grid">
          <label>
            X-App-Id (16)
            <input value={appId} onChange={(e) => setAppId(e.target.value)} placeholder="xxxxxxxxxxxxxxxx" />
          </label>
          <label>
            MerchantCode (5)
            <input value={merchantCode} onChange={(e) => setMerchantCode(e.target.value)} placeholder="xxxxx" />
          </label>
          <label>
            User ID
            <input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="0000000000000000" />
          </label>
          <label>
            Auth code
            <input value={authCode} onChange={(e) => setAuthCode(e.target.value)} placeholder="QZvGrF" />
          </label>
          <label>
            AuthCodes CSV (max 5)
            <input value={authCodesCsv} onChange={(e) => setAuthCodesCsv(e.target.value)} placeholder="rNAeg7,IfDTCP" />
          </label>
          <label>
            Order title
            <input value={orderTitle} onChange={(e) => setOrderTitle(e.target.value)} placeholder="Demo TokaTribe" />
          </label>
          <label>
            Order amount MXN
            <input value={orderAmountValue} onChange={(e) => setOrderAmountValue(e.target.value)} placeholder="500" />
          </label>
          <label>
            Payment ID
            <input value={paymentId} onChange={(e) => setPaymentId(e.target.value)} placeholder="paymentId" />
          </label>
          <label>
            Payment URL
            <input value={paymentUrl} onChange={(e) => setPaymentUrl(e.target.value)} placeholder="https://..." />
          </label>
          <label>
            Refund amount MXN
            <input value={refundAmountValue} onChange={(e) => setRefundAmountValue(e.target.value)} placeholder="500" />
          </label>
          <label>
            Refund ID
            <input value={refundId} onChange={(e) => setRefundId(e.target.value)} placeholder="refundId" />
          </label>
        </div>

        <div className="demo-actions demo-actions--buttons">
          <form onSubmit={onGetDigitalIdentityCode}><button type="submit" disabled={loadingAction === "Bridge auth code"}>Obtener auth code desde bridge</button></form>
          <form onSubmit={onLegacyAuthenticate}><button type="submit" disabled={loadingAction === "Legacy POST /v1/user/authenticate"}>POST /v1/user/authenticate</button></form>
          <form onSubmit={onLegacyUserInfo}><button type="submit" disabled={loadingAction === "Legacy POST /v1/user/info"}>POST /v1/user/info</button></form>
          <form onSubmit={onLegacyCreatePayment}><button type="submit" disabled={loadingAction === "Legacy POST /v1/payment/create"}>POST /v1/payment/create</button></form>
          <form onSubmit={onOpenPaymentInBridge}><button type="submit">Abrir paymentUrl en pay</button></form>
          <form onSubmit={onLegacyPaymentInquiry}><button type="submit" disabled={loadingAction === "Legacy POST /v1/payment/inquiry"}>POST /v1/payment/inquiry</button></form>
          <form onSubmit={onLegacyPaymentClose}><button type="submit" disabled={loadingAction === "Legacy POST /v1/payment/close"}>POST /v1/payment/close</button></form>
          <form onSubmit={onLegacyRefundCreate}><button type="submit" disabled={loadingAction === "Legacy POST /v1/payment/refund"}>POST /v1/payment/refund</button></form>
          <form onSubmit={onLegacyRefundInquiry}><button type="submit" disabled={loadingAction === "Legacy POST /v1/payment/inquiry-refund"}>POST /v1/payment/inquiry-refund</button></form>
        </div>
      </section>

      <section className="demo-panel">
        <h2>Ejecutor OpenAPI (Swagger)</h2>
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
