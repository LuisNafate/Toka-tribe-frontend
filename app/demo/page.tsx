"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
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

type RealUserProfile = {
  userId?: string;
  nickName?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  mobilePhone?: string;
  email?: string;
  kycState?: string;
};

type BridgePayload = {
  authCode?: string;
  authcode?: string;
  auth_code?: string;
  [key: string]: unknown;
};

type BridgeApi = {
  call: (
    method: string,
    payload: Record<string, unknown>,
    callback?: (response: BridgePayload) => void,
  ) => void;
};

type MiniApi = {
  getAuthCode?: (payload: Record<string, unknown>, callback?: (response: unknown) => void) => void;
  getOpenUserInfo?: (payload: Record<string, unknown>, callback?: (response: unknown) => void) => void;
  getAuthUserInfo?: (payload: Record<string, unknown>, callback?: (response: unknown) => void) => void;
  getUserInfo?: (payload: Record<string, unknown>, callback?: (response: unknown) => void) => void;
  [key: string]: unknown;
};

const DEFAULT_BASE_URL = process.env.NEXT_PUBLIC_TOKA_API_BASE_URL ?? "http://talentland-toka.eastus2.cloudapp.azure.com";
const FALLBACK_TOKA_APP_ID = "3500020265479238";
const DEFAULT_APP_ID = (process.env.NEXT_PUBLIC_TOKA_APP_ID ?? "").trim().length === 16
  ? (process.env.NEXT_PUBLIC_TOKA_APP_ID ?? "").trim()
  : FALLBACK_TOKA_APP_ID;
const LEGACY_TOKA_APP_ID = FALLBACK_TOKA_APP_ID;
const DEFAULT_MERCHANT_CODE = process.env.NEXT_PUBLIC_TOKA_MERCHANT_CODE ?? "";
const DEFAULT_TEST_AUTH_CODE = process.env.NEXT_PUBLIC_TOKA_TEST_AUTH_CODE ?? "";
const SWAGGER_OPERATIONS = getApiOperations();
const SWAGGER_STATS = getApiStats();
const SWAGGER_TAGS = ["all", ...getApiTags()];
const FORBIDDEN_HEADER_KEYS = new Set(["host", "content-length"]);

