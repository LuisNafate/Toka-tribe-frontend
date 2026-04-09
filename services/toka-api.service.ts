import { clearSessionToken, getSessionToken } from "@/services/auth.service";
import type {
  ChallengeDto,
  GameSessionCreateRequest,
  GameSessionDto,
  LeaderboardEntryDto,
  PaymentHistoryDto,
  RewardClaimDto,
  RewardDto,
  SeasonDto,
  TribeDto,
  TribeMemberDto,
  UserIdentityDto,
} from "@/types/api";

export type { GameSessionCreateRequest } from "@/types/api";

export type ApiEnvelope<T = unknown> = {
  success?: boolean;
  statusCode?: number;
  message?: string;
  errorCode?: string;
  traceId?: string;
  data?: T;
  [key: string]: unknown;
};

export class ApiError extends Error {
  status: number;
  path: string;
  code?: string;
  traceId?: string;

  constructor(message: string, options: { status: number; path: string; code?: string; traceId?: string }) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.path = options.path;
    this.code = options.code;
    this.traceId = options.traceId;
  }
}



const API_ERROR_MESSAGES: Record<string, string> = {
  AUTH_UNAUTHORIZED: "Tu sesión expiró. Vuelve a iniciar sesión.",
  CHALLENGE_ALREADY_PLAYED: "Este reto ya fue registrado.",
  REWARD_ALREADY_CLAIMED: "Esta recompensa ya fue reclamada.",
  TRIBE_NOT_A_MEMBER: "No perteneces a esa Tribe.",
};

function getMessageFromPayload(payload: ApiEnvelope<unknown>, status: number, path: string): string {
  const rawMessage = payload.message;
  if (typeof rawMessage === "string" && rawMessage.trim() !== "") {
    return rawMessage;
  }

  const messageArray = payload["messages"];
  if (Array.isArray(messageArray) && messageArray.length > 0) {
    const joined = messageArray.filter((item) => typeof item === "string").join(" ").trim();
    if (joined !== "") {
      return joined;
    }
  }

  return `Error HTTP ${status} al consumir ${path}.`;
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  requiresAuth?: boolean;
};

function getApiBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!baseUrl) throw new Error("NEXT_PUBLIC_API_BASE_URL no está configurado.");
  return baseUrl.replace(/\/$/, "");
}

async function apiRequest<T = unknown>(path: string, options: RequestOptions = {}): Promise<ApiEnvelope<T>> {
  const { method = "GET", body, requiresAuth = true } = options;
  const token = requiresAuth ? getSessionToken() : null;

  if (requiresAuth && !token) {
    throw new Error("No hay sesión JWT activa. Inicia sesión primero.");
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(typeof body !== "undefined" ? { body: JSON.stringify(body) } : {}),
  });

  let payload: ApiEnvelope<T> = {};
  try {
    payload = (await response.json()) as ApiEnvelope<T>;
  } catch {
    payload = {};
  }

  if (!response.ok) {
    if (response.status === 401 && token) {
      clearSessionToken();
    }

    const message = getMessageFromPayload(payload, response.status, path);
    throw new ApiError(message, {
      status: response.status,
      path,
      code: typeof payload.errorCode === "string" ? payload.errorCode : undefined,
      traceId: typeof payload.traceId === "string" ? payload.traceId : undefined,
    });
  }

  return payload;
}

export function getApiErrorMessage(error: unknown, fallback = "No se pudo completar la solicitud."): string {
  if (error instanceof ApiError) {
    if (error.code && API_ERROR_MESSAGES[error.code]) {
      return API_ERROR_MESSAGES[error.code];
    }

    if (error.status === 401) {
      return API_ERROR_MESSAGES.AUTH_UNAUTHORIZED;
    }

    if (error.status === 409) {
      return error.code && API_ERROR_MESSAGES[error.code]
        ? API_ERROR_MESSAGES[error.code]
        : "La operación ya fue procesada.";
    }
  }

  if (error instanceof Error && error.message.trim() !== "") {
    return error.message;
  }

  return fallback;
}

