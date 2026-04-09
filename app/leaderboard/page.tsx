"use client";

import { useEffect, useMemo, useState } from "react";
import { Crown } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { AppPointsBadge } from "@/components/app-points-badge";
import BottomNav from "@/components/BottomNav";
import { MobileHamburgerMenu } from "@/components/mobile-hamburger-menu";
import { Panel, SectionHeader } from "@/components/common";
import { FIGMA_ASSETS } from "@/lib/data";
import { TokaApi } from "@/services/toka-api.service";

type Division = "bronce" | "plata" | "oro";
type Zone = "up" | "down" | "neutral";

type TribeRank = {
  rank: number;
  name: string;
  pts: number;
  initials: string;
  color: string;
  isUser?: boolean;
  zone: Zone;
};

const DIV_LABELS: Record<Division, string> = {
  bronce: "Bronce",
  plata: "Plata",
  oro: "Oro",
};

const RANK_CIRCLE_CLASS: Record<number, string> = {
  1: "fig-lb-rank-circle--gold",
  2: "fig-lb-rank-circle--silver",
  3: "fig-lb-rank-circle--bronze",
};

const palette = ["#f97316", "#4a77e3", "#8b5cf6", "#10b981", "#ef4444", "#14b8a6", "#6366f1", "#64748b"];

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, ""));
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function toText(value: unknown): string | null {
  if (typeof value === "string" && value.trim() !== "") return value.trim();
  return null;
}

function initialsFromName(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "TR";
}

function zoneForRank(rank: number): Zone {
  if (rank <= 2) return "up";
  if (rank >= 7) return "down";
  return "neutral";
}

function normalizeDivision(raw: string): Division {
  const value = raw.toLowerCase();
  if (value.includes("oro")) return "oro";
  if (value.includes("bron")) return "bronce";
  return "plata";
}

