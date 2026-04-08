"use client";

import { useCallback, useEffect, useState } from "react";

export const APP_POINTS_STORAGE_KEY = "tokatribe.app.points";
export const APP_POINTS_CHANGE_EVENT = "tokatribe:app-points-change";
export const DEFAULT_APP_POINTS = 1480;

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

export function useAppPoints() {
  const [points, setPoints] = useState(DEFAULT_APP_POINTS);

  useEffect(() => {
    const syncPoints = () => {
      setPoints(readAppPoints());
    };

    syncPoints();
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