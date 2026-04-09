"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Brain, Clock, Flame, Gamepad2, Sparkles, TimerReset, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { AppPointsBadge } from "@/components/app-points-badge";
import BottomNav from "@/components/BottomNav";
import { MobileHamburgerMenu } from "@/components/mobile-hamburger-menu";
import { Panel, SectionHeader } from "@/components/common";
import { FIGMA_ASSETS } from "@/lib/data";
import { TokaApi } from "@/services/toka-api.service";

type ChallengeCard = {
  id: string;
  title: string;
  description: string;
  points: number;
};

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

function extractChallenges(payload: unknown): ChallengeCard[] {
  const queue: unknown[] = [payload];
  const result: ChallengeCard[] = [];

  while (queue.length > 0) {
    const current = queue.shift();

    if (Array.isArray(current)) {
      for (const item of current) {
        const rec = toRecord(item);
        if (!rec) continue;

        const id = toText(rec.id) ?? toText(rec.challengeId) ?? null;
        const title = toText(rec.title) ?? toText(rec.name) ?? null;
        const description = toText(rec.description) ?? "Sin descripción";
        const points = toNumber(rec.points) ?? toNumber(rec.rewardPoints) ?? toNumber(rec.score) ?? 0;

        if (id && title) {
          result.push({ id, title, description, points });
        }
      }
      continue;
    }

    const rec = toRecord(current);
    if (!rec) continue;
    for (const value of Object.values(rec)) {
      if (value && typeof value === "object") queue.push(value);
    }
  }

  return result.filter((item, idx, arr) => arr.findIndex((x) => x.id === item.id) === idx);
}

