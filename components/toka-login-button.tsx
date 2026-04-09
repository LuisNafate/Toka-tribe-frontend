"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useTokaBridge } from "@/hooks/useTokaBridge";
import { exchangeAuthCode, saveSessionToken } from "@/services/auth.service";
import { TokaApi } from "@/services/toka-api.service";

type TokaLoginButtonProps = {
  className?: string;
  children?: ReactNode;
  redirectTo?: string;
  showDiagnostics?: boolean;
  autoStart?: boolean;
};

export function TokaLoginButton({
  className,
  children,
  redirectTo = "/dashboard",
  showDiagnostics = false,
  autoStart = false,
}: TokaLoginButtonProps) {
  const router = useRouter();
  const { getDigitalIdentityCode, getPersonalInformationCode, isLoading, isBridgeReady, error: bridgeError } = useTokaBridge();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("idle");
  const hasAutoStarted = useRef(false);

  /** Detecta si un username parece un ID provisional generado por el backend (no un nombre real). */
  function looksLikeProvisionalId(username: string | null | undefined): boolean {
    if (!username) return true;
    const u = username.trim();
    if (u.length === 0) return true;
    if (/^toka_/i.test(u)) return true;
    if (/^[0-9a-f\-]{32,}$/i.test(u)) return true;
    return false;
  }

  async function handleLogin() {
    setError(null);
    setStatus("Solicitando autorización en Toka Bridge...");

    try {
      let authCode = "";
      try {
        authCode = await getDigitalIdentityCode();
        setStatus("Autorización recibida. Enviando a NestJS...");
      } catch (bridgeErr) {
        const message = bridgeErr instanceof Error ? bridgeErr.message : "Error desconocido del bridge.";
        setError(`[BRIDGE] No se pudo completar el acceso. Detalle: ${message}`);
        setStatus("Fallo en etapa BRIDGE");
        return;
      }

      const { token } = await exchangeAuthCode(authCode);
      saveSessionToken(token);

      setStatus("Acceso validado. Sincronizando perfil...");
      const allAuthCodes: string[] = [authCode];

      try {
        await TokaApi.authSyncProfile(allAuthCodes);
        setStatus("Perfil sincronizado. Verificando nombre...");
      } catch (syncErr) {
        const syncMessage = syncErr instanceof Error ? syncErr.message : "Error desconocido en sync-profile.";
        setStatus(`Sync inicial omitido: ${syncMessage}. Verificando nombre...`);
      }

      void (async () => {
        try {
          const usersMeRes = await TokaApi.usersMe();
          const currentUsername =
            (usersMeRes as { data?: { username?: string }; username?: string })?.data?.username ??
            (usersMeRes as { username?: string })?.username ??
            null;

          if (looksLikeProvisionalId(currentUsername)) {
            try {
              const personalAuthCode = await getPersonalInformationCode();
              await TokaApi.authSyncProfile([authCode, personalAuthCode]);
            } catch {
              // Si el bridge de info personal falla (o el sync), es tolerable.
            }

            try {
              const authMeRes = await TokaApi.authMe();
              const resolvedName =
                (authMeRes as { data?: { username?: string; nickname?: string; name?: string }; username?: string; nickname?: string; name?: string })?.data?.username ??
                (authMeRes as { data?: { username?: string; nickname?: string; name?: string }; username?: string; nickname?: string; name?: string })?.data?.nickname ??
                (authMeRes as { data?: { username?: string; nickname?: string; name?: string }; username?: string; nickname?: string; name?: string })?.data?.name ??
                (authMeRes as { username?: string })?.username ??
                (authMeRes as { nickname?: string })?.nickname ??
                null;

              if (resolvedName && !looksLikeProvisionalId(resolvedName)) {
                await TokaApi.usersUpdateMe({ username: resolvedName });
              }
            } catch {
              // Fallback silencioso.
            }
          }
        } catch {
          // Cualquier fallo en la sincronización de nombre es silencioso.
        }
      })();

      setStatus("Redirigiendo...");
      router.push(redirectTo);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error externo no tipificado.";
      setError(`[NEST_AUTH] Falló el acceso con NestJS. Detalle: ${message}`);
      setStatus("Fallo en etapa NEST_AUTH");
    }
  }

  useEffect(() => {
    if (!autoStart || hasAutoStarted.current || isLoading || !isBridgeReady) {
      return;
    }

    hasAutoStarted.current = true;
    void handleLogin();
  }, [autoStart, isBridgeReady, isLoading]);

  return (
    <>
      <button type="button" className={className} onClick={handleLogin} disabled={isLoading}>
        {isLoading ? "Conectando..." : (children ?? "Entrar con Toka")}
      </button>
      {(autoStart || showDiagnostics) && status !== "idle" ? (
        <p style={{ marginTop: 8, color: "#24446d", fontSize: 12, fontWeight: 600 }} aria-live="polite">
          {status}
        </p>
      ) : null}
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
        </div>
      ) : null}
    </>
  );
}
