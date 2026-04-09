"use client";

import { useCallback, useEffect, useState } from "react";
import { getSessionToken } from "@/services/auth.service";
import { TokaApi, type ApiEnvelope } from "@/services/toka-api.service";

export const APP_POINTS_STORAGE_KEY = "tokatribe.app.points";
export const APP_POINTS_CHANGE_EVENT = "tokatribe:app-points-change";
export const DEFAULT_APP_POINTS = 0;

const POINT_KEYS = [
  "individualPoints",
  "points",
  "score",
  "totalPoints",
  "currentPoints",
  "xp",
  "userPoints",
  "walletPoints",
] as const;

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function extractPointsFromRecord(record: Record<string, unknown> | null | undefined): number | null {
  if (!record) return null;

  for (const key of POINT_KEYS) {
    const direct = toFiniteNumber(record[key]);
    if (direct !== null) return direct;
  }

  const nestedKeys = ["user", "profile", "stats", "data"] as const;
  for (const nestedKey of nestedKeys) {
    const nested = record[nestedKey];
    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      const fromNested = extractPointsFromRecord(nested as Record<string, unknown>);
      if (fromNested !== null) return fromNested;
    }
  }

  return null;
}

function sumScoresFromSessions(payload: unknown): number | null {
  if (Array.isArray(payload)) {
    const total = payload.reduce((acc, item) => {
      if (!item || typeof item !== "object") return acc;
      const score = toFiniteNumber((item as Record<string, unknown>).score);
      return acc + (score ?? 0);
    }, 0);
    return total;
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.sessions)) {
      return sumScoresFromSessions(record.sessions);
    }
    if (Array.isArray(record.items)) {
      return sumScoresFromSessions(record.items);
    }
  }

  return null;
}

async function safeApiCall<T>(request: () => Promise<ApiEnvelope<T>>): Promise<ApiEnvelope<T> | null> {
  try {
    return await request();
  } catch {
    return null;
  }
}

function parseStoredPoints(value: string | null): number {
  if (!value) return DEFAULT_APP_POINTS;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : DEFAULT_APP_POINTS;
}

export function readAppPoints() {
  if (typeof window === "undefined") {
    return DEFAULT_APP_POINTS;
  }

  return parseStoredPoints(window.localStorage.getItem(APP_POINTS_STORAGE_KEY));
}

export function writeAppPoints(nextPoints: number) {
  if (typeof window === "undefined") {
    return nextPoints;
  }

  window.localStorage.setItem(APP_POINTS_STORAGE_KEY, String(nextPoints));
  window.dispatchEvent(new Event(APP_POINTS_CHANGE_EVENT));

  return nextPoints;
}

export async function refreshAppPointsFromBackend(): Promise<number | null> {
  if (typeof window === "undefined") return null;
  if (!getSessionToken()) return null;

  const userResponse = await safeApiCall(() => TokaApi.usersMe());
  const userPoints = extractPointsFromRecord((userResponse?.data ?? null) as Record<string, unknown> | null);
  if (userPoints !== null) {
    return writeAppPoints(userPoints);
  }

  const authResponse = await safeApiCall(() => TokaApi.authMe());
  const authPoints = extractPointsFromRecord((authResponse?.data ?? null) as Record<string, unknown> | null);
  if (authPoints !== null) {
    return writeAppPoints(authPoints);
  }

  const sessionsResponse = await safeApiCall(() => TokaApi.gameSessionsMe());
  const sessionsPoints = sumScoresFromSessions(sessionsResponse?.data ?? null);
  if (sessionsPoints !== null) {
    return writeAppPoints(sessionsPoints);
  }

  return null;
}

export function useAppPoints() {
  const [points, setPoints] = useState(DEFAULT_APP_POINTS);

  useEffect(() => {
    const syncPoints = () => {
      setPoints(readAppPoints());
    };

    syncPoints();
    void refreshAppPointsFromBackend().then((syncedPoints) => {
      if (syncedPoints !== null) {
        setPoints(syncedPoints);
      }
    });

    window.addEventListener("storage", syncPoints);
    window.addEventListener(APP_POINTS_CHANGE_EVENT, syncPoints);

    return () => {
      window.removeEventListener("storage", syncPoints);
      window.removeEventListener(APP_POINTS_CHANGE_EVENT, syncPoints);
    };
  }, []);


  const setAppPoints = useCallback((nextPoints: number) => {
    const total = writeAppPoints(nextPoints);
    setPoints(total);
    return total;
  }, []);

  const addAppPoints = useCallback((delta: number) => {
    const nextPoints = readAppPoints() + delta;
    return setAppPoints(nextPoints);
  }, [setAppPoints]);

  return {
    points,
    setAppPoints,
    addAppPoints,
  };
}

export function formatAppPoints(points: number) {
  return new Intl.NumberFormat("es-ES").format(points);
}