export default function RetosPage() {
  const [tribeName, setTribeName] = useState("Sin tribe");
  const [challenges, setChallenges] = useState<ChallengeCard[]>([]);
  const [weeklyContribution, setWeeklyContribution] = useState(0);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    async function loadRetos() {
      setWarning(null);
      const [usersResult, challengesResult, sessionsResult] = await Promise.allSettled([
        TokaApi.usersMe(),
        TokaApi.challengesActive(),
        TokaApi.gameSessionsMe(),
      ]);

      if (usersResult.status === "fulfilled") {
        const usersData = toRecord(usersResult.value.data);
        const nextTribe = toText(usersData?.tribeName) ?? toText(toRecord(usersData?.tribe)?.name) ?? null;
        if (nextTribe) setTribeName(nextTribe);
      }

      if (challengesResult.status === "fulfilled") {
        const parsed = extractChallenges(challengesResult.value.data);
        setChallenges(parsed);
      }

      if (sessionsResult.status === "fulfilled") {
        const payload = sessionsResult.value.data;
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(toRecord(payload)?.sessions)
            ? (toRecord(payload)?.sessions as unknown[])
            : [];
        const total = list.reduce((acc, item) => acc + (toNumber(toRecord(item)?.score) ?? 0), 0);
        setWeeklyContribution(total);
      }

      const failed = [usersResult, challengesResult, sessionsResult].filter((result) => result.status === "rejected").length;
      if (failed > 0) {
        setWarning("Algunos bloques de retos no se pudieron sincronizar.");
      }
    }

    void loadRetos();
  }, []);

  const dailyChallenge = challenges[0] ?? null;
  const weeklyChallenges = useMemo(() => challenges.slice(1, 3), [challenges]);

  const desktopContent = (
    <div className="workspace__grid">
      <Panel>
        <SectionHeader
          eyebrow="Disponible ahora"
          title="Retos activos"
          description="Los retos mostrados vienen directamente del backend activo."
          action={<Link href="/retos/serpiente" className="badge">Snake Tribe</Link>}
        />
        {challenges.length === 0 ? <p className="subtle">No hay retos activos sincronizados.</p> : null}
        <div className="challenge-grid">
          {challenges.map((item) => (
            <article key={item.id} className="challenge-card">
              <div className="mini-icon">
                <Gamepad2 size={18} />
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <div className="inline-row" style={{ justifyContent: "space-between", marginTop: 18 }}>
                <strong>+{item.points.toLocaleString("es-ES")} pts</strong>
                <span><TimerReset size={16} /></span>
              </div>
            </article>
          ))}
        </div>
      </Panel>

      <div className="dashboard-side">
        <Panel className="muted-card">
          <span className="status-pill">Aporte semanal</span>
          <h3>{weeklyContribution.toLocaleString("es-ES")} pts</h3>
          <p>Este valor se calcula con tus sesiones registradas en backend.</p>
        </Panel>

        <Panel>
          <SectionHeader eyebrow="Power-ups" title="Mejoras de partida" description="Catálogo pendiente de endpoint dedicado." />
          <div className="stack stack--tight">
            <div className="reward-row"><div className="item-title">Sin datos sincronizados</div><div className="subtle">Esperando API de power-ups</div></div>
          </div>
        </Panel>
      </div>
    </div>
  );

  return (
    <>
      <div className="fig-desktop-only">
        <AppShell title="Retos" subtitle="Catálogo diario de juegos y progreso" headerBadge={<AppPointsBadge />}>
          {desktopContent}
        </AppShell>
      </div>

      <main className="fig-mobile-retos fig-responsive-page fig-mobile-only">
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
            <h1>¿Listo para jugar?</h1>
            <p>{tribeName} · {weeklyContribution.toLocaleString("es-ES")} pts</p>
            <span className="fig-retos-racha"><Flame size={14} /> Datos en vivo</span>
          </div>
          <img src="/images/ajolote_3.png" alt="Mascot" draggable="false" />
        </section>

        <section className="fig-retos-daily">
          <div className="fig-retos-section-head">
            <strong>RETO ACTIVO</strong>
            <span className="fig-retos-timer"><Clock size={13} /> Backend sincronizado</span>
          </div>
          <article className="fig-retos-daily-card">
            <div className="fig-retos-daily-card__top">
              <div>
                <h2>{dailyChallenge?.title ?? "Sin reto activo"}</h2>
                <p className="fig-retos-pts"><Zap size={14} /> +{(dailyChallenge?.points ?? 0).toLocaleString("es-ES")} pts</p>
              </div>
              <div className="fig-retos-quiz-icon"><Gamepad2 size={22} color="#2a55b9" /></div>
            </div>
            <div className="fig-retos-alert"><AlertTriangle size={13} /> {dailyChallenge?.description ?? "No se encontraron retos en backend."}</div>
            <Link href="/retos/serpiente" className="fig-retos-play">JUGAR SNAKE</Link>
          </article>
        </section>

        <section className="fig-retos-weekly">
          <div className="fig-retos-section-head">
            <strong>ESTA SEMANA</strong>
            <span>Retos sincronizados</span>
          </div>
          <div className="fig-retos-weekly-list">
            {weeklyChallenges.length === 0 ? <p className="subtle">Sin retos secundarios disponibles.</p> : null}
            {weeklyChallenges.map((challenge) => (
              <article key={challenge.id}>
                <div className="fig-retos-weekly-icon fig-retos-weekly-icon--teal">
                  <Brain size={18} />
                </div>
                <div className="fig-retos-weekly-info">
                  <h3>{challenge.title}</h3>
                  <p><span className="fig-retos-pts-inline">+{challenge.points.toLocaleString("es-ES")} pts</span></p>
                </div>
                <button type="button" className="fig-retos-btn fig-retos-btn--navy" disabled>
                  Pendiente
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="fig-retos-aportacion">
          <div className="fig-retos-aportacion__head">
            <h3>Tu aportación esta semana</h3>
            <TrendingUp size={18} color="#2a55b9" />
          </div>
          <div className="fig-retos-aportacion__labels">
            <span>{weeklyContribution.toLocaleString("es-ES")} pts</span>
            <span>Basado en sesiones enviadas</span>
          </div>
          <div className="fig-retos-progress">
            <div style={{ width: `${Math.min(100, Math.round(weeklyContribution / 10))}%` }} />
          </div>
          <div className="fig-retos-multiplier">
            <Sparkles size={14} color="#2a55b9" />
            <span>Multiplicadores dependen de tu tier en backend.</span>
          </div>
          {warning ? <p className="subtle">{warning}</p> : null}
        </section>

        <BottomNav active="retos" />
      </main>
    </>
  );
}
