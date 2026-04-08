"use client";

import { ArrowRight, Clock3, Flame, Trophy } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AppPointsBadge } from "@/components/app-points-badge";
import BottomNav from "@/components/BottomNav";
import { formatAppPoints, useAppPoints } from "@/components/use-app-points";
import { Panel, ProgressBar, SectionHeader } from "@/components/common";
import { MobileHamburgerMenu } from "@/components/mobile-hamburger-menu";
import {
  dailyChallenge,
  FIGMA_ASSETS,
} from "@/lib/data";

const recentActivity = [
  {
    title: "Trivia Express",
    description: "Completado hace 2 h",
    points: "+40 pts",
  },
  {
    title: "Ascenso en el ranking",
    description: "Ayer • Posición #4",
    points: "",
  },
  {
    title: "Tier Oro Activado",
    description: "Hace 2 días - $50 Toka",
    points: "",
  },
];

const leaderboardData = [
  { rank: 1, name: "Solar Club", score: "2,340" },
  { rank: 2, name: "Delta Crew", score: "2,280" },
  { rank: 4, name: "Axo Squad (Tú)", score: "2,140", isHighlighted: true },
  { rank: 5, name: "Orbit Team", score: "2,080" },
];

export default function DashboardPage() {
  const { points } = useAppPoints();

  return (
    <>
      <div className="fig-desktop-only">
        <AppShell title="Home" subtitle="Tu dashboard de retos y actividad" headerBadge={<AppPointsBadge />}>
          <div className="workspace__grid fig-dashboard-main-grid">
        {/* RETO DE HOY - PROMINENTE */}
        <Panel className="fig-panel-featured">
          <SectionHeader 
            eyebrow="Reto de hoy" 
            title={dailyChallenge.title} 
            description={dailyChallenge.description} 
          />
          <article className="challenge-card fig-challenge-daily" style={{ 
            border: "1px solid rgba(74, 119, 227, 0.12)", 
            background: "linear-gradient(180deg, #f8fbff 0%, #edf3ff 100%)" 
          }}>
            <div className="inline-row" style={{ justifyContent: "space-between", marginBottom: 10 }}>
              <span className="status-pill">{dailyChallenge.status}</span>
              <span className="reward-pill"><Clock3 size={14} /> {dailyChallenge.countdown}</span>
            </div>
            <div className="inline-row" style={{ justifyContent: "space-between", alignItems: "center", gap: 16 }}>
              <div>
                <h3 style={{ margin: 0, color: "#0b1f36" }}>Mantén tu racha activa</h3>
                <p style={{ margin: "8px 0 0", color: "#3557a8", fontWeight: 700 }}>{dailyChallenge.closesAt}</p>
              </div>
              <img src={FIGMA_ASSETS.landing.hero} alt="Mascot" draggable="false" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 16 }} />
            </div>
            <div className="inline-row" style={{ justifyContent: "space-between", marginTop: 16 }}>
              <strong>{dailyChallenge.points}</strong>
              <a className="button button--secondary" href="/retos">Jugar ahora <ArrowRight size={16} /></a>
            </div>
            <p className="subtle" style={{ marginTop: 10 }}>Si no lo completas hoy, la racha se rompe.</p>
          </article>
        </Panel>

        {/* LEADERBOARD */}
        <Panel>
          <SectionHeader 
            eyebrow="Leaderboard" 
            title="Leaderboard de tu división"
            description="División Plata • Semana 4"
          />
          <div className="leaderboard-container">
            <div className="leaderboard-list">
              {leaderboardData.map((item) => (
                <div 
                  key={item.rank} 
                  className={`leaderboard-item ${item.isHighlighted ? 'highlighted' : ''}`}
                >
                  <span className="rank">{item.rank}</span>
                  <span className="name">{item.name}</span>
                  <span className="score">{item.score}</span>
                </div>
              ))}
            </div>
          </div>
          <a href="/leaderboard" className="button button--tertiary" style={{ marginTop: 16 }}>Ver todo</a>
        </Panel>

        {/* RECOMPENSAS */}
        <Panel>
          <div className="reward-card" style={{ background: "#e1e3e4", border: "2px dashed rgba(0,106,98,0.3)", borderRadius: 24, padding: 24 }}>
            <span className="badge" style={{ background: "#3864c5", color: "#fff", padding: "4px 12px", borderRadius: "9999px", fontSize: 10, fontWeight: 600 }}>Disponible ahora</span>
            <h3 style={{ marginTop: 10, marginBottom: 8, color: "#001624", fontSize: 18, fontWeight: 800 }}>$50 en saldo Toka</h3>
            <p style={{ margin: "0 0 20px", color: "#42474c", fontSize: 14 }}>Recompensa disponible por racha.</p>
            <a className="button button--primary" href="#" style={{ width: "100%", textAlign: "center" }}>Reclamar</a>
          </div>
        </Panel>

        {/* TEMPORADA */}
        <Panel>
          <SectionHeader 
            eyebrow="Temporada" 
            title="Temporada semanal"
            description="Cierra en 2 días 14 h"
          />
          <div className="season-chart" style={{ display: "flex", gap: 4, height: 100, alignItems: "flex-end", marginBottom: 16 }}>
            {[38.39, 57.59, 86.39, 48, 67.19].map((height, i) => (
              <div key={i} style={{ flex: 1, height: `${height}%`, background: i === 2 ? "#5d89e4" : "#e7e8e9", borderRadius: 8 }} />
            ))}
          </div>
          <p className="subtle">Progreso de temporada esta semana</p>
        </Panel>

        {/* RETO PREMIUM */}
        <Panel>
          <div className="premium-challenge" style={{ background: "#001624", borderRadius: 24, padding: 24, color: "#fff" }}>
            <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 16, width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <Trophy size={20} />
            </div>
            <h4 style={{ color: "#fff", margin: "12px 0 4px", fontWeight: 600 }}>Reto Premium</h4>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, margin: 0, marginBottom: 16 }}>High stakes</p>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#5e8ae5", fontSize: 14, fontWeight: 600 }}>+80 pts</span>
              <ArrowRight size={16} />
            </div>
          </div>
        </Panel>

        {/* ACTIVIDAD RECIENTE */}
        <Panel>
          <SectionHeader eyebrow="Actividad reciente" title="Tu actividad" description="Lo último que pasó en tu Tribe" />
          <div className="stack stack--tight">
            {recentActivity.map((item) => (
              <div key={item.title} className="activity-row fig-activity-item">
                <div className="activity-bullet" style={{ width: 6, height: 6, background: "#006a62", borderRadius: "50%", marginRight: 16 }} />
                <div style={{ flex: 1 }}>
                  <div className="item-title">{item.title}</div>
                  <div className="subtle">{item.description}</div>
                </div>
                {item.points && <div className="score">{item.points}</div>}
              </div>
            ))}
          </div>
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
            <p>Axo Squad · {formatAppPoints(points)} pts</p>
            <span className="fig-retos-racha"><Flame size={14} /> Racha: 3 días</span>
          </div>
          <img src="/images/ajolote_2.png" alt="Mascot" draggable="false" />
        </section>

        <section className="fig-unified-section">
          <article className="fig-unified-card">
            <div className="fig-unified-head">
              <strong>Reto de hoy</strong>
              <span className="fig-retos-timer"><Clock3 size={13} /> {dailyChallenge.countdown}</span>
            </div>
            <h3>{dailyChallenge.title}</h3>
            <p>{dailyChallenge.description}</p>
            <a className="fig-retos-play" href="/retos/serpiente">JUGAR SNAKE</a>
          </article>

          <article className="fig-unified-card fig-unified-card--soft">
            <div className="fig-unified-head">
              <strong>Leaderboard</strong>
              <a href="/leaderboard">Ver</a>
            </div>
            {leaderboardData.slice(0, 3).map((item) => (
              <div key={item.rank} className="fig-unified-row">
                <span>#{item.rank}</span>
                <strong>{item.name}</strong>
                <span>{item.score}</span>
              </div>
            ))}
          </article>

          <article className="fig-unified-card fig-unified-card--dark">
            <div className="fig-unified-head">
              <strong>Recompensa activa</strong>
              <span>$50 Toka</span>
            </div>
            <p>Disponible por racha semanal y participación de la Tribe.</p>
            <a className="fig-retos-play" href="/recompensas">VER RECOMPENSAS</a>
          </article>
        </section>

        <BottomNav active="inicio" />
      </main>
    </>
  );
}
