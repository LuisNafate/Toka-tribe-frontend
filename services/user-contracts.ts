import type { ApiRecord, SeasonDto, UserIdentityDto } from "@/types/api";

export type UserHeaderIdentity = {
  displayName: string;
  tribeName: string;
};

export type ProfileSnapshot = {
  displayName: string;
  avatarUrl: string;
  tierLabel: string;
  planLabel: string;
  tribeName: string;
  totalPoints: number;
  maxStreakDays: number;
  currentStreakDays: number;
  completedChallenges: number;
  seasonsPlayed: number;
  bestRank: number;
  seasonCurrentPoints: number;
  seasonGoalPoints: number;
};

function toRecord(value: unknown): ApiRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as ApiRecord;
}

function toText(value: unknown): string | null {
  if (typeof value === "string" && value.trim() !== "") return value.trim();
  return null;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, ""));
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function findValueByKeys(root: unknown, keys: string[], expectedType: "number" | "string"): number | string | null {
  const queue: unknown[] = [root];
  const visited = new Set<object>();

  while (queue.length > 0) {
    const current = queue.shift();
    const record = toRecord(current);
    if (!record) continue;

    if (visited.has(record)) continue;
    visited.add(record);

    for (const key of keys) {
      const raw = record[key];
      if (expectedType === "number") {
        const num = toNumber(raw);
        if (num !== null) return num;
      } else {
        const text = toText(raw);
        if (text) return text;
      }
    }

    for (const value of Object.values(record)) {
      if (value && typeof value === "object") {
        queue.push(value);
      }
    }
  }

  return null;
}

function readSessionsSummary(sessionsData: unknown): { totalScore: number; totalSessions: number } {
  let sessions: unknown[] = [];

  if (Array.isArray(sessionsData)) {
    sessions = sessionsData;
  } else {
    const record = toRecord(sessionsData);
    if (record?.sessions && Array.isArray(record.sessions)) {
      sessions = record.sessions;
    } else if (record?.items && Array.isArray(record.items)) {
      sessions = record.items;
    }
  }

  let totalScore = 0;
  for (const item of sessions) {
    const rec = toRecord(item);
    if (!rec) continue;
    const score = toNumber(rec.score);
    totalScore += score ?? 0;
  }

  return {
    totalScore,
    totalSessions: sessions.length,
  };
}

export function extractHeaderIdentity(usersData: unknown, authData: unknown): UserHeaderIdentity {
  const root = { usersData, authData };
  return {
    displayName:
      (findValueByKeys(root, ["username", "displayName", "name", "nickname"], "string") as string | null) ??
      "Cuenta sin sincronizar",
    tribeName:
      (findValueByKeys(root, ["tribeName", "tribe", "squadName", "teamName"], "string") as string | null) ??
      "Tribe no sincronizada",
  };
}

export function extractProfileSnapshot(args: {
  usersMeData: UserIdentityDto | null;
  authMeData: UserIdentityDto | null;
  leaderboardData: unknown;
  seasonData: SeasonDto | null;
  sessionsData: unknown;
  fallbackPoints: number;
  fallbackAvatarUrl: string;
}): ProfileSnapshot {
  const { usersMeData, authMeData, leaderboardData, seasonData, sessionsData, fallbackPoints, fallbackAvatarUrl } = args;
  const baseRoot = {
    usersMeData,
    authMeData,
    leaderboardData,
    seasonData,
  };

  const sessionsSummary = readSessionsSummary(sessionsData);

  return {
    displayName:
      (findValueByKeys(baseRoot, ["username", "displayName", "name", "nickname", "firstName"], "string") as string | null) ??
      "Cuenta sin sincronizar",
    avatarUrl:
      (findValueByKeys(baseRoot, ["avatarUrl", "avatar", "profileImage", "imageUrl"], "string") as string | null) ??
      fallbackAvatarUrl,
    tierLabel:
      ((findValueByKeys(baseRoot, ["activeTier", "currentDivision", "tier", "division", "league", "rankTier"], "string") as string | null) ??
        "NO SINCRONIZADO").toUpperCase(),
    planLabel:
      (findValueByKeys(baseRoot, ["leagueMembership", "plan", "membership", "subscription", "planType"], "string") as string | null) ??
      "No sincronizado",
    tribeName:
      (findValueByKeys(baseRoot, ["tribeName", "tribe", "squadName", "teamName"], "string") as string | null) ??
      "No sincronizada",
    totalPoints:
      (findValueByKeys(baseRoot, ["individualPoints", "points", "totalPoints", "score", "xp"], "number") as number | null) ??
      fallbackPoints,
    maxStreakDays:
      (findValueByKeys(baseRoot, ["maxStreak", "bestStreak", "longestStreak"], "number") as number | null) ??
      0,
    currentStreakDays:
      (findValueByKeys(baseRoot, ["currentStreak", "streak", "streakDays"], "number") as number | null) ??
      (typeof window !== "undefined" && localStorage.getItem("toka_current_streak") !== null
        ? Number(localStorage.getItem("toka_current_streak"))
        : 0),
    completedChallenges:
      (findValueByKeys(baseRoot, ["completedChallenges", "completedGames", "challengesCompleted", "gamesPlayed"], "number") as number | null) ??
      sessionsSummary.totalSessions,
    seasonsPlayed:
      (findValueByKeys(baseRoot, ["seasonsPlayed", "seasonCount", "totalSeasons"], "number") as number | null) ??
      0,
    bestRank:
      (findValueByKeys(baseRoot, ["bestRank", "bestPosition", "highestRank", "rank"], "number") as number | null) ??
      0,
    seasonCurrentPoints:
      (findValueByKeys(baseRoot, ["seasonPoints", "currentPoints", "points", "score"], "number") as number | null) ??
      sessionsSummary.totalScore,
    seasonGoalPoints:
      (findValueByKeys(baseRoot, ["seasonGoalPoints", "targetPoints", "goalPoints", "maxPoints"], "number") as number | null) ??
      0,
  };
}