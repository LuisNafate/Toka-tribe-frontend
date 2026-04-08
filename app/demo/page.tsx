"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

type ApiResult = {
  action: string;
  ok: boolean;
  status?: number;
  payload: unknown;
};

const DEFAULT_BASE_URL = "http://talentland-toka.eastus2.cloudapp.azure.com";

export default function DemoPage() {
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL);
  const [appId, setAppId] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [token, setToken] = useState("");
  const [authCodesCsv, setAuthCodesCsv] = useState("");
  const [loadingAction, setLoadingAction] = useState("");
  const [lastResult, setLastResult] = useState<ApiResult | null>(null);

  async function callApi(action: string, path: string, options: RequestInit = {}) {
    setLoadingAction(action);
    try {
      const response = await fetch(`${baseUrl}${path}`, options);
      let payload: unknown = null;

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

      if (action === "Autenticar" && response.ok && typeof payload === "object" && payload) {
        const maybeToken = (payload as { data?: { accessToken?: string } }).data?.accessToken;
        if (maybeToken) setToken(maybeToken);
      }

      setLastResult(result);
    } catch (error) {
      setLastResult({
        action,
        ok: false,
        payload: {
          message: "No se pudo conectar con la API. Revisa CORS, red o URL base.",
          error: error instanceof Error ? error.message : String(error),
        },
      });
    } finally {
      setLoadingAction("");
    }
  }

  function onHealth(e: FormEvent) {
    e.preventDefault();
    callApi("Health", "/health", { method: "POST" });
  }

  function onAuthenticate(e: FormEvent) {
    e.preventDefault();
    callApi("Autenticar", "/v1/user/authenticate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-App-Id": appId,
      },
      body: JSON.stringify({ authcode: authCode }),
    });
  }

  function onUserInfo(e: FormEvent) {
    e.preventDefault();
    const authCodes = authCodesCsv
      .split(",")
      .map((code) => code.trim())
      .filter(Boolean);

    callApi("User info", "/v1/user/info", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-App-Id": appId,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ authCodes }),
    });
  }

  return (
    <main className="demo-page">
      <header className="demo-header">
        <div>
          <h1>Demo Integración API</h1>
          <p>Vista mínima para validar conectividad, autenticación y datos de usuario en schema v2.</p>
        </div>
        <Link href="/" className="demo-back-link">Volver a landing</Link>
      </header>

      <section className="demo-panel">
        <h2>Configuración</h2>
        <div className="demo-grid">
          <label>
            URL base API
            <input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="http://..." />
          </label>
          <label>
            X-App-Id (16 chars)
            <input value={appId} onChange={(e) => setAppId(e.target.value)} placeholder="xxxxxxxxxxxxxxxx" />
          </label>
          <label>
            Bearer token
            <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="JWT token" />
          </label>
        </div>
      </section>

      <section className="demo-panel">
        <h2>Pruebas rápidas</h2>
        <div className="demo-actions">
          <form onSubmit={onHealth}>
            <button type="submit" disabled={loadingAction === "Health"}>{loadingAction === "Health" ? "Probando..." : "POST /health"}</button>
          </form>

          <form onSubmit={onAuthenticate} className="demo-inline-form">
            <input value={authCode} onChange={(e) => setAuthCode(e.target.value)} placeholder="authcode (ej. QZvGrF)" />
            <button type="submit" disabled={!appId || !authCode || loadingAction === "Autenticar"}>
              {loadingAction === "Autenticar" ? "Autenticando..." : "POST /v1/user/authenticate"}
            </button>
          </form>

          <form onSubmit={onUserInfo} className="demo-inline-form">
            <input
              value={authCodesCsv}
              onChange={(e) => setAuthCodesCsv(e.target.value)}
              placeholder="authCodes separados por coma"
            />
            <button type="submit" disabled={!appId || !token || !authCodesCsv || loadingAction === "User info"}>
              {loadingAction === "User info" ? "Consultando..." : "POST /v1/user/info"}
            </button>
          </form>
        </div>
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
          <p>Ejecuta una prueba para ver resultados.</p>
        )}
      </section>
    </main>
  );
}
