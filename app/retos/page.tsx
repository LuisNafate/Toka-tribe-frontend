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
  href: string;
  source: "backend" | "frontend";
};

const FRONTEND_TRIVIA_CHALLENGE: ChallengeCard = {
  id: "frontend-trivia",
  title: "Trivia Toka",
  description: "Preguntas locales cargadas desde el frontend.",
  points: 120,
  href: "/retos/trivia/clasico",
  source: "frontend",
};

const FRONTEND_SNAKE_CHALLENGE: ChallengeCard = {
  id: "frontend-snake",
  title: "Snake Tribe",
  description: "Arcade local para pruebas rápidas de score.",
  points: 150,
  href: "/retos/serpiente",
  source: "frontend",
};

const FIXED_FRONTEND_CHALLENGES: ChallengeCard[] = [FRONTEND_TRIVIA_CHALLENGE, FRONTEND_SNAKE_CHALLENGE];

function resolveChallengeHref(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();
  if (text.includes("trivia")) return "/retos/trivia/clasico";
  if (text.includes("snake") || text.includes("serpiente")) return "/retos/serpiente";
  return "/retos";
}

function withFixedFrontendChallenges(challenges: ChallengeCard[]): ChallengeCard[] {
  const byHref = new Map<string, ChallengeCard>();

  for (const item of FIXED_FRONTEND_CHALLENGES) {
    byHref.set(item.href, item);
  }

  for (const item of challenges) {
    byHref.set(item.href, item);
  }

  const trivia = byHref.get("/retos/trivia/clasico");
  const snake = byHref.get("/retos/serpiente");
  const rest = Array.from(byHref.values()).filter((item) => item.href !== "/retos/trivia/clasico" && item.href !== "/retos/serpiente");

  const ordered: ChallengeCard[] = [];
  if (trivia) ordered.push(trivia);
  if (snake) ordered.push(snake);
  ordered.push(...rest);

  return ordered;
}

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
          result.push({
            id,
            title,
            description,
            points,
            href: resolveChallengeHref(title, description),
            source: "backend",
          });
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
  const [tribeName, setTribeName] = useState("Tribe no sincronizada");
  const [challenges, setChallenges] = useState<ChallengeCard[]>(FIXED_FRONTEND_CHALLENGES);
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

        // Sync tier + division to localStorage so Trivia can apply the correct score multiplier.
        const tierRaw =
          toText(usersData?.tier) ??
          toText(toRecord(usersData?.tribe)?.tier) ??
          toText(toRecord(usersData?.tribe)?.division) ??
          null;
        if (tierRaw) {
          const tier = tierRaw.toLowerCase();
          const division =
            tier.includes("oro") ? "oro" :
              tier.includes("plat") ? "plata" :
                "bronce";
          try {
            localStorage.setItem("toka_active_tier", division);
            localStorage.setItem("toka_division", division);
          } catch { /* ignore */ }
        }
      }

      if (challengesResult.status === "fulfilled") {
        const parsed = extractChallenges(challengesResult.value.data);
        setChallenges(withFixedFrontendChallenges(parsed));
      } else {
        setChallenges(FIXED_FRONTEND_CHALLENGES);
      }

      if (sessionsResult.status === "fulfilled") {
        const payload = sessionsResult.value.data;
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(toRecord(payload)?.sessions)
            ? (toRecord(payload)?.sessions as unknown[])
            : [];
        const total = list.reduce<number>((acc, item) => acc + (toNumber(toRecord(item)?.score) ?? 0), 0);
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
          description="Incluye retos backend y pruebas locales (Trivia + Snake)."
          action={<Link href="/retos/trivia/clasico" className="badge">Trivia Toka</Link>}
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
                <Link href={item.href} className="badge">Jugar</Link>
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
            <div className="reward-row"><div className="item-title">Sin endpoint de power-ups</div><div className="subtle">Backend aun no publica este catálogo</div></div>
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
            <Link href={dailyChallenge?.href ?? "/retos/trivia/clasico"} className="fig-retos-play">
              {dailyChallenge?.href?.includes("trivia") ? "JUGAR TRIVIA" : dailyChallenge?.href?.includes("serpiente") ? "JUGAR SNAKE" : "JUGAR RETO"}
            </Link>
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
                <Link href={challenge.href} className="fig-retos-btn fig-retos-btn--navy">
                  Jugar
                </Link>
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
