import { AlertTriangle, Brain, Clock, Flame, Gamepad2, Menu, Sparkles, TimerReset, TrendingUp, Trophy, Zap } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { AppPointsBadge } from "@/components/app-points-badge";
import BottomNav from "@/components/BottomNav";
import { MobileHamburgerMenu } from "@/components/mobile-hamburger-menu";
import { Panel, SectionHeader } from "@/components/common";
import { challengeCards, FIGMA_ASSETS } from "@/lib/data";

export default function RetosPage() {
  const desktopContent = (
    <div className="workspace__grid">
      <Panel>
        <SectionHeader
          eyebrow="Disponible ahora"
          title="Retos de hoy"
          description="Las acciones correctas suben el score de la Tribe al instante. Snake Tribe suma puntos a tu progreso con cada manzana."
          action={<Link href="/retos/serpiente" className="badge">Snake Tribe</Link>}
        />
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
        <AppShell title="Retos" subtitle="Catálogo diario de juegos, bonificaciones y power-ups" headerBadge={<AppPointsBadge />}>
          {desktopContent}
        </AppShell>
      </div>

      <main className="fig-mobile-retos fig-mobile-only">

        {/* Header */}
        <header className="fig-mobile-topbar fig-retos-topbar">
          <div className="fig-mobile-topbar__left">
            <MobileHamburgerMenu />
            <strong className="fig-retos-brand">TokaTribe</strong>
          </div>
          <div className="fig-retos-avatar">
            <img src={FIGMA_ASSETS.landing.hero} alt="Avatar" />
          </div>
        </header>

        {/* Hero */}
        <section className="fig-retos-hero">
          <div className="fig-retos-hero__content">
            <h1>¿Listo para jugar?</h1>
            <p>Axo Squad · 2,140 pts</p>
            <span className="fig-retos-racha"><Flame size={14} /> Racha: 3 días</span>
          </div>
          <img src="/images/ajolote_3.png" alt="Mascot" draggable="false" />
        </section>

        {/* Reto diario */}
        <section className="fig-retos-daily">
          <div className="fig-retos-section-head">
            <strong>RETO DIARIO</strong>
            <span className="fig-retos-timer"><Clock size={13} /> Cierra en 4h 32m</span>
          </div>
          <article className="fig-retos-daily-card">
            <div className="fig-retos-daily-card__top">
              <div>
                <h2>Snake Tribe</h2>
                <p className="fig-retos-pts"><Zap size={14} /> +15 pts por manzana</p>
              </div>
              <div className="fig-retos-quiz-icon"><Gamepad2 size={22} color="#2a55b9" /></div>
            </div>
            <div className="fig-retos-alert"><AlertTriangle size={13} /> Cada captura suma puntos a la app y a tu progreso semanal.</div>
            <Link href="/retos/serpiente" className="fig-retos-play">JUGAR AHORA</Link>
          </article>
        </section>

        {/* Esta semana */}
        <section className="fig-retos-weekly">
          <div className="fig-retos-section-head">
            <strong>ESTA SEMANA</strong>
            <span>Cierra en 2 días 14h</span>
          </div>
          <div className="fig-retos-weekly-list">
            <article>
              <div className="fig-retos-weekly-icon fig-retos-weekly-icon--teal">
                <Brain size={18} />
              </div>
              <div className="fig-retos-weekly-info">
                <h3>Toka Trivia</h3>
                <p><span className="fig-retos-pts-inline">+40 pts</span> <span className="fig-retos-available">● DISPONIBLE</span></p>
              </div>
              <Link href="/retos/trivia/1" className="fig-retos-btn fig-retos-btn--navy">Jugar</Link>
            </article>
            <article>
              <div className="fig-retos-weekly-icon fig-retos-weekly-icon--purple">
                <Zap size={18} />
              </div>
              <div className="fig-retos-weekly-info">
                <h3>Reflejos Tribe</h3>
                <p><span className="fig-retos-pts-inline">+25 pts</span></p>
                <p className="fig-retos-playing"><span className="fig-retos-dot" />2 jugando ahora</p>
              </div>
              <button type="button" className="fig-retos-btn fig-retos-btn--yellow">Unirse</button>
            </article>
          </div>
        </section>

        {/* Aportación semanal */}
        <section className="fig-retos-aportacion">
          <div className="fig-retos-aportacion__head">
            <h3>Tu aportación esta semana</h3>
            <TrendingUp size={18} color="#2a55b9" />
          </div>
          <div className="fig-retos-aportacion__labels">
            <span>480 pts</span>
            <span>1,000 pts meta</span>
          </div>
          <div className="fig-retos-progress">
            <div style={{ width: "48%" }} />
          </div>
          <div className="fig-retos-multiplier">
            <Sparkles size={14} color="#2a55b9" />
            <span>Multiplicador 1.3x activo · se aplica a tu próximo reto</span>
          </div>
        </section>

        {/* Tribe en la división */}
        <section className="fig-retos-division">
          <div className="fig-retos-division__head">
            <h3>Tu Tribe en la división</h3>
            <Trophy size={18} color="#2a55b9" />
          </div>
          <div className="fig-retos-division__list">
            <div className="fig-retos-division__row">
              <span className="fig-retos-rank">1.</span>
              <span className="fig-retos-team">Los Titanes</span>
              <span className="fig-retos-score">2,450 pts</span>
            </div>
            <div className="fig-retos-division__row fig-retos-division__row--highlight">
              <span className="fig-retos-rank">2.</span>
              <span className="fig-retos-team">Axo Squad</span>
              <div className="fig-retos-score-group">
                <span className="fig-retos-score">2,140 pts</span>
                <span className="fig-retos-you">TU EQUIPO</span>
              </div>
            </div>
            <div className="fig-retos-division__row">
              <span className="fig-retos-rank">3.</span>
              <span className="fig-retos-team">Cyber Runners</span>
              <span className="fig-retos-score">1,980 pts</span>
            </div>
          </div>
          <Link href="/leaderboard" className="fig-retos-division__link">Ver tabla completa →</Link>
        </section>

        <BottomNav active="retos" />
      </main>
    </>
  );
}
