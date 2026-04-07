import { CalendarRange, TimerReset } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Panel, ProgressBar, SectionHeader } from "@/components/common";
import { seasonMilestones } from "@/lib/data";

export default function TemporadaPage() {
  return (
    <AppShell title="Temporada" subtitle="Estado del ciclo semanal, progreso y cierre">
      <div className="workspace__grid">
        <Panel>
          <SectionHeader eyebrow="Temporada activa" title="Semana 4" description="La liga se reinicia por ciclos, reforzando el compromiso de equipo." action={<span className="badge">Cierra en 2 días 14 h</span>} />
          <ProgressBar value={80} label="A 120 pts de ascender" suffix="80%" muted />
          <div className="timeline-card" style={{ marginTop: 18 }}>
            <div className="inline-row" style={{ justifyContent: "space-between" }}>
              <strong>Calendario semanal</strong>
              <CalendarRange size={16} />
            </div>
            <div className="chart-bars">
              {seasonMilestones.map((bar) => (
                <div key={bar.label} className={`chart-bar ${bar.active ? "chart-bar--active" : ""}`} style={{ height: `${bar.height}px` }} />
              ))}
            </div>
          </div>
        </Panel>

        <div className="dashboard-side">
          <Panel>
            <SectionHeader eyebrow="Hitos" title="Reglas de ascenso" description="Qué debe cumplir la Tribe para subir de división." />
            <div className="timeline">
              <div className="timeline-row"><div className="timeline-dot" /><div><strong>Completar retos</strong><p>Sumar puntos diarios.</p></div><span className="subtle">1</span></div>
              <div className="timeline-row"><div className="timeline-dot" /><div><strong>Sostener la racha</strong><p>Evitar perder el ritmo semanal.</p></div><span className="subtle">2</span></div>
              <div className="timeline-row"><div className="timeline-dot" /><div><strong>Superar rivales</strong><p>Escalar sobre la línea de ascenso.</p></div><span className="subtle">3</span></div>
            </div>
          </Panel>

          <Panel className="muted-card">
            <span className="status-pill">Actualización en vivo</span>
            <h3>Leaderboard sincronizado</h3>
            <p>El avance se recalcula con cada reto y con cada resultado confirmado.</p>
          </Panel>

          <Panel>
            <SectionHeader eyebrow="Tiempo" title="Recordatorio de cierre" description="El día de corte es el punto de mayor tensión competitiva." />
            <div className="inline-row" style={{ gap: 8, color: "#5d89e4", fontWeight: 800 }}><TimerReset size={16} /> Quedan 2 días 14 h</div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
