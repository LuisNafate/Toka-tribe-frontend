import { Flame, Sparkles, TimerReset, Zap } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Panel, SectionHeader } from "@/components/common";
import { challengeCards, dailyChallenge, FIGMA_ASSETS, weeklyChallenges } from "@/lib/data";

export default function RetosPage() {
  const desktopContent = (
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
  );

  return (
    <>
      <div className="fig-desktop-only">
        <AppShell title="Retos" subtitle="Catálogo diario de juegos, bonificaciones y power-ups">
          {desktopContent}
        </AppShell>
      </div>

      <main className="fig-mobile-retos fig-mobile-only">
        <header className="fig-mobile-topbar fig-retos-topbar">
          <div className="fig-mobile-topbar__left">
            <span className="fig-mobile-menu" aria-hidden="true">
              <Sparkles size={14} />
            </span>
            <strong>TokaTribe</strong>
          </div>
          <img src={FIGMA_ASSETS.dashboard.userPic} alt="Avatar" />
        </header>

        <section className="fig-retos-hero">
          <div>
            <h1>¿Listo para jugar?</h1>
            <p>Axo Squad · 2,140 pts</p>
            <span className="inline-row" style={{ gap: 6 }}><Flame size={14} />Racha: 3 días</span>
          </div>
          <img src={FIGMA_ASSETS.landing.hero} alt="Mascot" draggable="false" />
        </section>

        <section className="fig-retos-daily">
          <div className="fig-retos-section-head">
            <strong>RETO DIARIO</strong>
            <span>Cierra en 4h 32m</span>
          </div>

          <article className="fig-retos-daily-card">
            <h2>{dailyChallenge.title}</h2>
            <p>{dailyChallenge.points}</p>
            <div className="fig-retos-alert">¡Juega hoy para no perder tu racha!</div>
            <Link href="/retos" className="fig-retos-play">Jugar ahora</Link>
          </article>
        </section>

        <section className="fig-retos-weekly">
          <div className="fig-retos-section-head">
            <strong>ESTA SEMANA</strong>
            <span>Cierra en 2 días 14h</span>
          </div>

          <div className="fig-retos-weekly-list">
            {weeklyChallenges.map((challenge) => (
              <article key={challenge.title}>
                <div>
                  <h3>{challenge.title}</h3>
                  <p>{challenge.points} · Disponible</p>
                </div>
                <button type="button">Jugar</button>
              </article>
            ))}
          </div>
        </section>

        <nav className="fig-mobile-bottom-nav">
          <Link href="/dashboard">INICIO</Link>
          <Link href="/tribe">SQUAD</Link>
          <Link href="/retos" className="active">RETOS</Link>
          <Link href="/perfil">PERFIL</Link>
        </nav>
      </main>
    </>
  );
}
