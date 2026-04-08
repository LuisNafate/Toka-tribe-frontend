"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";
import { useTokaBridge } from "@/hooks/useTokaBridge";
import { exchangeAuthCode, saveSessionToken } from "@/services/auth.service";

type TokaLoginButtonProps = {
  className?: string;
  children?: ReactNode;
  redirectTo?: string;
};

export function TokaLoginButton({ className, children, redirectTo = "/dashboard" }: TokaLoginButtonProps) {
  const router = useRouter();
  const { getDigitalIdentityCode, isLoading, error: bridgeError } = useTokaBridge();
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setError(null);

    try {
      const authCode = await getDigitalIdentityCode();
      const { token } = await exchangeAuthCode(authCode);
      saveSessionToken(token);
      router.push(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible iniciar sesión con Toka.");
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
    </>
  );
}
