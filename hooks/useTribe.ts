"use client";

import { useState, useEffect, useCallback } from "react";
import { getApiErrorMessage, TokaApi } from "@/services/toka-api.service";
import { getSessionToken } from "@/services/auth.service";

// ── Types ──────────────────────────────────────────────────────────────────────

export type TribeMember = {
  userId: string;
  username: string;
  avatarUrl: string;
  role: "LEADER" | "MEMBER";
  pointsContributed: number;
  activeTier: string;
  activeMultiplier: number;
  joinedAt?: string;
};

export type MyTribe = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  badgeUrl?: string;
  division: string;
  seasonPoints: number;
  totalPoints: number;
  memberCount: number;
  maxMembers: number;
  leaderId: string;
  status: string;
};

export type CreateTribeInput = {
  name: string;
  slug: string;
  description?: string;
};

type ActionResult = { success: boolean; alreadyMember?: boolean };

// ── Helpers ────────────────────────────────────────────────────────────────────

function toText(v: unknown): string | null {
  if (typeof v === "string" && v.trim()) return v.trim();
  return null;
}

function toNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v.replace(/,/g, ""));
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function toRecord(v: unknown): Record<string, unknown> | null {
  if (v && typeof v === "object" && !Array.isArray(v)) return v as Record<string, unknown>;
  return null;
}

function normalizeTribe(data: unknown): MyTribe {
  const d = toRecord(data) ?? {};
  return {
    id: toText(d.id) ?? toText(d._id) ?? "",
    name: toText(d.name) ?? "",
    slug: toText(d.slug) ?? "",
    description: toText(d.description) ?? undefined,
    badgeUrl: toText(d.badgeUrl) ?? toText(d.avatarUrl) ?? undefined,
    division: toText(d.division) ?? toText(d.tier) ?? "BRONCE",
    seasonPoints: toNumber(d.seasonPoints) ?? toNumber(d.pointsWeek) ?? 0,
    totalPoints: toNumber(d.totalPoints) ?? 0,
    memberCount: toNumber(d.memberCount) ?? 0,
    maxMembers: toNumber(d.maxMembers) ?? 10,
    leaderId: toText(d.leaderId) ?? "",
    status: toText(d.status) ?? "ACTIVE",
  };
}

function normalizeMembers(data: unknown): TribeMember[] {
  const list = Array.isArray(data)
    ? data
    : Array.isArray(toRecord(data)?.members)
      ? (toRecord(data)?.members as unknown[])
      : [];

  return list.map((item) => {
    const d = toRecord(item) ?? {};
    return {
      userId: toText(d.userId) ?? toText(d._id) ?? "",
      username: toText(d.username) ?? toText(d.name) ?? toText(d.displayName) ?? "Miembro",
      avatarUrl: toText(d.avatarUrl) ?? toText(d.avatar) ?? "/images/ajolotes_1.png",
      role: d.role === "LEADER" ? "LEADER" : "MEMBER",
      pointsContributed: toNumber(d.pointsContributed) ?? toNumber(d.points) ?? 0,
      activeTier: toText(d.activeTier) ?? toText(d.tier) ?? "NONE",
      activeMultiplier: toNumber(d.activeMultiplier) ?? 1,
      joinedAt: toText(d.joinedAt) ?? undefined,
    };
  });
}

function extractTribeId(usersData: unknown, authData: unknown): string | null {
  const ud = toRecord(usersData);
  const ad = toRecord(authData);
  return (
    toText(ud?.tribeId) ??
    toText(ud?.currentTribeId) ??
    toText(ud?.squadId) ??
    toText(toRecord(ud?.tribe)?.id) ??
    toText(toRecord(ud?.tribe)?._id) ??
    toText(toRecord(ud?.squad)?.id) ??
    toText(toRecord(ud?.squad)?._id) ??
    toText(ad?.tribeId) ??
    toText(ad?.currentTribeId) ??
    toText(toRecord(ad?.tribe)?.id) ??
    toText(toRecord(ad?.tribe)?._id) ??
    null
  );
}

