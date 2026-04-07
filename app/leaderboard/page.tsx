import { Target } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Panel, SectionHeader } from "@/components/common";
import { leaderboardRows } from "@/lib/data";

export default function LeaderboardPage() {
  return (
    <AppShell title="Leaderboard" subtitle="Ranking por división y temporada">
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
  );
}