export const TokaApi = {
  // Health
  health: () => apiRequest("/health", { requiresAuth: false }),
  healthReady: () => apiRequest("/health/ready", { requiresAuth: false }),
  healthLive: () => apiRequest("/health/live", { requiresAuth: false }),

  // Auth
  authLogin: (authCode: string) => apiRequest("/auth/toka/login", { method: "POST", requiresAuth: false, body: { authCode } }),
  authMe: () => apiRequest<UserIdentityDto>("/auth/me"),
  authSyncProfile: (authCodes: string[]) => apiRequest("/auth/me/sync-profile", { method: "POST", body: { authCodes } }),

  // Users
  usersMe: () => apiRequest<UserIdentityDto>("/users/me"),
  usersUpdateMe: (body: { username?: string; avatarUrl?: string }) => apiRequest("/users/me", { method: "PATCH", body }),

  // Pets
  petsCreate: (name: string) => apiRequest("/pets", { method: "POST", body: { name } }),
  petsMe: () => apiRequest("/pets/me"),
  petsEquip: (itemId: string) => apiRequest("/pets/me/equip", { method: "POST", body: { itemId } }),
  petsStore: () => apiRequest("/pets/items/store"),
  petsUnlockItem: (itemId: string) => apiRequest(`/pets/items/${itemId}/unlock`, { method: "POST" }),

  // Seasons
  seasonsCurrent: () => apiRequest<SeasonDto>("/seasons/current"),
  seasonsById: (seasonId: string) => apiRequest<SeasonDto>(`/seasons/${seasonId}`),

  // Admin Seasons
  adminCreateSeason: () => apiRequest("/admin/seasons", { method: "POST" }),
  adminCloseSeason: (seasonId: string) => apiRequest(`/admin/seasons/${seasonId}/close`, { method: "POST" }),

  // Tribes
  tribesList: () => apiRequest<TribeDto[]>("/tribes"),
  tribesCreate: (body: Record<string, unknown>) => apiRequest("/tribes", { method: "POST", body }),
  tribesDetail: (tribeId: string) => apiRequest<TribeDto>(`/tribes/${tribeId}`),
  tribesJoin: (tribeId: string) => apiRequest(`/tribes/${tribeId}/join`, { method: "POST" }),
  tribesLeave: (tribeId: string) => apiRequest(`/tribes/${tribeId}/leave`, { method: "POST" }),
  tribesMembers: (tribeId: string) => apiRequest<TribeMemberDto[]>(`/tribes/${tribeId}/members`),

  // Games
  gamesList: () => apiRequest("/games"),
  gamesDetail: (gameId: string) => apiRequest(`/games/${gameId}`),

  // Admin Games
  adminGamesCreate: (body: Record<string, unknown>) => apiRequest("/admin/games", { method: "POST", body }),
  adminGamesUpdate: (gameId: string, body: Record<string, unknown>) => apiRequest(`/admin/games/${gameId}`, { method: "PATCH", body }),
  adminGamesDeactivate: (gameId: string) => apiRequest(`/admin/games/${gameId}`, { method: "DELETE" }),

  // Challenges
  challengesActive: () => apiRequest<ChallengeDto[] | ChallengeDto>("/challenges/active"),
  challengesDetail: (challengeId: string) => apiRequest<ChallengeDto>(`/challenges/${challengeId}`),

  // Admin Challenges
  adminChallengesCreate: (body: Record<string, unknown>) => apiRequest("/admin/challenges", { method: "POST", body }),
  adminChallengesActivate: (challengeId: string) => apiRequest(`/admin/challenges/${challengeId}/activate`, { method: "POST" }),
  adminChallengesClose: (challengeId: string) => apiRequest(`/admin/challenges/${challengeId}/close`, { method: "POST" }),

  // Scoring
  gameSessionsCreate: (body: GameSessionCreateRequest) => apiRequest("/game-sessions", { method: "POST", body }),
  gameSessionsMe: () => apiRequest<GameSessionDto[] | { sessions?: GameSessionDto[]; items?: GameSessionDto[] }>("/game-sessions/me"),

  // Leaderboard
  leaderboardCurrent: () => apiRequest<LeaderboardEntryDto[] | { items?: LeaderboardEntryDto[]; division?: string; seasonName?: string }>("/leaderboard/current"),
  leaderboardByDivision: (division: string) => apiRequest<LeaderboardEntryDto[] | { items?: LeaderboardEntryDto[] }>(`/leaderboard/divisions/${division}`),
  leaderboardTribeHistory: (tribeId: string) => apiRequest(`/leaderboard/tribes/${tribeId}/history`),

  // Rewards
  rewardsList: () => apiRequest<RewardDto[] | { items?: RewardDto[] }>("/rewards"),
  rewardsMyClaims: () => apiRequest<RewardClaimDto[] | { items?: RewardClaimDto[] }>("/rewards/my-claims"),
  rewardsClaim: (rewardId: string) => apiRequest(`/rewards/${rewardId}/claim`, { method: "POST" }),

  // Admin Rewards
  adminRewardsCreate: (body: Record<string, unknown>) => apiRequest("/admin/rewards", { method: "POST", body }),

  // Payments
  paymentsCreateOrder: (body: Record<string, unknown>) => apiRequest("/payments", { method: "POST", body }),
  paymentsSync: (id: string) => apiRequest(`/payments/${id}/sync`, { method: "POST" }),
  paymentsMe: () => apiRequest<PaymentHistoryDto>("/payments/me"),
};