function extractUserId(usersData: unknown, authData: unknown): string | null {
  const ud = toRecord(usersData);
  const ad = toRecord(authData);
  return (
    toText(ud?.id) ?? toText(ud?._id) ?? toText(ud?.userId) ??
    toText(ad?.id) ?? toText(ad?._id) ?? toText(ad?.userId) ??
    null
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useTribe() {
  const [myTribe, setMyTribe] = useState<MyTribe | null>(null);
  const [members, setMembers] = useState<TribeMember[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const isMember = myTribe !== null;
  const isLeader = isMember && !!currentUserId && myTribe.leaderId === currentUserId;

  function showToast(type: "ok" | "error", text: string) {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  }

  // ── Load on mount ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!getSessionToken()) { setLoading(false); return; }

    let alive = true;
    async function load() {
      try {
        // GET /users/me/summary is the ONLY backend endpoint that returns tribe.id.
        // GET /users/me and GET /auth/me do NOT include tribeId.
        const summaryEnv = await TokaApi.usersMeSummary();
        if (!alive) return;

        // Backend may return data at root or nested under .data
        const summary = (summaryEnv.data ?? summaryEnv) as Record<string, unknown> | null | undefined;
        const userRec = summary?.user as Record<string, unknown> | null | undefined;
        const tribeRec = summary?.tribe as Record<string, unknown> | null | undefined;

        const userId = toText(userRec?.id) ?? toText(userRec?.["_id"]) ?? null;
        const tribeId = toText(tribeRec?.id) ?? toText(tribeRec?.["_id"]) ?? null;

        if (alive) setCurrentUserId(userId);

        if (tribeId) {
          const [detailEnv, membersEnv] = await Promise.allSettled([
            TokaApi.tribesDetail(tribeId),
            TokaApi.tribesMembers(tribeId),
          ]);
          if (!alive) return;
          if (detailEnv.status === "fulfilled") setMyTribe(normalizeTribe(detailEnv.value.data ?? detailEnv.value));
          if (membersEnv.status === "fulfilled") setMembers(normalizeMembers(membersEnv.value.data ?? membersEnv.value));
        }
      } catch {
        // Unauthenticated or no tribe — leave state as null, loading stops in finally.
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, []);

  // ── Actions ──────────────────────────────────────────────────────────────────
  const joinTribe = useCallback(async (tribeId: string): Promise<ActionResult> => {
    try {
      await TokaApi.tribesJoin(tribeId);
      const [detailEnv, membersEnv] = await Promise.all([
        TokaApi.tribesDetail(tribeId),
        TokaApi.tribesMembers(tribeId),
      ]);
      setMyTribe(normalizeTribe(detailEnv.data ?? detailEnv));
      setMembers(normalizeMembers(membersEnv.data ?? membersEnv));
      showToast("ok", "¡Te uniste a la Tribe!");
      return { success: true };
    } catch (e) {
      const message = getApiErrorMessage(e, "No se pudo unir a la Tribe.");
      const alreadyMember = message.toLowerCase().includes("ya fue") || message.toLowerCase().includes("ya perteneces");
      showToast("error", message);
      return { success: false, alreadyMember };
    }
  }, []);

  const leaveTribe = useCallback(async (): Promise<ActionResult> => {
    if (!myTribe) return { success: false };
    try {
      await TokaApi.tribesLeave(myTribe.id);
      setMyTribe(null);
      setMembers([]);
      showToast("ok", "Saliste de la Tribe.");
      return { success: true };
    } catch (e) {
      const msg = getApiErrorMessage(e, "No se pudo salir de la Tribe.");
      showToast("error", msg);
      return { success: false };
    }
  }, [myTribe]);

  const createTribe = useCallback(async (input: CreateTribeInput): Promise<ActionResult> => {
    try {
      const env = await TokaApi.tribesCreate(input as Record<string, unknown>);

      // Extract the new tribe id from the create response.
      // Some backends wrap it under data.id, others under data._id or data.tribeId.
      const raw = env.data as Record<string, unknown> | null | undefined;
      const newId =
        toText(raw?.id) ??
        toText(raw?.["_id"]) ??
        toText(raw?.tribeId) ??
        null;

      if (newId) {
        // Fetch full detail + members to populate state consistently (same as joinTribe).
        const [detailEnv, membersEnv] = await Promise.allSettled([
          TokaApi.tribesDetail(newId),
          TokaApi.tribesMembers(newId),
        ]);
        if (detailEnv.status === "fulfilled") setMyTribe(normalizeTribe(detailEnv.value.data ?? detailEnv.value));
        if (membersEnv.status === "fulfilled") setMembers(normalizeMembers(membersEnv.value.data ?? membersEnv.value));
      } else {
        // Fallback: the create response may not include id — normalize whatever we got.
        const created = normalizeTribe(env.data);
        setMyTribe(created);
      }

      showToast("ok", `¡Tribe "${input.name}" creada!`);
      return { success: true };
    } catch (e) {
      const msg = getApiErrorMessage(e, "No se pudo crear la Tribe.");
      showToast("error", msg);
      return { success: false };
    }
  }, []);

  return {
    myTribe,
    members,
    currentUserId,
    isMember,
    isLeader,
    loading,
    toast,
    joinTribe,
    leaveTribe,
    createTribe,
  };
}
