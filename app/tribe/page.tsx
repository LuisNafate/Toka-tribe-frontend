import { ArrowUpRight, Crown, Sparkles, Users } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Panel, ProgressBar, SectionHeader } from "@/components/common";
import { leaderboardRows, tribeStats } from "@/lib/data";

export default function TribePage() {
  return (
    <AppShell title="Mi Tribe" subtitle="Estructura, miembros y progreso tribal">
      <div className="workspace__grid">
        <Panel className="panel--hero">
          <SectionHeader eyebrow="Temporada activa" title="Axo Squad" description="Una Tribe cohesionada compite, coopera y escala divisiones." action={<span className="badge">Plata</span>} />
          <div className="hero-panel__layout" style={{ gridTemplateColumns: "1fr 220px" }}>
            <div className="hero-panel__copy">
              <div className="chip-list">
                <span className="chip chip--active"><Crown size={16} /> Top 4</span>
                <span className="chip"><Users size={16} /> 10 miembros</span>
                <span className="chip"><Sparkles size={16} /> 2 retos semanales</span>
              </div>
              <ProgressBar value={92} label="A 120 pts de ascender" suffix="92%" />
              <button className="button button--secondary" type="button" style={{ width: "fit-content" }}>Invitar miembros</button>
            </div>
            <div className="panel" style={{ margin: 0, background: "rgba(255,255,255,0.95)" }}>
              <div className="avatar avatar--lg" style={{ margin: "0 auto" }}>AS</div>
              <p style={{ textAlign: "center", marginTop: 12 }}>Axo Squad</p>
              <p className="subtle" style={{ textAlign: "center" }}>Zona de ascenso</p>
            </div>
          </div>
        </Panel>

        <Panel>
          <SectionHeader eyebrow="Miembros" title="Equipo actual" description="Roles y presencia semanal del grupo." />
          <div className="profile-grid">
            {Array.from({ length: 6 }).map((_, index) => (
              <article key={index} className="profile-card">
                <div className="inline-row" style={{ justifyContent: "space-between" }}>
                  <div className="inline-row">
                    <div className="avatar">{index + 1}</div>
                    <div>
                      <div className="item-title">Miembro {index + 1}</div>
                      <div className="subtle">Contribución alta</div>
                    </div>
                  </div>
                  <ArrowUpRight size={16} />
                </div>
              </article>
            ))}
          </div>
        </Panel>

        <Panel>
          <SectionHeader eyebrow="Comparativa" title="Rivales cercanos" description="A quién debes superar esta semana." />
          <div className="leaderboard-list">
            {leaderboardRows.slice(0, 3).map((row) => (
              <div key={row.name} className="leaderboard-row">
                <div className="rank">{row.rank}</div>
                <div className="avatar" style={{ width: 40, height: 40 }}>{row.rank}</div>
                <div>
                  <div className="team-name">{row.name}</div>
                  <div className="subtle">Objetivo: superar la barrera de ascenso</div>
                </div>
                <div className="score">{row.score}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="feature-row">
        {tribeStats.map((item) => (
          <article key={item.label} className="mini-card">
            <div className="mini-icon" aria-hidden="true"><Sparkles size={18} /></div>
            <h3>{item.label}</h3>
            <p>{item.value}</p>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
