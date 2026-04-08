"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Flame, LayoutList, ShieldCheck, Sparkles, Star, Trophy, User } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Panel, SectionHeader } from "@/components/common";
import { MobileHamburgerMenu } from "@/components/mobile-hamburger-menu";
import BottomNav from "@/components/BottomNav";
import { FIGMA_ASSETS } from "@/lib/data";
import { TokaApi } from "@/services/toka-api.service";
import { formatAppPoints, refreshAppPointsFromBackend, useAppPoints } from "@/components/use-app-points";

type ProfileViewModel = {
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

const DEFAULT_PROFILE: ProfileViewModel = {
  displayName: "Alix",
  avatarUrl: FIGMA_ASSETS.landing.hero,
  tierLabel: "Plata",
  planLabel: "Free",
  tribeName: "Axo Squad",
  totalPoints: 1480,
  maxStreakDays: 12,
  currentStreakDays: 5,
  completedChallenges: 128,
  seasonsPlayed: 4,
  bestRank: 12,
  seasonCurrentPoints: 1300,
  seasonGoalPoints: 2000,
};

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toStringValue(value: unknown): string | null {
  if (typeof value === "string" && value.trim() !== "") return value.trim();
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
        const text = toStringValue(raw);
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

export default function PerfilPage() {
  const { points } = useAppPoints();
  const [profile, setProfile] = useState<ProfileViewModel>(DEFAULT_PROFILE);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileWarning, setProfileWarning] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      setIsLoadingProfile(true);
      setProfileWarning(null);

      const syncedPoints = await refreshAppPointsFromBackend();

      const responses = await Promise.allSettled([
        TokaApi.usersMe(),
        TokaApi.authMe(),
        TokaApi.gameSessionsMe(),
        TokaApi.leaderboardCurrent(),
        TokaApi.seasonsCurrent(),
      ]);

      const usersMeData = responses[0].status === "fulfilled" ? responses[0].value.data : null;
      const authMeData = responses[1].status === "fulfilled" ? responses[1].value.data : null;
      const sessionsData = responses[2].status === "fulfilled" ? responses[2].value.data : null;
      const leaderboardData = responses[3].status === "fulfilled" ? responses[3].value.data : null;
      const seasonData = responses[4].status === "fulfilled" ? responses[4].value.data : null;

      const baseRoot = {
        usersMeData,
        authMeData,
        leaderboardData,
        seasonData,
      };

      const sessionsSummary = readSessionsSummary(sessionsData);

      const nextProfile: ProfileViewModel = {
        displayName: (findValueByKeys(baseRoot, ["username", "displayName", "name", "nickname", "firstName"], "string") as string | null) ?? DEFAULT_PROFILE.displayName,
        avatarUrl: (findValueByKeys(baseRoot, ["avatarUrl", "avatar", "profileImage", "imageUrl"], "string") as string | null) ?? DEFAULT_PROFILE.avatarUrl,
        tierLabel: ((findValueByKeys(baseRoot, ["tier", "division", "league", "rankTier"], "string") as string | null) ?? DEFAULT_PROFILE.tierLabel).toUpperCase(),
        planLabel: (findValueByKeys(baseRoot, ["plan", "membership", "subscription", "planType"], "string") as string | null) ?? DEFAULT_PROFILE.planLabel,
        tribeName: (findValueByKeys(baseRoot, ["tribeName", "tribe", "squadName", "teamName"], "string") as string | null) ?? DEFAULT_PROFILE.tribeName,
        totalPoints: (findValueByKeys(baseRoot, ["individualPoints", "points", "totalPoints", "score", "xp"], "number") as number | null) ?? syncedPoints ?? points,
        maxStreakDays: (findValueByKeys(baseRoot, ["maxStreak", "bestStreak", "longestStreak"], "number") as number | null) ?? DEFAULT_PROFILE.maxStreakDays,
        currentStreakDays: (findValueByKeys(baseRoot, ["currentStreak", "streak", "streakDays"], "number") as number | null) ?? DEFAULT_PROFILE.currentStreakDays,
        completedChallenges: (findValueByKeys(baseRoot, ["completedChallenges", "completedGames", "challengesCompleted", "gamesPlayed"], "number") as number | null) ?? sessionsSummary.totalSessions,
        seasonsPlayed: (findValueByKeys(baseRoot, ["seasonsPlayed", "seasonCount", "totalSeasons"], "number") as number | null) ?? DEFAULT_PROFILE.seasonsPlayed,
        bestRank: (findValueByKeys(baseRoot, ["bestRank", "bestPosition", "highestRank", "rank"], "number") as number | null) ?? DEFAULT_PROFILE.bestRank,
        seasonCurrentPoints: (findValueByKeys(baseRoot, ["seasonPoints", "currentPoints", "points", "score"], "number") as number | null) ?? sessionsSummary.totalScore,
        seasonGoalPoints: (findValueByKeys(baseRoot, ["seasonGoalPoints", "targetPoints", "goalPoints", "maxPoints"], "number") as number | null) ?? DEFAULT_PROFILE.seasonGoalPoints,
      };

      setProfile(nextProfile);

      const failedCalls = responses.filter((result) => result.status === "rejected").length;
      if (failedCalls > 0) {
        setProfileWarning("Algunos datos del perfil no se pudieron sincronizar y se muestran con fallback.");
      }

      setIsLoadingProfile(false);
    }

    void loadProfile();
  }, []);

  const seasonProgressPct = useMemo(() => {
    if (profile.seasonGoalPoints <= 0) return 0;
    const raw = Math.round((profile.seasonCurrentPoints / profile.seasonGoalPoints) * 100);
    return Math.max(0, Math.min(100, raw));
  }, [profile.seasonCurrentPoints, profile.seasonGoalPoints]);

  return (
    <>
      <div className="fig-desktop-only">
        <AppShell title="Perfil" subtitle="Identidad, progreso y configuración personal">
          <div className="workspace__grid">
            <Panel>
              <SectionHeader eyebrow="Jugador" title={profile.displayName} description={`Miembro activo de ${profile.tribeName}`} />
              <div className="inline-row" style={{ alignItems: "center" }}>
                <img
                  src={profile.avatarUrl}
                  alt={profile.displayName}
                  className="avatar avatar--lg"
                  style={{ objectFit: "cover" }}
                />
                <div>
                  <div className="item-title">Nivel {profile.tierLabel}</div>
                  <div className="subtle">Plan {profile.planLabel} · {formatAppPoints(profile.totalPoints)} pts acumulados.</div>
                </div>
              </div>
              {isLoadingProfile ? <p className="subtle" style={{ marginTop: 10 }}>Sincronizando perfil...</p> : null}
              {profileWarning ? <p className="subtle" style={{ marginTop: 10 }}>{profileWarning}</p> : null}
              <div className="feature-row" style={{ marginTop: 20 }}>
                <article className="mini-card">
                  <div className="mini-icon"><ShieldCheck size={18} /></div>
                  <h3>Puntos acumulados</h3>
                  <p>{formatAppPoints(profile.totalPoints)} pts</p>
                </article>
                <article className="mini-card">
                  <div className="mini-icon"><Flame size={18} /></div>
                  <h3>Racha actual</h3>
                  <p>{profile.currentStreakDays} días</p>
                </article>
                <article className="mini-card">
                  <div className="mini-icon"><Trophy size={18} /></div>
                  <h3>Mejor posición</h3>
                  <p>#{profile.bestRank}</p>
                </article>
              </div>
            </Panel>
            <div className="dashboard-side">
              <Panel className="muted-card">
                <div className="inline-row" style={{ justifyContent: "space-between" }}>
                  <span className="status-pill">Conectado</span>
                  <Sparkles size={18} />
                </div>
                <h3>Single Sign-On Toka</h3>
                <p>Acceso directo, sin registro adicional, con progreso sincronizado en todo el ecosistema.</p>
              </Panel>
              <Panel>
                <SectionHeader eyebrow="Preferencias" title="Visibilidad y alertas" description="Controla tu experiencia dentro de TokaTribe." />
                <div className="stack stack--tight">
                  <div className="setting-row"><div><div className="item-title">Perfil visible</div><div className="subtle">Los miembros pueden ver tu avatar.</div></div><div className="reward-pill">Activo</div></div>
                  <div className="setting-row"><div><div className="item-title">Alertas de temporada</div><div className="subtle">Recibe recordatorios de cierre.</div></div><div className="reward-pill">Activo</div></div>
                </div>
              </Panel>
            </div>
          </div>
        </AppShell>
      </div>

      <main className="fig-perfil-page fig-mobile-only">
        <header className="fig-perfil-hero">
          <div className="fig-perfil-hero-top">
            <MobileHamburgerMenu />
          </div>
          <div className="fig-perfil-avatar-wrap">
            <img src={profile.avatarUrl} alt="Avatar" className="fig-perfil-avatar" />
          </div>
          <h1 className="fig-perfil-name">{profile.displayName}</h1>
          <div className="fig-perfil-chips">
            <span className="fig-perfil-chip fig-perfil-chip--plata">{profile.tierLabel}</span>
            <span className="fig-perfil-chip fig-perfil-chip--free">{profile.planLabel.toUpperCase()}</span>
          </div>
          <div className="fig-perfil-stats-row">
            <div className="fig-perfil-stat">
              <span className="fig-perfil-stat-label">TOTAL PTS</span>
              <span className="fig-perfil-stat-value">{formatAppPoints(profile.totalPoints)}</span>
            </div>
            <div className="fig-perfil-stat-divider" />
            <div className="fig-perfil-stat">
              <span className="fig-perfil-stat-label">RACHA MAX</span>
              <span className="fig-perfil-stat-value">{profile.maxStreakDays} días</span>
            </div>
            <div className="fig-perfil-stat-divider" />
            <div className="fig-perfil-stat">
              <span className="fig-perfil-stat-label">TRIBE</span>
              <span className="fig-perfil-stat-value" style={{ fontSize: "0.75rem" }}>{profile.tribeName}</span>
            </div>
          </div>
        </header>

        <div className="fig-perfil-body">
          <article className="fig-perfil-card fig-perfil-mascota-card">
            <div className="fig-perfil-card-head">
              <p className="fig-perfil-card-title">Mi mascota</p>
              <Link href="/perfil/mascota" className="fig-perfil-link">Personalizar →</Link>
            </div>
            <div className="fig-perfil-mascota-body">
              <img src="/images/mascota.png" alt="Mascota Toky" className="fig-perfil-mascota-img" />
              <p className="fig-perfil-mascota-name">Toky</p>
              <div className="fig-perfil-mascota-items">
                <button type="button" className="fig-perfil-item-btn" disabled>
                  <div className="fig-perfil-item-icon">
                    <User size={18} color="#b0b8c9" />
                  </div>
                  <span>HAT</span>
                </button>
                <button type="button" className="fig-perfil-item-btn" disabled>
                  <div className="fig-perfil-item-icon">
                    <User size={18} color="#b0b8c9" />
                  </div>
                  <span>SHIRT</span>
                </button>
                <button type="button" className="fig-perfil-item-btn" disabled>
                  <div className="fig-perfil-item-icon">
                    <Star size={18} color="#b0b8c9" />
                  </div>
                  <span>ACCESSORY</span>
                </button>
              </div>
            </div>
          </article>

          <article className="fig-perfil-card">
            <div className="fig-perfil-card-head">
              <div>
                <p className="fig-perfil-card-title">Temporada activa: {profile.tribeName}</p>
                <span className="fig-perfil-division-label">DIVISIÓN {profile.tierLabel}</span>
              </div>
              <Trophy size={18} color="#4a77e3" />
            </div>
            <div className="fig-perfil-progress-labels">
              <span>{formatAppPoints(profile.seasonCurrentPoints)} pts</span>
              <span>META: {formatAppPoints(profile.seasonGoalPoints)} PTS</span>
            </div>
            <div className="fig-perfil-progress">
              <div style={{ width: `${seasonProgressPct}%` }} />
            </div>
          </article>

          <div className="fig-perfil-stats-grid">
            <article className="fig-perfil-stat-card">
              <CheckCircle2 size={20} className="fig-perfil-stat-icon fig-perfil-stat-icon--blue" />
              <span className="fig-perfil-stat-card-label">RETOS COMPLETADOS</span>
              <span className="fig-perfil-stat-card-value">{profile.completedChallenges}</span>
            </article>
            <article className="fig-perfil-stat-card">
              <Flame size={20} className="fig-perfil-stat-icon fig-perfil-stat-icon--orange" />
              <span className="fig-perfil-stat-card-label">RACHA ACTUAL</span>
              <span className="fig-perfil-stat-card-value">{profile.currentStreakDays} días</span>
            </article>
            <article className="fig-perfil-stat-card">
              <LayoutList size={20} className="fig-perfil-stat-icon fig-perfil-stat-icon--teal" />
              <span className="fig-perfil-stat-card-label">TEMPORADAS</span>
              <span className="fig-perfil-stat-card-value">{profile.seasonsPlayed}</span>
            </article>
            <article className="fig-perfil-stat-card">
              <Star size={20} className="fig-perfil-stat-icon fig-perfil-stat-icon--purple" />
              <span className="fig-perfil-stat-card-label">MEJOR POSICIÓN</span>
              <span className="fig-perfil-stat-card-value">#{profile.bestRank}</span>
            </article>
          </div>

          {isLoadingProfile ? <p className="subtle" style={{ marginTop: 8 }}>Sincronizando datos del usuario...</p> : null}
          {profileWarning ? <p className="subtle" style={{ marginTop: 4 }}>{profileWarning}</p> : null}
        </div>

        <BottomNav active="perfil" />
      </main>
    </>
  );
}