function extractRows(payload: unknown): TribeRank[] {
  const queue: unknown[] = [payload];
  const rows: TribeRank[] = [];

  while (queue.length > 0) {
    const current = queue.shift();
    if (Array.isArray(current)) {
      for (const item of current) {
        const rec = toRecord(item);
        if (!rec) continue;

        const rank = toNumber(rec.rank) ?? toNumber(rec.position) ?? null;
        const name = toText(rec.name) ?? toText(rec.tribeName) ?? toText(rec.teamName) ?? null;
        const pts = toNumber(rec.points) ?? toNumber(rec.score) ?? toNumber(rec.totalPoints) ?? null;

        if (rank !== null && name && pts !== null) {
          rows.push({
            rank,
            name,
            pts,
            initials: initialsFromName(name),
            color: palette[(rank - 1 + palette.length) % palette.length],
            isUser: Boolean(rec.isMine ?? rec.isCurrentUser ?? rec.me ?? false),
            zone: zoneForRank(rank),
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

  return rows
    .filter((item, idx, arr) => arr.findIndex((x) => x.rank === item.rank && x.name === item.name) === idx)
    .sort((a, b) => a.rank - b.rank);
}

export default function LeaderboardPage() {
  const [activeDiv, setActiveDiv] = useState<Division>("plata");
  const [divisions, setDivisions] = useState<Record<Division, TribeRank[]>>({
    bronce: [],
    plata: [],
    oro: [],
  });
  const [weekLabel, setWeekLabel] = useState("Semana activa");
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    async function loadLeaderboard() {
      const [current, bronce, plata, oro] = await Promise.allSettled([
        TokaApi.leaderboardCurrent(),
        TokaApi.leaderboardByDivision("bronce"),
        TokaApi.leaderboardByDivision("plata"),
        TokaApi.leaderboardByDivision("oro"),
      ]);

      const next: Record<Division, TribeRank[]> = {
        bronce: [],
        plata: [],
        oro: [],
      };

      if (bronce.status === "fulfilled") {
        const rows = extractRows(bronce.value.data);
        if (rows.length > 0) next.bronce = rows;
      }
      if (plata.status === "fulfilled") {
        const rows = extractRows(plata.value.data);
        if (rows.length > 0) next.plata = rows;
      }
      if (oro.status === "fulfilled") {
        const rows = extractRows(oro.value.data);
        if (rows.length > 0) next.oro = rows;
      }

      if (current.status === "fulfilled") {
        const currentRows = extractRows(current.value.data);
        if (currentRows.length > 0) {
          const rawDiv = toText((toRecord(current.value.data)?.division ?? "") as unknown);
          const inferredDiv = rawDiv ? normalizeDivision(rawDiv) : "plata";
          next[inferredDiv] = currentRows;
          setActiveDiv(inferredDiv);
        }

        const seasonName = toText((toRecord(current.value.data)?.seasonName ?? null) as unknown);
        if (seasonName) setWeekLabel(seasonName);
      }

      setDivisions(next);

      const failed = [current, bronce, plata, oro].filter((item) => item.status === "rejected").length;
      if (failed > 0) {
        setWarning("Algunos datos del leaderboard no pudieron sincronizarse.");
      }
    }

    void loadLeaderboard();
  }, []);

  const teams = divisions[activeDiv];
  const podium = teams.length >= 3 ? [teams[1], teams[0], teams[2]] : [];
  const listTeams = teams.slice(3);
  const userTribe = teams.find((team) => team.isUser) ?? teams[1] ?? teams[0];
  const teamAbove = teams.find((team) => team.rank === Math.max(1, (userTribe?.rank ?? 2) - 1)) ?? teams[0] ?? userTribe;
  const ptsNeeded = Math.max(0, (teamAbove?.pts ?? 0) - (userTribe?.pts ?? 0));
  const progressPct = teamAbove?.pts ? Math.min(100, Math.round(((userTribe?.pts ?? 0) / teamAbove.pts) * 100)) : 0;

  return (
    <>
      <div className="fig-desktop-only">
        <AppShell
          title="Leaderboard"
          subtitle="Ranking por división y temporada"
          headerBadge={<AppPointsBadge />}
        >
          <div className="workspace__grid">
            <Panel>
              <SectionHeader
                eyebrow={`División ${DIV_LABELS[activeDiv]}`}
                title="Clasificación semanal"
                description="Las posiciones cambian conforme tu Tribe suma puntos."
                action={<span className="badge">{weekLabel}</span>}
              />
              {warning ? <p className="subtle">{warning}</p> : null}
              {teams.length === 0 ? <p className="subtle">No hay datos de ranking disponibles para esta división.</p> : null}
              <div className="leaderboard-list">
                {teams.map((row) => (
                  <div
                    key={`${row.rank}-${row.name}`}
                    className={`leaderboard-row ${row.isUser ? "leaderboard-row--highlight" : ""}`}
                  >
                    <div className="rank">{row.rank}</div>
                    <div className="avatar" style={{ width: 40, height: 40 }}>{row.initials}</div>
                    <div>
                      <div className="team-name">{row.name}</div>
                      <div className="subtle">Progreso semanal</div>
                    </div>
                    <div className="score">{row.pts.toLocaleString("es-ES")}</div>
                  </div>
                ))}
              </div>
            </Panel>
            <div className="dashboard-side">
              <Panel className="muted-card">
                <span className="status-pill">Top 3</span>
                <h3 style={{ fontSize: "1.55rem" }}>Puntos por estabilidad</h3>
                <p>La retención de la Tribe depende de la suma colectiva diaria y el cierre de temporada.</p>
              </Panel>
            </div>
          </div>
        </AppShell>
      </div>

      <main className="fig-lb-page fig-mobile-only">
        <header className="fig-lb-header">
          <div className="fig-lb-header-left">
            <MobileHamburgerMenu />
            <span className="fig-lb-brand">TokaTribe</span>
          </div>
          <div className="fig-retos-avatar">
            <img src={FIGMA_ASSETS.landing.hero} alt="Avatar" />
          </div>
        </header>

        <div className="fig-lb-tabs">
          {(["bronce", "plata", "oro"] as Division[]).map((div) => (
            <button
              key={div}
              type="button"
              className={`fig-lb-tab${activeDiv === div ? ` fig-lb-tab--active fig-lb-tab--${div}` : ""}`}
              onClick={() => setActiveDiv(div)}
            >
              {DIV_LABELS[div]}
            </button>
          ))}
        </div>

        <div className="fig-lb-hero">
          <div>
            <h2 className="fig-lb-hero-title">Liga TokaTribe</h2>
            <p className="fig-lb-hero-sub">{weekLabel}</p>
          </div>
          {userTribe ? (
            <span className="fig-lb-hero-chip">
              {userTribe.name.toUpperCase()} · #{userTribe.rank} EN {DIV_LABELS[activeDiv].toUpperCase()}
            </span>
          ) : null}
        </div>

        <section className="fig-lb-podium">
          {podium.length === 0 ? <p className="subtle">Sin datos de podio por ahora.</p> : null}
          {podium.map((team, i) => {
            const isFirst = i === 1;
            return (
              <div
                key={team.name}
                className={`fig-lb-podium-slot${isFirst ? " fig-lb-podium-slot--first" : ""}`}
              >
                {isFirst && (
                  <Crown size={22} className="fig-lb-crown" fill="currentColor" />
                )}
                <div className={`fig-lb-podium-card${isFirst ? " fig-lb-podium-card--first" : ""}`}>
                  <div
                    className="fig-lb-podium-avatar"
                    style={{ background: team.color }}
                  >
                    {team.initials}
                    {team.isUser && <span className="fig-lb-you-dot" />}
                  </div>
                  <p className="fig-lb-podium-pts">{team.pts.toLocaleString("es-ES")} pts</p>
                  <p className="fig-lb-podium-name">{team.name}</p>
                </div>
                <div className={`fig-lb-rank-circle ${RANK_CIRCLE_CLASS[team.rank] ?? ""}`}>
                  {team.rank}
                </div>
              </div>
            );
          })}
        </section>

        <section className="fig-lb-list">
          {listTeams.map((team) => (
            <div
              key={team.name}
              className={`fig-lb-row${team.isUser ? " fig-lb-row--user" : ""}`}
            >
              <span className="fig-lb-row-rank">{team.rank}</span>
              <div className="fig-lb-row-avatar-wrap">
                {team.isUser && (
                  <span className="fig-lb-tu-equipo">TU EQUIPO</span>
                )}
                <div
                  className="fig-lb-row-avatar"
                  style={{ background: team.color }}
                >
                  {team.initials}
                </div>
              </div>
              <span className="fig-lb-row-name">{team.name}</span>
              {team.zone === "up" && (
                <span className="fig-lb-zone-chip fig-lb-zone-chip--up">ZONA DE ASCENSO</span>
              )}
              {team.zone === "down" && (
                <span className="fig-lb-zone-chip fig-lb-zone-chip--down">ZONA DE DESCENSO</span>
              )}
              <span className="fig-lb-row-pts">
                {team.pts.toLocaleString("es-ES")}
              </span>
            </div>
          ))}
        </section>

        {userTribe ? (
          <div className="fig-lb-footer">
            <div className="fig-lb-footer-top">
              <div className="fig-lb-footer-main-row">
                <span className="fig-lb-footer-eyebrow">TU POSICIÓN</span>
                <Link href="/tribe" className="fig-lb-footer-link">Ver tu Squad →</Link>
              </div>
              <p className="fig-lb-footer-main">
                #{userTribe.rank} {userTribe.name} · {userTribe.pts.toLocaleString("es-ES")} pts
              </p>
            </div>
            <div className="fig-lb-footer-meta">
              <span>A {ptsNeeded.toLocaleString("es-ES")} pts del #1 · {teamAbove?.name ?? "Top"}</span>
              <span>Progreso {progressPct}%</span>
            </div>
            <div className="fig-lb-footer-bar">
              <div style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        ) : null}

        <BottomNav />
      </main>
    </>
  );
}
