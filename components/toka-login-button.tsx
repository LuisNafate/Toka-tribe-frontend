"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useTokaBridge } from "@/hooks/useTokaBridge";
import { exchangeAuthCode, saveSessionToken } from "@/services/auth.service";
import { TokaApi } from "@/services/toka-api.service";

const AUTH_CODES_DEBUG_KEY = "tokatribe.debug.authcodes";

type TokaLoginButtonProps = {
  className?: string;
  children?: ReactNode;
  redirectTo?: string;
  showDiagnostics?: boolean;
};

export function TokaLoginButton({ className, children, redirectTo = "/dashboard", showDiagnostics = false }: TokaLoginButtonProps) {
  const router = useRouter();
  const { getDigitalIdentityCode, isLoading, isBridgeReady, error: bridgeError } = useTokaBridge();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("idle");
  const [lastAuthCode, setLastAuthCode] = useState<string | null>(null);
  const [authCodeHistory, setAuthCodeHistory] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTH_CODES_DEBUG_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as string[];
      if (Array.isArray(parsed)) {
        setAuthCodeHistory(parsed);
        setLastAuthCode(parsed[0] ?? null);
      }
    } catch {
      // ignore localStorage parsing errors
    }
  }, []);

  function persistAuthCode(code: string) {
    setLastAuthCode(code);
    setAuthCodeHistory((current) => {
      const next = [code, ...current.filter((item) => item !== code)].slice(0, 8);
      try {
        localStorage.setItem(AUTH_CODES_DEBUG_KEY, JSON.stringify(next));
      } catch {
        // ignore localStorage failures
      }
      return next;
    });
  }

  async function handleLogin() {
    setError(null);
    setStatus("Solicitando authCode a Toka Bridge...");

    try {
      let authCode = "";
      try {
        authCode = await getDigitalIdentityCode();
        persistAuthCode(authCode);
        setStatus(`AuthCode recibido: ${authCode}. Enviando a NestJS...`);
      } catch (bridgeErr) {
        const message = bridgeErr instanceof Error ? bridgeErr.message : "Error desconocido del bridge.";
        setError(`[BRIDGE] No se pudo obtener authCode. Detalle: ${message}`);
        setStatus("Fallo en etapa BRIDGE");
        return;
      }

      const { token } = await exchangeAuthCode(authCode);
      saveSessionToken(token);

      // Sync no bloqueante: si falla, el login principal continua para no romper UX.
      setStatus("JWT guardado. Sincronizando perfil...");
      try {
        await TokaApi.authSyncProfile([authCode]);
        setStatus("Perfil sincronizado. Redirigiendo...");
      } catch (syncErr) {
        const syncMessage = syncErr instanceof Error ? syncErr.message : "Error desconocido en sync-profile.";
        setStatus(`JWT guardado. Sync perfil omitido: ${syncMessage}. Redirigiendo...`);
      }

      router.push(redirectTo);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error externo no tipificado.";
      setError(`[NEST_AUTH] Falló el intercambio de authCode con NestJS. Detalle: ${message}`);
      setStatus("Fallo en etapa NEST_AUTH");
    }
  }

  return (
    <>
      <button type="button" className={className} onClick={handleLogin} disabled={isLoading}>
        {isLoading ? "Conectando..." : (children ?? "Entrar con Toka")}
      </button>
      {(error || bridgeError) ? (
        <p style={{ marginTop: 8, color: "#b42318", fontSize: 12, fontWeight: 600 }} role="alert">
          {error ?? bridgeError}
        </p>
      ) : null}
      {showDiagnostics ? (
        <div
          style={{
            marginTop: 10,
            border: "1px solid #d5deee",
            borderRadius: 10,
            background: "#f8fbff",
            padding: 10,
            fontSize: 11,
            lineHeight: 1.45,
            color: "#0b1f36",
          }}
        >
          <div><strong>Diagnostico Auth Toka</strong></div>
          <div>Bridge listo: <strong>{isBridgeReady ? "SI" : "NO"}</strong></div>
          <div>App ID (env): <strong>{process.env.NEXT_PUBLIC_TOKA_APP_ID || "NO_CONFIGURADO"}</strong></div>
          <div>API base (env): <strong>{process.env.NEXT_PUBLIC_API_BASE_URL || "NO_CONFIGURADO"}</strong></div>
          <div>Estado: <strong>{status}</strong></div>
          <div>Ultimo authCode: <strong>{lastAuthCode ?? "Aun no recibido"}</strong></div>
          <div>Historial authCodes ({authCodeHistory.length}):</div>
          <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
            {authCodeHistory.length === 0 ? <li>Sin codigos capturados</li> : null}
            {authCodeHistory.map((code) => (
              <li key={code}>{code}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}
