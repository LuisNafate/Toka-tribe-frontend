import { ArrowRight, CircleCheckBig, Gift, Play } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Panel, ProgressBar, SectionHeader } from "@/components/common";
import { activityItems, challengeCards, FIGMA_ASSETS, leaderboardRows, seasonMilestones, tribeStats } from "@/lib/data";

export default function DashboardPage() {
  return (
    <AppShell title="Hola, Alix y Nafa" subtitle="Tu Tribe está cerca de subir de división" headerBadge={<div className="balance-pill">Balance: $1,240</div>}>
      <Panel className="hero-panel fig-dashboard-hero">
        <div className="hero-panel__layout">
          <div className="hero-panel__copy">
            <span className="pill" style={{ background: "rgba(255,255,255,0.14)" }}>Temporada activa</span>
            <div>
              <h2 className="hero-panel__title">Axo Squad</h2>
              <p className="hero-panel__subtitle">Plata · #4 esta semana</p>
            </div>
            <div className="hero-panel__points">
              <ProgressBar value={80} label="A 120 pts de ascender" suffix="80%" />
              <div className="inline-row">
                <a className="button button--secondary" href="/retos">Jugar reto de hoy <Play size={16} /></a>
              </div>
            </div>
          </div>

          <div className="panel fig-dashboard-status" style={{ margin: 0, background: "rgba(255,255,255,0.96)", boxShadow: "var(--shadow-strong)" }}>
            <SectionHeader eyebrow="Estado de tu Tribe" title="Axo Squad" description="#4 posición semanal" />
            <div className="inline-row" style={{ justifyContent: "space-between", alignItems: "end" }}>
              <div>
                <div className="metric-card__value" style={{ color: "#5d89e4" }}>1,480 pts</div>
                <div className="metric-card__label">Meta: 1,600 pts</div>
              </div>
              <img src={FIGMA_ASSETS.landing.hero} alt="Mascot" draggable="false" style={{ width: 68, height: 82, objectFit: "cover", borderRadius: 14 }} />
            </div>
            <div style={{ marginTop: 20 }}>
              <ProgressBar value={92} label="A 120 pts de ascender" suffix="92%" muted />
            </div>
            <div className="inline-row" style={{ marginTop: 18, color: "#5d89e4", fontWeight: 800 }}>
              <CircleCheckBig size={16} /> Reto de hoy disponible
            </div>
          </div>
        </div>
      </Panel>

      <div className="feature-row fig-dashboard-mini-row">
        {tribeStats.map((item) => (
          <article key={item.label} className="mini-card">
            <div className="mini-icon" aria-hidden="true"><Gift size={18} /></div>
            <h3>{item.label}</h3>
            <p>{item.value}</p>
          </article>
        ))}
      </div>

      <div className="workspace__grid fig-dashboard-main-grid">
        <Panel>
          <SectionHeader eyebrow="Leaderboard" title="Leaderboard de tu división" description="División Plata • Semana 4" action={<a href="/leaderboard" className="button button--secondary" style={{ padding: "0.7rem 1rem" }}>Ver todo</a>} />
          <div className="leaderboard-list">
            {leaderboardRows.map((row) => (
              <div key={row.name} className={`leaderboard-row ${row.tone === "highlight" ? "leaderboard-row--highlight" : ""}`}>
                <div className="rank">{row.rank}</div>
                <div className="avatar" style={{ width: 40, height: 40, background: row.tone === "gold" ? "linear-gradient(135deg,#f4c95d,#c98a13)" : row.tone === "silver" ? "linear-gradient(135deg,#d7dde8,#8f9ab2)" : "linear-gradient(135deg,#0d2f75,#5d89e4)" }}>
                  {row.rank}
                </div>
                <div>
                  <div className="team-name">{row.name}</div>
                  {row.chip ? <div className="reward-pill" style={{ marginTop: 6 }}>{row.chip}</div> : <div className="subtle">&nbsp;</div>}
                </div>
                <div className="score">{row.score}</div>
              </div>
            ))}
          </div>
        </Panel>

        <div className="dashboard-side fig-dashboard-side-stack">
          <Panel>
            <SectionHeader eyebrow="Actividad" title="Tu actividad" description="+85 pts hoy" />
            <div className="stack stack--tight">
              {activityItems.map((item) => (
                <div key={item.title} className="activity-row">
                  <div className="mini-icon" aria-hidden="true"><CircleCheckBig size={16} /></div>
                  <div>
                    <div className="item-title">{item.title}</div>
                    <div className="subtle">{item.value}</div>
                  </div>
                  <div className="score">{item.value}</div>
                </div>
              ))}
            </div>
            <div className="panel" style={{ marginTop: 16, padding: 16, background: "#4a77e3", color: "#fff" }}>
              Completa 2 retos más para el bonus semanal.
            </div>
          </Panel>

          <Panel className="muted-card">
            <span className="status-pill">Disponible ahora</span>
            <h3 style={{ fontSize: "1.55rem" }}>$50 en saldo Toka</h3>
            <p>Recompensa disponible por racha.</p>
            <button className="button button--primary full-width" style={{ marginTop: 14 }} type="button">Reclamar</button>
          </Panel>

          <Panel>
            <SectionHeader eyebrow="Temporada semanal" title="Cierra en 2 días 14 h" />
            <div className="chart-bars">
              {seasonMilestones.map((bar) => (
                <div key={bar.label} className={`chart-bar ${bar.active ? "chart-bar--active" : ""}`} style={{ height: `${bar.height}px` }} />
              ))}
            </div>
            <div className="inline-row" style={{ justifyContent: "space-between", marginTop: 8 }}>
              {seasonMilestones.map((bar) => <span key={bar.label} className="subtle" style={{ textTransform: "uppercase", fontSize: "0.72rem" }}>{bar.label}</span>)}
            </div>
          </Panel>
        </div>
      </div>

      <div className="workspace__grid" style={{ marginTop: 2 }}>
        <Panel>
          <SectionHeader eyebrow="Retos de hoy" title="Acciones rápidas" description="Selecciona una actividad y gana puntos al instante." />
          <div className="challenge-grid fig-dashboard-challenges">
            {challengeCards.map((item) => (
              <article key={item.title} className={`challenge-card ${item.dark ? "challenge-card--dark" : ""}`}>
                <div className="mini-icon" style={{ background: item.dark ? "rgba(255,255,255,0.1)" : undefined }}>
                  <item.icon size={18} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <div className="inline-row" style={{ justifyContent: "space-between", marginTop: 18 }}>
                  <strong>{item.points}</strong>
                  <ArrowRight size={18} />
                </div>
              </article>
            ))}
          </div>
        </Panel>

        <Panel>
          <SectionHeader eyebrow="Actividad reciente" title="Últimos eventos" description="Lo que hizo tu Tribe hoy." />
          <div className="timeline">
            <div className="timeline-row">
              <div className="timeline-dot" />
              <div>
                <strong>Trivia completada</strong>
                <p>Hace 2 horas • +40 pts</p>
              </div>
              <span className="subtle">Hoy</span>
            </div>
            <div className="timeline-row">
              <div className="timeline-dot" />
              <div>
                <strong>Ascenso en el ranking</strong>
                <p>Ayer • Posición #4</p>
              </div>
              <span className="subtle">Ayer</span>
            </div>
            <div className="timeline-row">
              <div className="timeline-dot" />
              <div>
                <strong>Recompensa lista</strong>
                <p>Ayer • $50 saldo</p>
              </div>
              <span className="subtle">Ayer</span>
            </div>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
