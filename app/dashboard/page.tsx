"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Clock3, Flame, Trophy } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AppPointsBadge } from "@/components/app-points-badge";
import BottomNav from "@/components/BottomNav";
import { formatAppPoints, useAppPoints } from "@/components/use-app-points";
import { Panel, SectionHeader } from "@/components/common";
import { MobileHamburgerMenu } from "@/components/mobile-hamburger-menu";
import { FIGMA_ASSETS } from "@/lib/data";
import { TokaApi } from "@/services/toka-api.service";

type LeaderboardItem = {
  rank: number;
  name: string;
  score: number;
  isHighlighted?: boolean;
};

type ActivityItem = {
  title: string;
  description: string;
  points?: string;
};

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
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

function extractLeaderboard(payload: unknown): LeaderboardItem[] {
  const queue: unknown[] = [payload];
  const rows: LeaderboardItem[] = [];

  while (queue.length > 0) {
    const current = queue.shift();

    if (Array.isArray(current)) {
      for (const item of current) {
        const rec = toRecord(item);
        if (!rec) continue;
        const rank = toNumber(rec.rank) ?? toNumber(rec.position) ?? null;
        const name = toText(rec.name) ?? toText(rec.tribeName) ?? toText(rec.teamName) ?? null;
        const score = toNumber(rec.points) ?? toNumber(rec.score) ?? toNumber(rec.totalPoints) ?? null;
        if (rank !== null && name && score !== null) {
          rows.push({
            rank,
            name,
            score,
            isHighlighted: Boolean(rec.isMine ?? rec.me ?? false),
          });
        }
      }
      continue;
    }

    const rec = toRecord(current);
    if (!rec) continue;
    for (const value of Object.values(rec)) {
      if (value && typeof value === "object") queue.push(value);
    }
  }

  return rows.sort((a, b) => a.rank - b.rank);
}

