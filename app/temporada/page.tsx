import { CalendarRange, TimerReset, Flame } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Panel, ProgressBar, SectionHeader } from "@/components/common";
import { MobileHamburgerMenu } from "@/components/mobile-hamburger-menu";
import BottomNav from "@/components/BottomNav";
import { seasonMilestones } from "@/lib/data";

export default function TemporadaPage() {
  return (
    <>
      <div className="fig-desktop-only">
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
      </div>

      <main className="fig-mobile-temporada fig-responsive-page fig-mobile-only">
        <header className="fig-mobile-topbar fig-temporada-topbar">
          <div className="fig-mobile-topbar__left">
            <MobileHamburgerMenu />
            <strong className="fig-temporada-brand">Temporada</strong>
          </div>
          <div style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Flame size={20} style={{ color: "#5ef6e6" }} />
          </div>
        </header>

        <section className="fig-temporada-hero">
          <div className="fig-temporada-hero__badge">
            <h2>Semana 4</h2>
            <p>Cierra en <strong>2 días 14 h</strong></p>
          </div>
        </section>

        <div className="fig-temporada-main">
          <article className="fig-unified-card">
            <div className="fig-unified-head">
              <strong>Progreso</strong>
              <CalendarRange size={16} />
            </div>
            <h3>A 120 pts de ascender</h3>
            <div style={{ marginTop: 16 }}>
              <div style={{ width: "100%", height: 8, backgroundColor: "#e9ecf1", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ width: "80%", height: "100%", backgroundColor: "#5d89e4", transition: "width 0.3s" }} />
              </div>
              <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", fontSize: 12, color: "#666" }}>
                <span>0 pts</span>
                <strong style={{ color: "#2a55b9" }}>80%</strong>
              </div>
            </div>
          </article>

          <article className="fig-unified-card fig-unified-card--dark">
            <div className="fig-unified-head">
              <strong>Hitos</strong>
              <TimerReset size={16} style={{ color: "#5ef6e6" }} />
            </div>
            <h3 style={{ marginTop: 8 }}>Reglas de ascenso</h3>
            <div style={{ marginTop: 16 }}>
              <div className="fig-timeline-row">
                <div className="fig-timeline-dot" />
                <div>
                  <h4 style={{ margin: "0 0 2px", fontSize: 13 }}>Completar retos</h4>
                  <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.7)" }}>Sumar puntos diarios</p>
                </div>
              </div>
              <div className="fig-timeline-row" style={{ marginTop: 12 }}>
                <div className="fig-timeline-dot" />
                <div>
                  <h4 style={{ margin: "0 0 2px", fontSize: 13 }}>Sostener la racha</h4>
                  <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.7)" }}>Evitar perder el ritmo</p>
                </div>
              </div>
              <div className="fig-timeline-row" style={{ marginTop: 12 }}>
                <div className="fig-timeline-dot" />
                <div>
                  <h4 style={{ margin: "0 0 2px", fontSize: 13 }}>Superar rivales</h4>
                  <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.7)" }}>Escalar en división</p>
                </div>
              </div>
            </div>
          </article>

          <article className="fig-unified-card">
            <div className="fig-unified-head">
              <strong>Calendario</strong>
              <CalendarRange size={16} />
            </div>
            <div style={{ marginTop: 16, display: "flex", justifyContent: "center", gap: 6, height: 60 }}>
              {seasonMilestones.map((bar) => (
                <div
                  key={bar.label}
                  className={`fig-chart-bar ${bar.active ? "fig-chart-bar--active" : ""}`}
                  style={{
                    flex: 1,
                    height: `${bar.height}px`,
                    backgroundColor: bar.active ? "#5d89e4" : "#e9ecf1",
                    borderRadius: 4,
                    cursor: "pointer",
                    transition: "background-color 0.2s"
                  }}
                />
              ))}
            </div>
          </article>

          <article className="fig-unified-card fig-unified-card--soft">
            <div className="fig-unified-head">
              <strong>Sincronización</strong>
              <TimerReset size={16} style={{ color: "#5d89e4" }} />
            </div>
            <h3>Leaderboard en vivo</h3>
            <p className="fig-small-text">El avance se recalcula con cada reto completado y resultado confirmado.</p>
            <div style={{ marginTop: 12 }}>
              <span className="fig-status-pill">Actualización en vivo</span>
            </div>
          </article>
        </div>

        <BottomNav active="retos" />
      </main>
    </>
  );
}
