"use client";

import { useState } from "react";
import { Crown } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { AppPointsBadge } from "@/components/app-points-badge";
import BottomNav from "@/components/BottomNav";
import { MobileHamburgerMenu } from "@/components/mobile-hamburger-menu";
import { Panel, SectionHeader } from "@/components/common";
import { FIGMA_ASSETS, leaderboardRows } from "@/lib/data";

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

const divisions: Record<Division, TribeRank[]> = {
  bronce: [
    { rank: 1, name: "Fire Squad",   pts: 1850, initials: "FS", color: "#ef4444", zone: "up" },
    { rank: 2, name: "Blue Hawks",   pts: 1720, initials: "BH", color: "#3b82f6", zone: "up" },
    { rank: 3, name: "Storm Tribe",  pts: 1640, initials: "ST", color: "#6366f1", zone: "neutral" },
    { rank: 4, name: "Night Owls",   pts: 1520, initials: "NO", color: "#8b5cf6", zone: "up" },
    { rank: 5, name: "Sand Wolves",  pts: 1380, initials: "SW", color: "#f59e0b", zone: "neutral" },
    { rank: 6, name: "Ice Runners",  pts: 1250, initials: "IR", color: "#06b6d4", zone: "neutral" },
    { rank: 7, name: "Lost Tribe",   pts: 1120, initials: "LT", color: "#94a3b8", zone: "down" },
    { rank: 8, name: "Zero Club",    pts:  980, initials: "ZC", color: "#64748b", zone: "down" },
  ],
  plata: [
    { rank: 1, name: "Los Titanes",    pts: 2450, initials: "LT", color: "#f97316", zone: "up" },
    { rank: 2, name: "Axo Squad",      pts: 2140, initials: "AX", color: "#4a77e3", isUser: true, zone: "up" },
    { rank: 3, name: "Cyber Runners",  pts: 1980, initials: "CR", color: "#8b5cf6", zone: "neutral" },
    { rank: 4, name: "Digital Wolves", pts: 1820, initials: "DW", color: "#10b981", zone: "up" },
    { rank: 5, name: "Iron Tribe",     pts: 1650, initials: "IT", color: "#ef4444", zone: "neutral" },
    { rank: 6, name: "Sky Hunters",    pts: 1520, initials: "SH", color: "#14b8a6", zone: "neutral" },
    { rank: 7, name: "Wave Makers",    pts: 1380, initials: "WM", color: "#6366f1", zone: "down" },
    { rank: 8, name: "Pulse Unit",     pts: 1240, initials: "PU", color: "#64748b", zone: "down" },
  ],
  oro: [
    { rank: 1, name: "Elite Force",    pts: 4820, initials: "EF", color: "#f59e0b", zone: "up" },
    { rank: 2, name: "Thunder Clan",   pts: 4510, initials: "TC", color: "#ef4444", zone: "up" },
    { rank: 3, name: "Golden Wolves",  pts: 4280, initials: "GW", color: "#10b981", zone: "neutral" },
    { rank: 4, name: "Royal Squad",    pts: 4050, initials: "RS", color: "#8b5cf6", zone: "up" },
    { rank: 5, name: "Apex Tribe",     pts: 3820, initials: "AT", color: "#6366f1", zone: "neutral" },
    { rank: 6, name: "Power House",    pts: 3640, initials: "PH", color: "#06b6d4", zone: "neutral" },
    { rank: 7, name: "Last Stand",     pts: 3420, initials: "LS", color: "#94a3b8", zone: "down" },
    { rank: 8, name: "End Game",       pts: 3180, initials: "EG", color: "#64748b", zone: "down" },
  ],
};

// User is always in Plata #2
const USER_DIV: Division = "plata";
const userTribe = divisions.plata.find((t) => t.isUser)!;
const teamAbove = divisions.plata[0];
const ptsNeeded = teamAbove.pts - userTribe.pts;
const progressPct = Math.round((userTribe.pts / teamAbove.pts) * 100);

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

