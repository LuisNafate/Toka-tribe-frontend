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
  const [merchantCode, setMerchantCode] = useState("");
  const [userId, setUserId] = useState("");
  const [orderTitle, setOrderTitle] = useState("Demo TokaTribe");
  const [orderAmountValue, setOrderAmountValue] = useState("500");
  const [paymentId, setPaymentId] = useState("");
  const [paymentUrl, setPaymentUrl] = useState("");
  const [refundAmountValue, setRefundAmountValue] = useState("500");
  const [refundId, setRefundId] = useState("");
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
        const data = (payload as { data?: { accessToken?: string; userId?: string } }).data;
        const maybeToken = data?.accessToken;
        const maybeUserId = data?.userId;
        if (maybeToken) setToken(maybeToken);
        if (maybeUserId) setUserId(maybeUserId);
      }

      if (action === "Crear pago" && response.ok && typeof payload === "object" && payload) {
        const data = (payload as { data?: { paymentId?: string; paymentUrl?: string } }).data;
        if (data?.paymentId) setPaymentId(data.paymentId);
        if (data?.paymentUrl) setPaymentUrl(data.paymentUrl);
      }

      if (action === "Solicitar refund" && response.ok && typeof payload === "object" && payload) {
        const maybeRefundId = (payload as { data?: { refundId?: string } }).data?.refundId;
        if (maybeRefundId) setRefundId(maybeRefundId);
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

  function onPaymentCreate(e: FormEvent) {
    e.preventDefault();
    callApi("Crear pago", "/v1/payment/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-App-Id": appId,
        Authorization: `Bearer ${token}`,
        "Alipay-MerchantCode": merchantCode,
      },
      body: JSON.stringify({
        userId,
        orderTitle,
        orderAmount: {
          value: orderAmountValue,
          currency: "MXN",
        },
      }),
    });
  }

  function onPaymentInquiry(e: FormEvent) {
    e.preventDefault();
    callApi("Consultar pago", "/v1/payment/inquiry", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-App-Id": appId,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ paymentId }),
    });
  }

  function onPaymentClose(e: FormEvent) {
    e.preventDefault();
    callApi("Cerrar pago", "/v1/payment/close", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-App-Id": appId,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ paymentId }),
    });
  }

  function onRefundCreate(e: FormEvent) {
    e.preventDefault();
    callApi("Solicitar refund", "/v1/payment/refund", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-App-Id": appId,
        Authorization: `Bearer ${token}`,
        "Alipay-MerchantCode": merchantCode,
      },
      body: JSON.stringify({
        userId,
        paymentId,
        refundAmount: {
          value: refundAmountValue,
          currency: "MXN",
        },
      }),
    });
  }

  function onRefundInquiry(e: FormEvent) {
    e.preventDefault();
    callApi("Consultar refund", "/v1/payment/inquiry-refund", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-App-Id": appId,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ refundId }),
    });
  }

  function onOpenPaymentUrl(e: FormEvent) {
    e.preventDefault();
    if (!paymentUrl) return;

    if (typeof window !== "undefined" && (window as typeof window & { AlipayJSBridge?: { call: (method: string, payload: unknown) => void } }).AlipayJSBridge) {
      (window as typeof window & { AlipayJSBridge: { call: (method: string, payload: unknown) => void } }).AlipayJSBridge.call("pay", {
        paymentUrl,
      });
      return;
    }

    window.open(paymentUrl, "_blank", "noopener,noreferrer");
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
          <label>
            Merchant Code (5 chars)
            <input value={merchantCode} onChange={(e) => setMerchantCode(e.target.value)} placeholder="xxxxx" />
          </label>
          <label>
            User ID
            <input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="userId" />
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
        <h2>Simulador de pagos</h2>
        <div className="demo-actions">
          <form onSubmit={onPaymentCreate} className="demo-inline-form">
            <input value={orderTitle} onChange={(e) => setOrderTitle(e.target.value)} placeholder="orderTitle" />
            <input value={orderAmountValue} onChange={(e) => setOrderAmountValue(e.target.value)} placeholder="monto MXN" />
            <button type="submit" disabled={!appId || !token || !merchantCode || !userId || loadingAction === "Crear pago"}>
              {loadingAction === "Crear pago" ? "Creando..." : "POST /v1/payment/create"}
            </button>
          </form>

          <form onSubmit={onOpenPaymentUrl} className="demo-inline-form">
            <input value={paymentUrl} onChange={(e) => setPaymentUrl(e.target.value)} placeholder="paymentUrl devuelto por create" />
            <button type="submit" disabled={!paymentUrl}>Abrir flujo de pago</button>
          </form>

          <form onSubmit={onPaymentInquiry} className="demo-inline-form">
            <input value={paymentId} onChange={(e) => setPaymentId(e.target.value)} placeholder="paymentId" />
            <button type="submit" disabled={!appId || !token || !paymentId || loadingAction === "Consultar pago"}>
              {loadingAction === "Consultar pago" ? "Consultando..." : "POST /v1/payment/inquiry"}
            </button>
          </form>

          <form onSubmit={onPaymentClose} className="demo-inline-form">
            <input value={paymentId} onChange={(e) => setPaymentId(e.target.value)} placeholder="paymentId" />
            <button type="submit" disabled={!appId || !token || !paymentId || loadingAction === "Cerrar pago"}>
              {loadingAction === "Cerrar pago" ? "Cerrando..." : "POST /v1/payment/close"}
            </button>
          </form>

          <form onSubmit={onRefundCreate} className="demo-inline-form">
            <input value={refundAmountValue} onChange={(e) => setRefundAmountValue(e.target.value)} placeholder="refund MXN" />
            <button type="submit" disabled={!appId || !token || !merchantCode || !userId || !paymentId || loadingAction === "Solicitar refund"}>
              {loadingAction === "Solicitar refund" ? "Solicitando..." : "POST /v1/payment/refund"}
            </button>
          </form>

          <form onSubmit={onRefundInquiry} className="demo-inline-form">
            <input value={refundId} onChange={(e) => setRefundId(e.target.value)} placeholder="refundId" />
            <button type="submit" disabled={!appId || !token || !refundId || loadingAction === "Consultar refund"}>
              {loadingAction === "Consultar refund" ? "Consultando..." : "POST /v1/payment/inquiry-refund"}
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
