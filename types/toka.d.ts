export type TokaAuthMethod =
  | "getUserDigitalIdentityAuthCode"
  | "getUserContactInformationAuthCode"
  | "getUserAddressInformationAuthCode"
  | "getUserPersonalInformationAuthCode"
  | "getUserKYCStatusAuthCode";

export type TokaAuthScope =
  | "USER_ID"
  | "USER_AVATAR"
  | "USER_NICKNAME"
  | "PLAINTEXT_MOBILE_PHONE"
  | "PLAINTEXT_EMAIL_ADDRESS"
  | "USER_ADDRESS"
  | "USER_NAME"
  | "USER_FIRST_SURNAME"
  | "USER_SECOND_SURNAME"
  | "USER_GENDER"
  | "USER_BIRTHDAY"
  | "USER_STATE_OF_BIRTH"
  | "USER_NATIONALITY"
  | "USER_KYC_STATUS";

export type TokaBridgeResponse = {
  error?: number | string;
  errorMessage?: string;
  result?: string;
  resultCode?: number;
  resultMsg?: string;
  startTime?: number;
};

export type AuthEnvelope = {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: {
    accessToken?: string;
    tokenType?: string;
    expiresIn?: number;
    userId?: string;
    [key: string]: unknown;
  };
  accessToken?: string;
  token?: string;
  jwt?: string;
  [key: string]: unknown;
};

declare global {
  interface Window {
    AlipayJSBridge?: {
      call: (
        method: string,
        params: Record<string, unknown>,
        callback: (response: TokaBridgeResponse) => void,
      ) => void;
    };
  }
}

export {};