export default function LeaderboardPage() {
  const [activeDiv, setActiveDiv] = useState<Division>(USER_DIV);

  const teams = divisions[activeDiv];
  // Podium visual order: 2nd left, 1st center, 3rd right
  const podium = [teams[1], teams[0], teams[2]];
  const listTeams = teams.slice(3); // positions 4–8

  return (
    <>
      {/* ── Desktop (unchanged) ── */}
      <div className="fig-desktop-only">
        <AppShell
          title="Leaderboard"
          subtitle="Ranking por división y temporada"
          headerBadge={<AppPointsBadge />}
        >
          <div className="workspace__grid">
            <Panel>
              <SectionHeader
                eyebrow="División Plata"
                title="Clasificación semanal"
                description="Las posiciones cambian conforme tu Tribe suma puntos."
                action={<span className="badge">Semana 4</span>}
              />
              <div className="leaderboard-list">
                {leaderboardRows.concat([{ rank: 6, name: "Pulse Unit", score: "1,980", tone: "muted" }]).map((row) => (
                  <div
                    key={row.name}
                    className={`leaderboard-row ${row.tone === "highlight" ? "leaderboard-row--highlight" : ""}`}
                  >
                    <div className="rank">{row.rank}</div>
                    <div className="avatar" style={{ width: 40, height: 40 }}>{row.rank}</div>
                    <div>
                      <div className="team-name">{row.name}</div>
                      <div className="subtle">Progreso semanal</div>
                    </div>
                    <div className="score">{row.score}</div>
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

      {/* ── Mobile ── */}
      <main className="fig-lb-page fig-mobile-only">

        {/* Header */}
        <header className="fig-lb-header">
          <div className="fig-lb-header-left">
            <MobileHamburgerMenu />
            <span className="fig-lb-brand">TokaTribe</span>
          </div>
          <div className="fig-retos-avatar">
            <img src={FIGMA_ASSETS.landing.hero} alt="Avatar" />
          </div>
        </header>

        {/* Division tabs: Bronce | Plata | Oro */}
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

        {/* Hero card */}
        <div className="fig-lb-hero">
          <div>
            <h2 className="fig-lb-hero-title">Liga TokaTribe</h2>
            <p className="fig-lb-hero-sub">Semana 4 · Cierra en 2 días 14h</p>
          </div>
          <span className="fig-lb-hero-chip">
            AXO SQUAD · #{userTribe.rank} EN {DIV_LABELS[USER_DIV].toUpperCase()}
          </span>
        </div>

        {/* Podium top 3 */}
        <section className="fig-lb-podium">
          {podium.map((team, i) => {
            const isFirst = i === 1; // rank 1 is center
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
                  <p className="fig-lb-podium-pts">{team.pts.toLocaleString()} pts</p>
                  <p className="fig-lb-podium-name">{team.name}</p>
                </div>
                <div className={`fig-lb-rank-circle ${RANK_CIRCLE_CLASS[team.rank] ?? ""}`}>
                  {team.rank}
                </div>
              </div>
            );
          })}
        </section>

        {/* List positions 4–8 */}
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
                {team.pts.toLocaleString()}
              </span>
            </div>
          ))}
        </section>

        {/* Fixed bottom: status bar + nav stacked together */}
        <div className="fig-lb-bottom-fixed">
          <div className="fig-lb-footer">
            <div className="fig-lb-footer-top">
              <div className="fig-lb-footer-main-row">
                <span className="fig-lb-footer-eyebrow">TU POSICIÓN</span>
                <Link href="/tribe" className="fig-lb-footer-link">Ver tu Squad →</Link>
              </div>
              <p className="fig-lb-footer-main">
                #{userTribe.rank} {userTribe.name} · {userTribe.pts.toLocaleString()} pts
              </p>
            </div>
            <div className="fig-lb-footer-meta">
              <span>A {ptsNeeded} pts del #1 · {teamAbove.name}</span>
              <span>Progreso {progressPct}%</span>
            </div>
            <div className="fig-lb-footer-bar">
              <div style={{ width: `${progressPct}%` }} />
            </div>
          </div>
          <BottomNav />
        </div>
      </main>
    </>
  );
}
