import { ArrowRight, CircleCheckBig, Clock3 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Panel, ProgressBar, SectionHeader } from "@/components/common";
import {
  dailyChallenge,
  FIGMA_ASSETS,
} from "@/lib/data";

const recentActivity = [
  {
    title: "Racha activa",
    description: "3 días consecutivos",
    points: "+20 pts",
    icon: CircleCheckBig,
  },
  {
    title: "Trivia Express",
    description: "Completado hace 2 h",
    points: "+60 pts",
    icon: Clock3,
  },
  {
    title: "Reflejos Tribe",
    description: "Disponible para hoy",
    points: "+55 pts",
    icon: Clock3,
  },
];

export default function DashboardPage() {
  return (
    <AppShell title="Home" subtitle="Retos de hoy y actividad reciente" headerBadge={<div className="balance-pill">1,480 pts</div>}>
      <div className="workspace__grid fig-dashboard-main-grid">
        <Panel>
          <SectionHeader eyebrow="Reto de hoy" title={dailyChallenge.title} description={dailyChallenge.description} />
          <article className="challenge-card" style={{ border: "1px solid rgba(74, 119, 227, 0.12)", background: "linear-gradient(180deg, #f8fbff 0%, #edf3ff 100%)" }}>
            <div className="inline-row" style={{ justifyContent: "space-between", marginBottom: 10 }}>
              <span className="status-pill">{dailyChallenge.status}</span>
              <span className="reward-pill"><Clock3 size={14} /> {dailyChallenge.countdown}</span>
            </div>
            <div className="inline-row" style={{ justifyContent: "space-between", alignItems: "center", gap: 16 }}>
              <div>
                <h3 style={{ margin: 0, color: "#0b1f36" }}>Mantén tu racha activa</h3>
                <p style={{ margin: "8px 0 0", color: "#3557a8", fontWeight: 700 }}>{dailyChallenge.closesAt}</p>
              </div>
              <img src={FIGMA_ASSETS.landing.hero} alt="Mascot" draggable="false" style={{ width: 84, height: 84, objectFit: "cover", borderRadius: 18 }} />
            </div>
            <div className="inline-row" style={{ justifyContent: "space-between", marginTop: 16 }}>
              <strong>{dailyChallenge.points}</strong>
              <a className="button button--secondary" href="/retos">Jugar ahora <ArrowRight size={16} /></a>
            </div>
            <p className="subtle" style={{ marginTop: 10 }}>Si no lo completas hoy, la racha se rompe.</p>
          </article>
        </Panel>

        <Panel>
          <SectionHeader eyebrow="Actividad reciente" title="Tu actividad" description="Lo último que pasó en tu Tribe" />
          <div className="stack stack--tight">
            {recentActivity.map((item) => (
              <div key={item.title} className="activity-row">
                <div className="mini-icon" aria-hidden="true"><item.icon size={16} /></div>
                <div>
                  <div className="item-title">{item.title}</div>
                  <div className="subtle">{item.description}</div>
                </div>
                <div className="score">{item.points}</div>
              </div>
            ))}
          </div>
          <div className="panel" style={{ marginTop: 16, padding: 16, background: "#4a77e3", color: "#fff" }}>
            La actividad reciente resume tu progreso y lo que está por vencer.
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