export default function DashboardPage() {
  const { points } = useAppPoints();
  const [tribeName, setTribeName] = useState("Sin tribe");
  const [challengeTitle, setChallengeTitle] = useState("Sin reto activo");
  const [challengeDescription, setChallengeDescription] = useState("Aún no hay un reto sincronizado para tu sesión.");
  const [challengeCountdown, setChallengeCountdown] = useState("Sin horario");
  const [challengePointsLabel, setChallengePointsLabel] = useState("0 pts");
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardItem[]>([]);
  const [rewardTitle, setRewardTitle] = useState("Sin recompensa disponible");
  const [rewardDescription, setRewardDescription] = useState("No hay recompensas sincronizadas por ahora.");
  const [seasonTitle, setSeasonTitle] = useState("Temporada sin datos");
  const [seasonDescription, setSeasonDescription] = useState("Sin información de cierre por el momento.");
  const [activityItems, setActivityItems] = useState<ActivityItem[]>([]);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      setWarning(null);

      const [usersResult, challengeResult, leaderboardResult, rewardsResult, seasonsResult, sessionsResult] = await Promise.allSettled([
        TokaApi.usersMe(),
        TokaApi.challengesActive(),
        TokaApi.leaderboardCurrent(),
        TokaApi.rewardsList(),
        TokaApi.seasonsCurrent(),
        TokaApi.gameSessionsMe(),
      ]);

      if (usersResult.status === "fulfilled") {
        const usersData = toRecord(usersResult.value.data);
        const nextTribe =
          toText(usersData?.tribeName) ??
          toText(toRecord(usersData?.tribe)?.name) ??
          null;
        if (nextTribe) setTribeName(nextTribe);
      }

      if (challengeResult.status === "fulfilled") {
        const challengeData = challengeResult.value.data;
        const rec = toRecord(Array.isArray(challengeData) ? challengeData[0] : challengeData);
        const title = toText(rec?.title) ?? toText(rec?.name);
        const desc = toText(rec?.description);
        const closeAt = toText(rec?.endsAt) ?? toText(rec?.closeAt) ?? toText(rec?.countdown);
        const pts = toNumber(rec?.points) ?? toNumber(rec?.rewardPoints) ?? toNumber(rec?.score);

        if (title) setChallengeTitle(title);
        if (desc) setChallengeDescription(desc);
        if (closeAt) setChallengeCountdown(closeAt);
        if (pts !== null) setChallengePointsLabel(`${pts.toLocaleString("es-ES")} pts`);
      }

      if (leaderboardResult.status === "fulfilled") {
        const rows = extractLeaderboard(leaderboardResult.value.data);
        setLeaderboardData(rows.slice(0, 5));
      }

      if (rewardsResult.status === "fulfilled") {
        const payload = rewardsResult.value.data;
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(toRecord(payload)?.items)
            ? (toRecord(payload)?.items as unknown[])
            : [];
        const firstReward = toRecord(list[0]);
        const title = toText(firstReward?.title) ?? toText(firstReward?.name);
        const description = toText(firstReward?.description);
        if (title) setRewardTitle(title);
        if (description) setRewardDescription(description);
      }

      if (seasonsResult.status === "fulfilled") {
        const seasonData = toRecord(seasonsResult.value.data);
        const title = toText(seasonData?.name) ?? toText(seasonData?.title);
        const description = toText(seasonData?.status) ?? toText(seasonData?.endsAt) ?? toText(seasonData?.description);
        if (title) setSeasonTitle(title);
        if (description) setSeasonDescription(description);
      }

      if (sessionsResult.status === "fulfilled") {
        const payload = sessionsResult.value.data;
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(toRecord(payload)?.sessions)
            ? (toRecord(payload)?.sessions as unknown[])
            : [];

        const nextItems = list.slice(0, 3).map((item) => {
          const rec = toRecord(item);
          const gameType = toText(rec?.gameType) ?? "Juego";
          const score = toNumber(rec?.score) ?? 0;
          const when = toText(rec?.createdAt) ?? "Reciente";
          return {
            title: gameType,
            description: when,
            points: `+${score.toLocaleString("es-ES")} pts`,
          } satisfies ActivityItem;
        });

        setActivityItems(nextItems);
      }

      const failed = [usersResult, challengeResult, leaderboardResult, rewardsResult, seasonsResult, sessionsResult].filter((result) => result.status === "rejected").length;
      if (failed > 0) {
        setWarning("Algunos bloques de Home no se pudieron sincronizar.");
      }
    }

    void loadDashboard();
  }, []);

  const topThree = useMemo(() => leaderboardData.slice(0, 3), [leaderboardData]);

  return (
    <>
      <div className="fig-desktop-only">
        <AppShell title="Home" subtitle="Tu dashboard de retos y actividad" headerBadge={<AppPointsBadge />}>
          <div className="workspace__grid fig-dashboard-main-grid">
            <Panel className="fig-panel-featured">
              <SectionHeader
                eyebrow="Reto de hoy"
                title={challengeTitle}
                description={challengeDescription}
              />
              <article className="challenge-card fig-challenge-daily" style={{ border: "1px solid rgba(74, 119, 227, 0.12)", background: "linear-gradient(180deg, #f8fbff 0%, #edf3ff 100%)" }}>
                <div className="inline-row" style={{ justifyContent: "space-between", marginBottom: 10 }}>
                  <span className="status-pill">Activo</span>
                  <span className="reward-pill"><Clock3 size={14} /> {challengeCountdown}</span>
                </div>
                <div className="inline-row" style={{ justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                  <div>
                    <h3 style={{ margin: 0, color: "#0b1f36" }}>Sigue sumando puntos</h3>
                    <p style={{ margin: "8px 0 0", color: "#3557a8", fontWeight: 700 }}>{challengeDescription}</p>
                  </div>
                  <img src={FIGMA_ASSETS.landing.hero} alt="Mascot" draggable="false" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 16 }} />
                </div>
                <div className="inline-row" style={{ justifyContent: "space-between", marginTop: 16 }}>
                  <strong>{challengePointsLabel}</strong>
                  <a className="button button--secondary" href="/retos">Jugar ahora <ArrowRight size={16} /></a>
                </div>
              </article>
            </Panel>

            <Panel>
              <SectionHeader
                eyebrow="Leaderboard"
                title="Leaderboard de tu división"
                description="Posiciones sincronizadas en tiempo real"
              />
              {leaderboardData.length === 0 ? <p className="subtle">No hay ranking sincronizado por ahora.</p> : null}
              <div className="leaderboard-container">
                <div className="leaderboard-list">
                  {leaderboardData.map((item) => (
                    <div key={`${item.rank}-${item.name}`} className={`leaderboard-item ${item.isHighlighted ? "highlighted" : ""}`}>
                      <span className="rank">{item.rank}</span>
                      <span className="name">{item.name}</span>
                      <span className="score">{item.score.toLocaleString("es-ES")}</span>
                    </div>
                  ))}
                </div>
              </div>
              <a href="/leaderboard" className="button button--tertiary" style={{ marginTop: 16 }}>Ver todo</a>
            </Panel>

            <Panel>
              <div className="reward-card" style={{ background: "#e1e3e4", border: "2px dashed rgba(0,106,98,0.3)", borderRadius: 24, padding: 24 }}>
                <span className="badge" style={{ background: "#3864c5", color: "#fff", padding: "4px 12px", borderRadius: "9999px", fontSize: 10, fontWeight: 600 }}>Recompensas</span>
                <h3 style={{ marginTop: 10, marginBottom: 8, color: "#001624", fontSize: 18, fontWeight: 800 }}>{rewardTitle}</h3>
                <p style={{ margin: "0 0 20px", color: "#42474c", fontSize: 14 }}>{rewardDescription}</p>
                <a className="button button--primary" href="/recompensas" style={{ width: "100%", textAlign: "center" }}>Ver recompensas</a>
              </div>
            </Panel>

            <Panel>
              <SectionHeader
                eyebrow="Temporada"
                title={seasonTitle}
                description={seasonDescription}
              />
              <p className="subtle">Consulta los detalles completos en la vista de temporada.</p>
            </Panel>

            <Panel>
              <div className="premium-challenge" style={{ background: "#001624", borderRadius: 24, padding: 24, color: "#fff" }}>
                <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 16, width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                  <Trophy size={20} />
                </div>
                <h4 style={{ color: "#fff", margin: "12px 0 4px", fontWeight: 600 }}>Resumen competitivo</h4>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, margin: 0, marginBottom: 16 }}>Tu progreso se actualiza por cada sesión enviada.</p>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#5e8ae5", fontSize: 14, fontWeight: 600 }}>{formatAppPoints(points)} pts</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            </Panel>

            <Panel>
              <SectionHeader eyebrow="Actividad reciente" title="Tu actividad" description="Lo último sincronizado desde tus sesiones" />
              {activityItems.length === 0 ? <p className="subtle">Sin actividad sincronizada por ahora.</p> : null}
              <div className="stack stack--tight">
                {activityItems.map((item) => (
                  <div key={`${item.title}-${item.description}`} className="activity-row fig-activity-item">
                    <div className="activity-bullet" style={{ width: 6, height: 6, background: "#006a62", borderRadius: "50%", marginRight: 16 }} />
                    <div style={{ flex: 1 }}>
                      <div className="item-title">{item.title}</div>
                      <div className="subtle">{item.description}</div>
                    </div>
                    {item.points ? <div className="score">{item.points}</div> : null}
                  </div>
                ))}
              </div>
              {warning ? <p className="subtle" style={{ marginTop: 12 }}>{warning}</p> : null}
            </Panel>
          </div>
        </AppShell>
      </div>

      <main className="fig-mobile-dashboard fig-mobile-only">
        <header className="fig-mobile-topbar fig-retos-topbar">
          <div className="fig-mobile-topbar__left">
            <MobileHamburgerMenu />
            <strong className="fig-retos-brand">TokaTribe</strong>
          </div>
          <div className="fig-retos-avatar">
            <img src={FIGMA_ASSETS.landing.hero} alt="Avatar" />
          </div>
        </header>

        <section className="fig-retos-hero">
          <div className="fig-retos-hero__content">
            <h1>Home</h1>
            <p>{tribeName} · {formatAppPoints(points)} pts</p>
            <span className="fig-retos-racha"><Flame size={14} /> Estado sincronizado</span>
          </div>
          <img src="/images/ajolote_2.png" alt="Mascot" draggable="false" />
        </section>

        <section className="fig-unified-section">
          <article className="fig-unified-card">
            <div className="fig-unified-head">
              <strong>Reto activo</strong>
              <span className="fig-retos-timer"><Clock3 size={13} /> {challengeCountdown}</span>
            </div>
            <h3>{challengeTitle}</h3>
            <p>{challengeDescription}</p>
            <a className="fig-retos-play" href="/retos">IR A RETOS</a>
          </article>

          <article className="fig-unified-card fig-unified-card--soft">
            <div className="fig-unified-head">
              <strong>Leaderboard</strong>
              <a href="/leaderboard">Ver</a>
            </div>
            {topThree.length === 0 ? <p className="subtle">Sin ranking disponible.</p> : null}
            {topThree.map((item) => (
              <div key={`${item.rank}-${item.name}`} className="fig-unified-row">
                <span>#{item.rank}</span>
                <strong>{item.name}</strong>
                <span>{item.score.toLocaleString("es-ES")}</span>
              </div>
            ))}
          </article>

          <article className="fig-unified-card fig-unified-card--dark">
            <div className="fig-unified-head">
              <strong>Recompensa</strong>
              <span>Sin simulación</span>
            </div>
            <p>{rewardTitle}</p>
            <a className="fig-retos-play" href="/recompensas">VER RECOMPENSAS</a>
          </article>
        </section>

        {warning ? <p className="subtle" style={{ padding: "0 20px" }}>{warning}</p> : null}

        <BottomNav active="inicio" />
      </main>
    </>
  );
}
