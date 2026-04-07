import { TimerReset, Zap } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Panel, SectionHeader } from "@/components/common";
import { challengeCards } from "@/lib/data";

export default function RetosPage() {
  return (
    <AppShell title="Retos" subtitle="Catálogo diario de juegos, bonificaciones y power-ups">
      <div className="workspace__grid">
        <Panel>
          <SectionHeader eyebrow="Disponible ahora" title="Retos de hoy" description="Las acciones correctas suben el score de la Tribe al instante." action={<span className="badge">2 disponibles</span>} />
          <div className="challenge-grid">
            {challengeCards.map((item) => (
              <article key={item.title} className={`challenge-card ${item.dark ? "challenge-card--dark" : ""}`}>
                <div className="mini-icon" style={{ background: item.dark ? "rgba(255,255,255,0.1)" : undefined }}>
                  <item.icon size={18} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <div className="inline-row" style={{ justifyContent: "space-between", marginTop: 18 }}>
                  <strong>{item.points}</strong>
                  <span>{item.dark ? <Zap size={16} /> : <TimerReset size={16} />}</span>
                </div>
              </article>
            ))}
          </div>
        </Panel>

        <div className="dashboard-side">
          <Panel className="muted-card">
            <span className="status-pill">Bonus semanal</span>
            <h3>Completa 2 retos más</h3>
            <p>El bonus semanal se desbloquea con participación sostenida de la Tribe.</p>
          </Panel>

          <Panel>
            <SectionHeader eyebrow="Power-ups" title="Mejoras de partida" description="Aumentan puntos, tiempo o multiplicadores." />
            <div className="stack stack--tight">
              <div className="reward-row"><div className="item-title">Duplicador x2</div><div className="subtle">250 Toka</div></div>
              <div className="reward-row"><div className="item-title">Vida extra</div><div className="subtle">120 Toka</div></div>
              <div className="reward-row"><div className="item-title">Acceso premium</div><div className="subtle">400 Toka</div></div>
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