export default function DemoPage() {
  const autoBootstrapAttemptedRef = useRef(false);
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL);
  const [useServerProxy, setUseServerProxy] = useState(true);
  const [token, setToken] = useState("");
  const [extraHeadersJson, setExtraHeadersJson] = useState("{}");
  const [tagFilter, setTagFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [operationId, setOperationId] = useState(SWAGGER_OPERATIONS[0]?.operationId ?? "");
  const [pathParamsJson, setPathParamsJson] = useState("{}");
  const [bodyJson, setBodyJson] = useState("{}");

  const [appId, setAppId] = useState(DEFAULT_APP_ID);
  const [merchantCode, setMerchantCode] = useState(DEFAULT_MERCHANT_CODE);
  const [authCode, setAuthCode] = useState(DEFAULT_TEST_AUTH_CODE);
  const [authCodesCsv, setAuthCodesCsv] = useState("");
  const [userId, setUserId] = useState("");
  const [orderTitle, setOrderTitle] = useState("Demo TokaTribe");
  const [orderAmountValue, setOrderAmountValue] = useState("500");
  const [paymentId, setPaymentId] = useState("");
  const [paymentUrl, setPaymentUrl] = useState("");
  const [refundAmountValue, setRefundAmountValue] = useState("500");
  const [refundId, setRefundId] = useState("");
  const [realUserProfile, setRealUserProfile] = useState<RealUserProfile | null>(null);
  const [bridgeDiagnostics, setBridgeDiagnostics] = useState<string>("");

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

  function getEffectiveAppId(): string {
    return LEGACY_TOKA_APP_ID;
  }

  function isValidMerchantCode(value: string) {
    return value.trim().length >= 5;
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

  function getMiniApi(namespace: "my" | "ap"): MiniApi | null {
    if (typeof window === "undefined") return null;
    const candidate = (window as unknown as Record<string, unknown>)[namespace];
    if (!candidate || typeof candidate !== "object") {
      return null;
    }
    return candidate as MiniApi;
  }

  async function waitForBridgeReady(timeoutMs = 4000): Promise<void> {
    if (getBridge()) return;
    if (typeof window === "undefined") return;

    await new Promise<void>((resolve) => {
      let settled = false;

      const done = () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeoutId);
        window.removeEventListener("AlipayJSBridgeReady", onReady as EventListener);
        resolve();
      };

      const onReady = () => done();
      const timeoutId = window.setTimeout(done, timeoutMs);
      window.addEventListener("AlipayJSBridgeReady", onReady as EventListener, { once: true });
    });
  }

  function extractAuthCodeFromPayload(payload: unknown): string | null {
    let normalizedPayload = payload;

    if (typeof normalizedPayload === "string") {
      try {
        normalizedPayload = JSON.parse(normalizedPayload);
      } catch {
        return null;
      }
    }

    if (!normalizedPayload || typeof normalizedPayload !== "object") {
      return null;
    }

    const queue: unknown[] = [normalizedPayload];
    let depth = 0;

    const keyCandidates = [
      "authCode",
      "authcode",
      "auth_code",
      "digitalIdentityAuthCode",
      "digital_identity_auth_code",
      "userAuthCode",
      "user_auth_code",
      "authorizationCode",
      "authorization_code",
      "result",
      "code",
    ];

    const maybeAuthCode = (value: unknown): string | null => {
      if (typeof value === "string") {
        const trimmed = value.trim();
        if (!trimmed) return null;

        const lower = trimmed.toLowerCase();
        const blockedValues = new Set([
          "success",
          "ok",
          "true",
          "false",
          "null",
          "undefined",
          "unknown",
          "10000",
        ]);
        if (blockedValues.has(lower)) return null;

        // authCode esperado: token no vacío, no solo numérico, con letras al menos.
        if (!/^\S{4,512}$/.test(trimmed)) return null;
        if (/^\d+$/.test(trimmed)) return null;
        if (!/[A-Za-z]/.test(trimmed)) return null;

        return trimmed;
      }

      if (Array.isArray(value) && value.length > 0) {
        return maybeAuthCode(value[0]);
      }

      return null;
    };

    while (queue.length > 0 && depth < 4) {
      const currentLevelCount = queue.length;

      for (let i = 0; i < currentLevelCount; i += 1) {
        const item = queue.shift();
        if (!item || typeof item !== "object") continue;

        const record = item as Record<string, unknown>;

        // Many bridge implementations return success in resultCode=10000 and
        // carry the auth code in `result` instead of `authCode`.
        const successCode = record.resultCode ?? record.result_code ?? record.code;
        const isSuccess = successCode === 10000 || successCode === "10000";
        if (isSuccess) {
          const fromResult = maybeAuthCode(record.result);
          if (fromResult) {
            return fromResult;
          }
        }

        for (const key of keyCandidates) {
          const extracted = maybeAuthCode(record[key]);
          if (extracted) {
            return extracted;
          }
        }

        for (const value of Object.values(record)) {
          if (value && typeof value === "object") {
            queue.push(value);
          }
        }
      }

      depth += 1;
    }

    return null;
  }

  function summarizeBridgePayload(payload: unknown): string {
    try {
      if (payload == null) return "respuesta vacia";
      if (typeof payload === "string") return `string(${payload.slice(0, 120)})`;
      if (typeof payload !== "object") return typeof payload;

      const record = payload as Record<string, unknown>;
      const keys = Object.keys(record).slice(0, 8);
      const status = [record.resultStatus, record.resultCode, record.error, record.errorMessage]
        .filter((v) => typeof v === "string" || typeof v === "number")
        .join("/");

      return `keys:[${keys.join(",")}]${status ? ` status:${status}` : ""}`;
    } catch {
      return "sin resumen";
    }
  }

  function isMerchantOnboardingError(payload: unknown): boolean {
    if (!payload || typeof payload !== "object") return false;

    const record = payload as Record<string, unknown>;
    const message = typeof record.message === "string" ? record.message.toLowerCase() : "";
    return message.includes("20040003") || message.includes("merchant does not onboard");
  }

  function extractUserProfileFromPayload(payload: unknown): RealUserProfile | null {
    if (!payload || typeof payload !== "object") {
      return null;
    }

    const queue: unknown[] = [payload];
    let depth = 0;

    while (queue.length > 0 && depth < 5) {
      const currentLevelCount = queue.length;

      for (let i = 0; i < currentLevelCount; i += 1) {
        const item = queue.shift();
        if (!item || typeof item !== "object") continue;

        const record = item as Record<string, unknown>;

        const candidate: RealUserProfile = {
          userId: typeof record.userId === "string"
            ? record.userId
            : (typeof record.user_id === "string" ? record.user_id : undefined),
          nickName: typeof record.nickName === "string"
            ? record.nickName
            : (typeof record.nick_name === "string" ? record.nick_name : undefined),
          fullName: typeof record.fullName === "string"
            ? record.fullName
            : (typeof record.name === "string" ? record.name : undefined),
          firstName: typeof record.firstName === "string" ? record.firstName : undefined,
          lastName: typeof record.lastName === "string" ? record.lastName : undefined,
          avatar: typeof record.avatar === "string"
            ? record.avatar
            : (typeof record.avatarUrl === "string" ? record.avatarUrl : undefined),
          mobilePhone: typeof record.mobilePhone === "string"
            ? record.mobilePhone
            : (typeof record.mobile === "string" ? record.mobile : undefined),
          email: typeof record.email === "string" ? record.email : undefined,
          kycState: typeof record.kycState === "string" ? record.kycState : undefined,
        };

        if (candidate.userId || candidate.nickName || candidate.fullName || candidate.firstName || candidate.lastName || candidate.email) {
          return candidate;
        }

        for (const value of Object.values(record)) {
          if (value && typeof value === "object") {
            queue.push(value);
          }
        }
      }

      depth += 1;
    }

    return null;
  }

  async function callBridgeMethod(
    bridge: BridgeApi,
    method: string,
    payload: Record<string, unknown>,
  ): Promise<unknown> {
    return await new Promise((resolve) => {
      let settled = false;
      const timeoutId = window.setTimeout(() => {
        if (settled) return;
        settled = true;
        resolve(null);
      }, 4500);

      try {
        bridge.call(method, payload, (response) => {
          if (settled) return;
          settled = true;
          window.clearTimeout(timeoutId);
          resolve(response);
        });
      } catch {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeoutId);
        resolve(null);
      }
    });
  }

  async function callMiniApiGetAuthCode(api: MiniApi, payload: Record<string, unknown>): Promise<unknown> {
    return await new Promise((resolve) => {
      if (!api.getAuthCode) {
        resolve(null);
        return;
      }

      let settled = false;
      const timeoutId = window.setTimeout(() => {
        if (settled) return;
        settled = true;
        resolve(null);
      }, 4500);

      try {
        api.getAuthCode(payload, (response) => {
          if (settled) return;
          settled = true;
          window.clearTimeout(timeoutId);
          resolve(response);
        });
      } catch {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeoutId);
        resolve(null);
      }
    });
  }

  async function callMiniApiMethod(
    api: MiniApi,
    methodName: "getOpenUserInfo" | "getAuthUserInfo" | "getUserInfo",
    payload: Record<string, unknown>,
  ): Promise<unknown> {
    return await new Promise((resolve) => {
      const method = api[methodName];
      if (typeof method !== "function") {
        resolve(null);
        return;
      }

      let settled = false;
      const timeoutId = window.setTimeout(() => {
        if (settled) return;
        settled = true;
        resolve(null);
      }, 4500);

      try {
        (method as (payload: Record<string, unknown>, cb?: (response: unknown) => void) => void)(
          payload,
          (response) => {
            if (settled) return;
            settled = true;
            window.clearTimeout(timeoutId);
            resolve(response);
          },
        );
      } catch {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeoutId);
        resolve(null);
      }
    });
  }

  async function tryLoadProfileFromMiniApi(): Promise<boolean> {
    const myApi = getMiniApi("my");
    const apApi = getMiniApi("ap");

    const attempts: Array<{ source: string; api: MiniApi | null; method: "getOpenUserInfo" | "getAuthUserInfo" | "getUserInfo"; payload: Record<string, unknown> }> = [
      { source: "my", api: myApi, method: "getOpenUserInfo", payload: {} },
      { source: "my", api: myApi, method: "getAuthUserInfo", payload: {} },
      { source: "my", api: myApi, method: "getUserInfo", payload: {} },
      { source: "ap", api: apApi, method: "getOpenUserInfo", payload: {} },
      { source: "ap", api: apApi, method: "getAuthUserInfo", payload: {} },
      { source: "ap", api: apApi, method: "getUserInfo", payload: {} },
    ];

    for (const attempt of attempts) {
      if (!attempt.api) continue;
      const response = await callMiniApiMethod(attempt.api, attempt.method, attempt.payload);
      const profile = extractUserProfileFromPayload(response);
      if (!profile) continue;

      setRealUserProfile((prev) => ({
        ...prev,
        ...profile,
      }));
      setBridgeDiagnostics((prev) => [prev, `${attempt.source}.${attempt.method} -> perfil ok`].filter(Boolean).join(" | "));
      return true;
    }

    return false;
  }

  async function tryLoadProfileFromBridgeCall(): Promise<boolean> {
    await waitForBridgeReady();
    const bridge = getBridge();
    if (!bridge) return false;

    const attempts: Array<{ method: string; payload: Record<string, unknown> }> = [
      { method: "getOpenUserInfo", payload: {} },
      { method: "getAuthUserInfo", payload: {} },
      { method: "getUserInfo", payload: {} },
      { method: "getUserInfo", payload: { scopes: ["USER_ID", "USER_AVATAR", "USER_NICKNAME"] } },
    ];

    for (const attempt of attempts) {
      const response = await callBridgeMethod(bridge, attempt.method, attempt.payload);
      const profile = extractUserProfileFromPayload(response);
      if (!profile) continue;

      setRealUserProfile((prev) => ({ ...prev, ...profile }));
      setBridgeDiagnostics((prev) => [prev, `bridge.${attempt.method} -> perfil ok`].filter(Boolean).join(" | "));
      return true;
    }

    return false;
  }

  async function onGetDigitalIdentityCode(event: FormEvent) {
    event.preventDefault();
    const code = await getDigitalIdentityCodeFromBridge();
    if (code) {
      setMessage("Auth code obtenido desde JSBridge.");
      return;
    }

    setMessage("No se obtuvo authCode del bridge en este intento.");
  }

  async function getDigitalIdentityCodeFromBridge(): Promise<string | null> {
    await waitForBridgeReady();

    const bridge = getBridge();
    const myApi = getMiniApi("my");
    const apApi = getMiniApi("ap");

    if (!bridge && !myApi && !apApi) {
      setBridgeDiagnostics("No se detectó bridge/my/ap en este contenedor.");
      return null;
    }

    setLoadingAction("Bridge auth code");
    setBridgeDiagnostics("");

    try {
      const diagnostics: string[] = [];

      const miniApiAttempts: Array<{ source: "my" | "ap"; api: MiniApi | null; payload: Record<string, unknown> }> = [
        { source: "my", api: myApi, payload: { scopes: "auth_user" } },
        { source: "my", api: myApi, payload: { scopes: ["auth_user"] } },
        { source: "my", api: myApi, payload: { scopeNicks: ["auth_user"] } },
        { source: "my", api: myApi, payload: { scopeNicks: ["auth_base"] } },
        { source: "ap", api: apApi, payload: { scopes: "auth_user" } },
        { source: "ap", api: apApi, payload: { scopes: ["auth_user"] } },
        { source: "ap", api: apApi, payload: { scopeNicks: ["auth_user"] } },
        { source: "ap", api: apApi, payload: { scopeNicks: ["auth_base"] } },
      ];

      for (const attempt of miniApiAttempts) {
        if (!attempt.api?.getAuthCode) continue;
        const response = await callMiniApiGetAuthCode(attempt.api, attempt.payload);
        const code = extractAuthCodeFromPayload(response);
        diagnostics.push(`${attempt.source}.getAuthCode -> ${code ? "ok" : "sin authCode"} (${summarizeBridgePayload(response)})`);
        if (!code) continue;

        setAuthCode(code);
        setBridgeDiagnostics(diagnostics.join(" | "));
        return code;
      }

      if (!bridge) {
        setBridgeDiagnostics(diagnostics.join(" | ") || "Bridge no disponible.");
        return null;
      }

      const attempts: Array<{ method: string; payload: Record<string, unknown> }> = [
        {
          method: "getUserDigitalIdentityAuthCode",
          payload: {
            usage: "Autenticar usuario en TokaTribe",
            scopes: ["USER_ID", "USER_AVATAR", "USER_NICKNAME"],
          },
        },
        {
          method: "getUserDigitalIdentityAuthCode",
          payload: {
            usage: "Autenticar usuario en TokaTribe",
            scopeNicks: ["USER_ID", "USER_AVATAR", "USER_NICKNAME"],
          },
        },
        {
          method: "getUserDigitalIdentityAuthCode",
          payload: {
            usage: "Autenticar usuario en TokaTribe",
            scopes: "USER_ID,USER_AVATAR,USER_NICKNAME",
          },
        },
        {
          method: "getAuthCode",
          payload: {
            scopes: "auth_user",
          },
        },
        {
          method: "getAuthCode",
          payload: {
            scopes: ["auth_user"],
          },
        },
        {
          method: "getAuthCode",
          payload: {
            scopeNicks: ["auth_user"],
          },
        },
        {
          method: "getAuthCode",
          payload: {
            scopeNicks: ["auth_base"],
          },
        },
      ];

      for (const attempt of attempts) {
        const response = await callBridgeMethod(bridge, attempt.method, attempt.payload);
        const code = extractAuthCodeFromPayload(response);
        diagnostics.push(`bridge.${attempt.method} -> ${code ? "ok" : "sin authCode"} (${summarizeBridgePayload(response)})`);
        if (!code) continue;

        setAuthCode(code);
        setBridgeDiagnostics(diagnostics.join(" | "));
        return code;
      }

      setBridgeDiagnostics(diagnostics.join(" | ") || "Bridge respondió sin authCode.");
      return null;
    } finally {
      setLoadingAction("");
    }
  }

  async function authenticateWithCode(code: string) {
    const effectiveAppId = getEffectiveAppId();
    const effectiveMerchantCodeRaw = merchantCode.trim() || DEFAULT_MERCHANT_CODE.trim();
    const merchantCandidates = Array.from(
      new Set([
        effectiveMerchantCodeRaw,
        effectiveMerchantCodeRaw.length > 5 ? effectiveMerchantCodeRaw.slice(0, 5) : "",
      ].filter(Boolean)),
    );

    let result = await callApi("Legacy POST /v1/user/authenticate", "/v1/user/authenticate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-App-Id": effectiveAppId,
      },
      body: JSON.stringify({ authcode: code.trim() }),
    });

    if (!result.ok && merchantCandidates.length > 0) {
      for (const merchantCandidate of merchantCandidates) {
        result = await callApi(
          `Legacy POST /v1/user/authenticate (merchant ${merchantCandidate})`,
          "/v1/user/authenticate",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-App-Id": effectiveAppId,
              "Alipay-MerchantCode": merchantCandidate,
              MerchantCode: merchantCandidate,
            },
            body: JSON.stringify({ authcode: code.trim() }),
          },
        );

        if (result.ok) break;
      }
    }

    const data = getResultData(result.payload);
    const nextToken = data?.accessToken;
    const nextUserId = data?.userId;

    if (typeof nextToken === "string") {
      setToken(nextToken);
    }

    if (typeof nextUserId === "string") {
      setUserId(nextUserId);
      setRealUserProfile((prev) => ({ ...prev, userId: nextUserId }));
    }

    return {
      ...result,
      nextToken: typeof nextToken === "string" ? nextToken : undefined,
      nextUserId: typeof nextUserId === "string" ? nextUserId : undefined,
    };
  }

  async function requestUserInfo(codes: string[], jwtOverride?: string) {
    const jwt = (jwtOverride ?? token).trim();
    const effectiveAppId = getEffectiveAppId();
    const effectiveMerchantCodeRaw = merchantCode.trim() || DEFAULT_MERCHANT_CODE.trim();

    if (!jwt) {
      return {
        action: "Legacy POST /v1/user/info",
        ok: false,
        status: 0,
        payload: { message: "JWT no disponible para /v1/user/info" },
      } as ApiResult;
    }

    const result = await callApi("Legacy POST /v1/user/info", "/v1/user/info", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-App-Id": effectiveAppId,
        ...(effectiveMerchantCodeRaw ? {
          "Alipay-MerchantCode": effectiveMerchantCodeRaw,
          MerchantCode: effectiveMerchantCodeRaw,
        } : {}),
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ authCodes: codes }),
    });

    const data = getResultData(result.payload);
    if (data) {
      setRealUserProfile({
        userId: typeof data.userId === "string" ? data.userId : userId || undefined,
        nickName: typeof data.nickName === "string" ? data.nickName : undefined,
        fullName: typeof data.fullName === "string" ? data.fullName : undefined,
        firstName: typeof data.firstName === "string" ? data.firstName : undefined,
        lastName: typeof data.lastName === "string" ? data.lastName : undefined,
        avatar: typeof data.avatar === "string" ? data.avatar : undefined,
        mobilePhone: typeof data.mobilePhone === "string" ? data.mobilePhone : undefined,
        email: typeof data.email === "string" ? data.email : undefined,
        kycState: typeof data.kycState === "string" ? data.kycState : undefined,
      });
    }

    return result;
  }

  const runAutoDemoFlow = useCallback(async (options?: { silentNoBridge?: boolean }) => {
    const effectiveAppId = getEffectiveAppId();
    if (effectiveAppId && effectiveAppId !== appId.trim()) {
      setAppId(effectiveAppId);
    }

    if (!isValidAppId(effectiveAppId)) {
      if (!options?.silentNoBridge) {
        setMessage("Configura un X-App-Id válido (exactamente 16 caracteres) para ejecutar automático.");
      }
      return;
    }

    if (!merchantCode.trim() && DEFAULT_MERCHANT_CODE) {
      setMerchantCode(DEFAULT_MERCHANT_CODE);
    }

    let code = authCode.trim();
    if (!code) {
      const bridgeCode = await getDigitalIdentityCodeFromBridge();
      if (bridgeCode) {
        code = bridgeCode;
      }
    }

    if (!code && DEFAULT_TEST_AUTH_CODE) {
      code = DEFAULT_TEST_AUTH_CODE;
      setAuthCode(code);
    }

    if (!code) {
      const hasProfileFallback = await tryLoadProfileFromMiniApi();
      if (hasProfileFallback) {
        setMessage("No hubo authCode, pero se cargó perfil básico desde bridge.");
        return;
      }

      if (!options?.silentNoBridge) {
        setMessage("No se pudo obtener authCode automáticamente desde el bridge.");
      }
      return;
    }

    setMessage("Ejecutando prueba automática: authenticate -> user/info...");

    const authResult = await authenticateWithCode(code);
    if (!authResult.ok) {
      if (isMerchantOnboardingError(authResult.payload)) {
        const fromBridgeCall = await tryLoadProfileFromBridgeCall();
        if (fromBridgeCall) {
          setMessage("Merchant no onboarded para authenticate, pero se cargó perfil desde bridge.");
          return;
        }
      }

      const hasProfileFallback = await tryLoadProfileFromMiniApi();
      if (hasProfileFallback) {
        setMessage("Authenticate falló, pero se cargó perfil básico desde bridge.");
        return;
      }

      setMessage(`Falló authenticate automático con X-App-Id ${getEffectiveAppId()}. Revisa la última respuesta.`);
      return;
    }

    const authCodes = [code];
    setAuthCodesCsv(authCodes.join(","));

    const infoResult = await requestUserInfo(authCodes, authResult.nextToken ?? token);
    if (!infoResult.ok) {
      setMessage("Authenticate OK, pero falló user/info. Revisa la última respuesta.");
      return;
    }

    setMessage("Prueba automática completada. Token y datos reales cargados.");
  }, [appId, authCode, merchantCode, token]);

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

    await authenticateWithCode(authCode.trim());
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

    await requestUserInfo(authCodes);
  }

  async function onAutoCompleteAndRunDemo(event: FormEvent) {
    event.preventDefault();
    await runAutoDemoFlow();
  }

  useEffect(() => {
    if (autoBootstrapAttemptedRef.current) return;
    autoBootstrapAttemptedRef.current = true;

    if (!getBridge()) {
      return;
    }

    void runAutoDemoFlow({ silentNoBridge: true });
  }, [runAutoDemoFlow]);

  async function onLegacyCreatePayment(event: FormEvent) {
    event.preventDefault();

    if (!isValidAppId(appId)) {
      setMessage("X-App-Id debe tener exactamente 16 caracteres.");
      return;
    }

    if (!isValidMerchantCode(merchantCode)) {
      setMessage("Alipay-MerchantCode debe tener al menos 5 caracteres.");
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
      setMessage("Alipay-MerchantCode debe tener al menos 5 caracteres.");
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
            X-App-Id (min 16)
            <input value={appId} readOnly placeholder="d2f08cef270c438f..." />
          </label>
          <label>
            MerchantCode (min 5)
            <input value={merchantCode} readOnly placeholder="301002382605" />
          </label>
          <label>
            User ID
            <input value={userId} readOnly placeholder="0000000000000000" />
          </label>
          <label>
            Auth code
            <input value={authCode} readOnly placeholder="QZvGrF" />
          </label>
          <label>
            AuthCodes CSV (max 5)
            <input value={authCodesCsv} readOnly placeholder="rNAeg7,IfDTCP" />
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

        <p className="subtle" style={{ marginTop: 10 }}>
          Identidad automática activa: al abrir esta vista en miniapp se intenta obtener authCode y cargar perfil sin intervención.
        </p>

        <div className="demo-actions demo-actions--buttons">
          <form onSubmit={onAutoCompleteAndRunDemo}><button type="submit" disabled={loadingAction !== ""}>Reintentar carga automática</button></form>
          <form onSubmit={onLegacyCreatePayment}><button type="submit" disabled={loadingAction === "Legacy POST /v1/payment/create"}>POST /v1/payment/create</button></form>
          <form onSubmit={onOpenPaymentInBridge}><button type="submit">Abrir paymentUrl en pay</button></form>
          <form onSubmit={onLegacyPaymentInquiry}><button type="submit" disabled={loadingAction === "Legacy POST /v1/payment/inquiry"}>POST /v1/payment/inquiry</button></form>
          <form onSubmit={onLegacyPaymentClose}><button type="submit" disabled={loadingAction === "Legacy POST /v1/payment/close"}>POST /v1/payment/close</button></form>
          <form onSubmit={onLegacyRefundCreate}><button type="submit" disabled={loadingAction === "Legacy POST /v1/payment/refund"}>POST /v1/payment/refund</button></form>
          <form onSubmit={onLegacyRefundInquiry}><button type="submit" disabled={loadingAction === "Legacy POST /v1/payment/inquiry-refund"}>POST /v1/payment/inquiry-refund</button></form>
        </div>

        <div style={{ marginTop: 14 }}>
          <h3 style={{ margin: "0 0 8px" }}>Datos reales del usuario</h3>
          {bridgeDiagnostics && (
            <p className="subtle" style={{ marginBottom: 8 }}><strong>Diagnóstico bridge:</strong> {bridgeDiagnostics}</p>
          )}
          {realUserProfile ? (
            <div className="demo-grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
              <div><strong>Verificación:</strong> {realUserProfile.fullName ?? realUserProfile.nickName ?? realUserProfile.userId ?? "-"}</div>
              <div><strong>User ID:</strong> {realUserProfile.userId ?? "-"}</div>
              <div><strong>Nickname:</strong> {realUserProfile.nickName ?? "-"}</div>
              <div><strong>Nombre:</strong> {realUserProfile.fullName ?? realUserProfile.firstName ?? "-"}</div>
              <div><strong>Apellido:</strong> {realUserProfile.lastName ?? "-"}</div>
              <div><strong>Teléfono:</strong> {realUserProfile.mobilePhone ?? "-"}</div>
              <div><strong>Email:</strong> {realUserProfile.email ?? "-"}</div>
              <div><strong>KYC:</strong> {realUserProfile.kycState ?? "-"}</div>
              <div><strong>Avatar:</strong> {realUserProfile.avatar ? "Disponible" : "-"}</div>
            </div>
          ) : (
            <p className="subtle">Aún no hay datos. Si estás en miniapp, se cargarán automáticamente en unos segundos.</p>
          )}
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
