"use client";

import { useEffect, useMemo, useState } from "react";
import { usePet } from "@/hooks/usePet";
import { PetDisplay } from "@/components/organisms/PetDisplay";
import { CheckCircle2, Flame, LayoutList, ShieldCheck, Sparkles, Star, Trophy } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Panel, SectionHeader } from "@/components/common";
import { MobileHamburgerMenu } from "@/components/mobile-hamburger-menu";
import BottomNav from "@/components/BottomNav";
import { FIGMA_ASSETS } from "@/lib/data";
import { TokaApi } from "@/services/toka-api.service";
import { extractProfileSnapshot } from "@/services/user-contracts";
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
  kycState: string | null;
};

const DEFAULT_PROFILE: ProfileViewModel = {
  displayName: "Cuenta sin sincronizar",
  avatarUrl: FIGMA_ASSETS.landing.hero,
  tierLabel: "NO SINCRONIZADO",
  planLabel: "No sincronizado",
  tribeName: "No sincronizada",
  totalPoints: 0,
  maxStreakDays: 0,
  currentStreakDays: 0,
  completedChallenges: 0,
  seasonsPlayed: 0,
  bestRank: 0,
  seasonCurrentPoints: 0,
  seasonGoalPoints: 0,
  kycState: null,
};

export default function PerfilPage() {
  const { points } = useAppPoints();
  const { pet, catalog, loading: petLoading } = usePet();
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
        TokaApi.gameSessionsMe(),
        TokaApi.leaderboardCurrent(),
        TokaApi.seasonsCurrent(),
      ]);

      const usersMeData = responses[0].status === "fulfilled" ? responses[0].value.data ?? null : null;
      // authMe() ya no es necesario — /users/me devuelve todos los datos personales (Juego Infinito)
      const sessionsData = responses[1].status === "fulfilled" ? responses[1].value.data ?? null : null;
      const leaderboardData = responses[2].status === "fulfilled" ? responses[2].value.data ?? null : null;
      const seasonData = responses[3].status === "fulfilled" ? responses[3].value.data ?? null : null;

      const snapshot = extractProfileSnapshot({
        usersMeData,
        authMeData: null, // /users/me ya incluye toda la info personal desde Juego Infinito
        leaderboardData,
        seasonData,
        sessionsData,
        fallbackPoints: syncedPoints ?? points,
        fallbackAvatarUrl: DEFAULT_PROFILE.avatarUrl,
      });

      // Preferir tribe.activeTier desde /users/me extendido
      const userRec = usersMeData as Record<string, unknown> | null;
      const tribeRec = userRec?.tribe as Record<string, unknown> | null | undefined;
      const activeTier = (tribeRec?.activeTier as string | undefined) ?? snapshot.tierLabel;
      const kycState = (userRec?.kycState as string | undefined) ?? null;

      const nextProfile: ProfileViewModel = {
        displayName: snapshot.displayName,
        avatarUrl: snapshot.avatarUrl,
        tierLabel: activeTier,
        planLabel: snapshot.planLabel,
        tribeName: snapshot.tribeName,
        totalPoints: snapshot.totalPoints,
        maxStreakDays: snapshot.maxStreakDays,
        currentStreakDays: snapshot.currentStreakDays,
        completedChallenges: snapshot.completedChallenges,
        seasonsPlayed: snapshot.seasonsPlayed,
        bestRank: snapshot.bestRank,
        seasonCurrentPoints: snapshot.seasonCurrentPoints,
        seasonGoalPoints: snapshot.seasonGoalPoints,
        kycState,
      };

      setProfile(nextProfile);

      const failedCalls = responses.filter((result) => result.status === "rejected").length;
      if (failedCalls > 0) {
        setProfileWarning("Algunos datos del perfil no se pudieron sincronizar.");
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
                  <p>{profile.bestRank > 0 ? `#${profile.bestRank}` : "--"}</p>
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
                {profile.kycState === "VERIFIED" && (
                  <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}>
                    <ShieldCheck size={14} color="#006a62" />
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#006a62", letterSpacing: "0.04em" }}>IDENTIDAD VERIFICADA</span>
                  </div>
                )}
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
              {petLoading ? (
                <p className="subtle" style={{ textAlign: "center", padding: "16px 0" }}>Cargando mascota...</p>
              ) : pet ? (
                <>
                  <PetDisplay equippedItems={pet.equippedItems} catalogItems={catalog} size="sm" />
                  <p className="fig-perfil-mascota-name">{pet.name}</p>
                  <div className="fig-perfil-mascota-items">
                    {(["hat", "shirt", "accessory"] as const).map((slot) => {
                      const equippedId = pet.equippedItems[slot];
                      const item = catalog.find((i) => i._id === equippedId && i.slot === slot);
                      return (
                        <button key={slot} type="button" className="fig-perfil-item-btn" disabled>
                          <div className="fig-perfil-item-icon">
                            {item?.imageUrl ? (
                              <img src={item.imageUrl} alt={item.name} style={{ width: 18, height: 18, objectFit: "contain" }} />
                            ) : (
                              <span style={{ fontSize: 10, color: "#b0b8c9" }}>—</span>
                            )}
                          </div>
                          <span>{slot.toUpperCase()}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <>
                  <img src="/images/mascota.png" alt="Mascota" className="fig-perfil-mascota-img" />
                  <p className="fig-perfil-mascota-name">Sin mascota</p>
                  <Link href="/perfil/mascota" className="fig-perfil-link" style={{ marginTop: 8 }}>Crear mascota →</Link>
                </>
              )}
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
              <span className="fig-perfil-stat-card-value">{profile.bestRank > 0 ? `#${profile.bestRank}` : "--"}</span>
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
