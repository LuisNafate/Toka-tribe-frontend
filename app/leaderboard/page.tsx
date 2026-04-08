import { Flame, Target, Trophy } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AppPointsBadge } from "@/components/app-points-badge";
import BottomNav from "@/components/BottomNav";
import { MobileHamburgerMenu } from "@/components/mobile-hamburger-menu";
import { Panel, SectionHeader } from "@/components/common";
import { FIGMA_ASSETS, leaderboardRows } from "@/lib/data";

export default function LeaderboardPage() {
  return (
    <>
      <div className="fig-desktop-only">
        <AppShell title="Leaderboard" subtitle="Ranking por división y temporada" headerBadge={<AppPointsBadge />}>
          <div className="workspace__grid">
        <Panel>
          <SectionHeader eyebrow="División Plata" title="Clasificación semanal" description="Las posiciones cambian conforme tu Tribe suma puntos." action={<span className="badge">Semana 4</span>} />
          <div className="chip-list" style={{ marginBottom: 18 }}>
            <span className="chip chip--active"><Target size={16} /> Plata</span>
            <span className="chip">Oro</span>
            <span className="chip">Diamante</span>
          </div>
          <div className="leaderboard-list">
            {leaderboardRows.concat([{ rank: 6, name: "Pulse Unit", score: "1,980", tone: "muted" }]).map((row) => (
              <div key={row.name} className={`leaderboard-row ${row.tone === "highlight" ? "leaderboard-row--highlight" : ""}`}>
                <div className="rank">{row.rank}</div>
                <div className="avatar" style={{ width: 40, height: 40 }}>{row.rank}</div>
                <div>
                  <div className="team-name">{row.name}</div>
                  <div className="subtle">Progreso semanal y bonus por retos</div>
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

          <Panel>
            <SectionHeader eyebrow="Premio de división" title="$50 en saldo Toka" description="Disponible para el equipo mejor posicionado." />
            <button className="button button--primary full-width" type="button">Reclamar posición</button>
          </Panel>

          <Panel>
            <SectionHeader eyebrow="Motivo de avance" title="¿Qué falta para ascender?" description="La posición de tu Tribe se actualiza en tiempo real." />
            <div className="stack stack--tight">
              <p>• Completar 2 retos adicionales</p>
              <p>• Mantener la racha de equipo</p>
              <p>• Superar a la Tribe del puesto #3</p>
            </div>
          </Panel>
        </div>
          </div>
        </AppShell>
      </div>

      <main className="fig-mobile-leaderboard fig-mobile-only">
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
            <h1>Leaderboard</h1>
            <p>División Plata · Semana 4</p>
            <span className="fig-retos-racha"><Flame size={14} /> Cerrando en 2 días</span>
          </div>
          <img src="/images/ajolote_3.png" alt="Mascot" draggable="false" />
        </section>

        <section className="fig-unified-section">
          <article className="fig-unified-card fig-unified-card--soft">
            <div className="fig-unified-head">
              <strong>Top de la división</strong>
              <Trophy size={16} color="#2a55b9" />
            </div>
            {leaderboardRows.concat([{ rank: 6, name: "Pulse Unit", score: "1,980", tone: "muted" }]).map((row) => (
              <div key={row.name} className={`fig-unified-row ${row.tone === "highlight" ? "is-highlight" : ""}`}>
                <span>#{row.rank}</span>
                <strong>{row.name}</strong>
                <span>{row.score}</span>
              </div>
            ))}
          </article>

          <article className="fig-unified-card">
            <div className="fig-unified-head">
              <strong>Motivo de avance</strong>
              <Target size={16} color="#2a55b9" />
            </div>
            <p>Completa 2 retos más, conserva racha y supera al puesto #3 para entrar al top.</p>
          </article>
        </section>

        <BottomNav active="retos" />
      </main>
    </>
  );
}
