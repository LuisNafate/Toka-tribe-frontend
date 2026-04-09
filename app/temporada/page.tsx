"use client";

import { useEffect, useState } from "react";
import { CalendarRange, TimerReset, Flame } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Panel, ProgressBar, SectionHeader } from "@/components/common";
import { MobileHamburgerMenu } from "@/components/mobile-hamburger-menu";
import BottomNav from "@/components/BottomNav";
import { TokaApi } from "@/services/toka-api.service";

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function toText(value: unknown): string | null {
  if (typeof value === "string" && value.trim() !== "") return value.trim();
  return null;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, ""));
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export default function TemporadaPage() {
  const [seasonTitle, setSeasonTitle] = useState("Temporada no sincronizada");
  const [seasonStatus, setSeasonStatus] = useState("Sin respuesta de estado desde backend");
  const [progressPct, setProgressPct] = useState(0);
  const [remainingLabel, setRemainingLabel] = useState("Tiempo no sincronizado");
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    async function loadSeason() {
      setWarning(null);
      const [seasonResult, leaderboardResult] = await Promise.allSettled([
        TokaApi.seasonsCurrent(),
        TokaApi.leaderboardCurrent(),
      ]);

      if (seasonResult.status === "fulfilled") {
        const season = toRecord(seasonResult.value.data);
        const title = toText(season?.name) ?? toText(season?.title);
        const status = toText(season?.status) ?? toText(season?.description) ?? toText(season?.endsAt);
        const target = toNumber(season?.targetPoints) ?? toNumber(season?.goalPoints) ?? toNumber(season?.maxPoints) ?? 0;
        const current = toNumber(season?.currentPoints) ?? toNumber(season?.points) ?? 0;

        if (title) setSeasonTitle(title);
        if (status) setSeasonStatus(status);
        if (target > 0) {
          setProgressPct(Math.min(100, Math.max(0, Math.round((current / target) * 100))));
        }
      }

      if (leaderboardResult.status === "fulfilled") {
        const lb = toRecord(leaderboardResult.value.data);
        const remaining = toText(lb?.remainingTime) ?? toText(lb?.endsAt) ?? null;
        if (remaining) setRemainingLabel(remaining);
      }

      if (seasonResult.status === "rejected" || leaderboardResult.status === "rejected") {
        setWarning("No se pudieron sincronizar todos los datos de temporada.");
      }
    }

    void loadSeason();
  }, []);

  return (
    <>
      <div className="fig-desktop-only">
        <AppShell title="Temporada" subtitle="Estado del ciclo semanal, progreso y cierre">
          <div className="workspace__grid">
            <Panel>
              <SectionHeader eyebrow="Temporada activa" title={seasonTitle} description="Datos sincronizados desde backend." action={<span className="badge">{remainingLabel}</span>} />
              <ProgressBar value={progressPct} label="Progreso de temporada" suffix={`${progressPct}%`} muted />
              <div className="timeline-card" style={{ marginTop: 18 }}>
                <div className="inline-row" style={{ justifyContent: "space-between" }}>
                  <strong>Estado</strong>
                  <CalendarRange size={16} />
                </div>
                <p className="subtle" style={{ marginTop: 10 }}>{seasonStatus}</p>
              </div>
            </Panel>

            <div className="dashboard-side">
              <Panel>
                <SectionHeader eyebrow="Hitos" title="Reglas de ascenso" description="Reglas y objetivos definidos por backend." />
                <div className="timeline">
                  <div className="timeline-row"><div className="timeline-dot" /><div><strong>Completar retos</strong><p>Sumar puntos diarios.</p></div><span className="subtle">1</span></div>
                  <div className="timeline-row"><div className="timeline-dot" /><div><strong>Sostener la racha</strong><p>Evitar perder el ritmo semanal.</p></div><span className="subtle">2</span></div>
                  <div className="timeline-row"><div className="timeline-dot" /><div><strong>Superar rivales</strong><p>Escalar sobre la línea de ascenso.</p></div><span className="subtle">3</span></div>
                </div>
              </Panel>

              <Panel className="muted-card">
                <span className="status-pill">Actualización en vivo</span>
                <h3>Leaderboard sincronizado</h3>
                <p>El avance se recalcula con cada reto y resultado confirmado.</p>
              </Panel>

              <Panel>
                <SectionHeader eyebrow="Tiempo" title="Recordatorio de cierre" description="Este valor proviene del backend." />
                <div className="inline-row" style={{ gap: 8, color: "#5d89e4", fontWeight: 800 }}><TimerReset size={16} /> {remainingLabel}</div>
              </Panel>
            </div>
          </div>
          {warning ? <p className="subtle">{warning}</p> : null}
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
            <h2>{seasonTitle}</h2>
            <p>Cierre: <strong>{remainingLabel}</strong></p>
          </div>
        </section>

        <div className="fig-temporada-main">
          <article className="fig-unified-card">
            <div className="fig-unified-head">
              <strong>Progreso</strong>
              <CalendarRange size={16} />
            </div>
            <h3>Progreso de temporada</h3>
            <div style={{ marginTop: 16 }}>
              <div style={{ width: "100%", height: 8, backgroundColor: "#e9ecf1", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ width: `${progressPct}%`, height: "100%", backgroundColor: "#5d89e4", transition: "width 0.3s" }} />
              </div>
              <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", fontSize: 12, color: "#666" }}>
                <span>0%</span>
                <strong style={{ color: "#2a55b9" }}>{progressPct}%</strong>
              </div>
            </div>
          </article>

          <article className="fig-unified-card fig-unified-card--dark">
            <div className="fig-unified-head">
              <strong>Estado</strong>
              <TimerReset size={16} style={{ color: "#5ef6e6" }} />
            </div>
            <h3 style={{ marginTop: 8 }}>Estado backend</h3>
            <p className="fig-small-text" style={{ color: "rgba(255,255,255,0.7)" }}>{seasonStatus}</p>
          </article>

          <article className="fig-unified-card fig-unified-card--soft">
            <div className="fig-unified-head">
              <strong>Sincronización</strong>
              <TimerReset size={16} style={{ color: "#5d89e4" }} />
            </div>
            <h3>Leaderboard en vivo</h3>
            <p className="fig-small-text">El avance se recalcula con cada reto completado y resultado confirmado.</p>
            {warning ? <p className="subtle" style={{ marginTop: 10 }}>{warning}</p> : null}
          </article>
        </div>

        <BottomNav active="retos" />
      </main>
    </>
  );
}
