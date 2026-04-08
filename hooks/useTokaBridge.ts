"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { TokaAuthMethod, TokaAuthScope, TokaBridgeResponse } from "@/types/toka";

const DEFAULT_SCOPES: Record<TokaAuthMethod, TokaAuthScope[]> = {
  getUserDigitalIdentityAuthCode: ["USER_ID", "USER_AVATAR", "USER_NICKNAME"],
  getUserContactInformationAuthCode: ["PLAINTEXT_MOBILE_PHONE", "PLAINTEXT_EMAIL_ADDRESS"],
  getUserAddressInformationAuthCode: ["USER_ADDRESS"],
  getUserPersonalInformationAuthCode: [
    "USER_NAME",
    "USER_FIRST_SURNAME",
    "USER_SECOND_SURNAME",
    "USER_GENDER",
    "USER_BIRTHDAY",
    "USER_STATE_OF_BIRTH",
    "USER_NATIONALITY",
  ],
  getUserKYCStatusAuthCode: ["USER_KYC_STATUS"],
};

function mapBridgeError(response: TokaBridgeResponse): string {
  if (response.errorMessage) return response.errorMessage;
  if (typeof response.error !== "undefined") return `Bridge error: ${String(response.error)}`;
  if (response.resultCode && response.resultCode !== 10000) {
    return response.resultMsg ?? `Bridge resultCode no exitoso: ${response.resultCode}`;
  }
  return "No se pudo obtener el authCode desde Toka Bridge.";
}

export function useTokaBridge() {
  const [isBridgeReady, setIsBridgeReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function handleReady() {
      setIsBridgeReady(Boolean(window.AlipayJSBridge));
    }

    handleReady();
    document.addEventListener("AlipayJSBridgeReady", handleReady);

    return () => {
      document.removeEventListener("AlipayJSBridgeReady", handleReady);
    };
  }, []);

  const getAuthCode = useCallback(async (method: TokaAuthMethod, scopes: TokaAuthScope[]) => {
    setError(null);

    if (typeof window === "undefined" || !window.AlipayJSBridge) {
      const message = "Toka Bridge no disponible. Abre la app dentro del WebView de Toka.";
      setError(message);
      throw new Error(message);
    }

    const appId = process.env.NEXT_PUBLIC_TOKA_APP_ID?.trim();
    if (!appId) {
      const message = "NEXT_PUBLIC_TOKA_APP_ID no está configurado.";
      setError(message);
      throw new Error(message);
    }

    setIsLoading(true);

    try {
      const authCode = await new Promise<string>((resolve, reject) => {
        window.AlipayJSBridge?.call(
          method,
          {
            appId,
            scopes,
          },
          (response: TokaBridgeResponse) => {
            const hasError =
              typeof response.error !== "undefined" ||
              typeof response.errorMessage !== "undefined" ||
              (typeof response.resultCode === "number" && response.resultCode !== 10000);

            if (hasError) {
              reject(new Error(mapBridgeError(response)));
              return;
            }

            const result = response.result?.trim();
            if (!result) {
              reject(new Error("El bridge no devolvió authCode en response.result."));
              return;
            }

            resolve(result);
          },
        );
      });

      return authCode;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido al pedir authCode.";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const api = useMemo(
    () => ({
      getAuthCode,
      getDigitalIdentityCode: () => getAuthCode("getUserDigitalIdentityAuthCode", DEFAULT_SCOPES.getUserDigitalIdentityAuthCode),
      getContactInformationCode: () =>
        getAuthCode("getUserContactInformationAuthCode", DEFAULT_SCOPES.getUserContactInformationAuthCode),
      getAddressInformationCode: () =>
        getAuthCode("getUserAddressInformationAuthCode", DEFAULT_SCOPES.getUserAddressInformationAuthCode),
      getPersonalInformationCode: () =>
        getAuthCode("getUserPersonalInformationAuthCode", DEFAULT_SCOPES.getUserPersonalInformationAuthCode),
      getKycStatusCode: () => getAuthCode("getUserKYCStatusAuthCode", DEFAULT_SCOPES.getUserKYCStatusAuthCode),
    }),
    [getAuthCode],
  );

  return {
    isBridgeReady,
    isLoading,
    error,
    ...api,
  };
}
