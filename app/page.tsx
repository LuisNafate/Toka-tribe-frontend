import Link from "next/link";
import { Gamepad2, Home, Medal, Menu, Trophy, User, Users } from "lucide-react";
import { FIGMA_ASSETS } from "@/lib/data";

export default function LandingPage() {
  return (
    <>
      <main className="fig-home-desktop fig-desktop-only">
        <header className="fig-home-topbar">
          <div className="fig-home-brand">
            <span>✦</span>
            <strong>TokaTribe</strong>
          </div>
          <nav>
            <Link href="#">Cómo funciona</Link>
            <Link href="#">Temporada</Link>
            <Link href="#">Recompensas</Link>
          </nav>
          <div className="fig-home-topbar-actions">
            <Link href="/demo" className="fig-home-demo-btn">Ver demo</Link>
            <Link href="/dashboard">Entrar con Toka</Link>
          </div>
        </header>

        <section className="fig-home-hero-wrap">
          <div className="fig-home-hero-left">
            <span className="fig-home-kicker">MINI APP DENTRO DEL ECOSISTEMA TOKA</span>
            <h1>Bienvenido a tu Tribe</h1>
            <p>Compite en retos semanales, suma puntos con tu equipo y sube de división dentro de Toka.</p>
            <small>Accede con tu cuenta Toka. Sin registros extra.</small>

            <div className="fig-home-icon-row">
              <span><Gamepad2 size={16} /> Juega retos</span>
              <span><Users size={16} /> Compite en equipo</span>
              <span><Medal size={16} /> Gana recompensas</span>
            </div>

            <div className="fig-home-cta-row">
              <Link href="/dashboard" className="primary">Entrar con Toka</Link>
              <Link href="/onboarding" className="secondary">Conocer la dinámica</Link>
            </div>
          </div>

          <aside className="fig-home-hero-right">
            <p>ESTADO DE TU TRIBE</p>
            <h2>Axo Squad</h2>
            <div className="fig-home-rank-row">
              <div>
                <strong>#4</strong>
                <span>POSICIÓN SEMANAL</span>
              </div>
              <span className="fig-home-tier-chip">Plata</span>
            </div>
            <div className="fig-home-progress-copy">A 120 pts de ascender 92%</div>
            <div className="fig-mobile-progress-track"><div style={{ width: "92%" }} /></div>
            <div className="fig-home-score-row">
              <strong>1,480 pts</strong>
              <span>Meta: 1,600 pts</span>
            </div>
            <img src={FIGMA_ASSETS.landing.hero} alt="Mascot" draggable="false" />
          </aside>
        </section>

        <section className="fig-home-feature-cards">
          <article>
            <div><Users size={18} /></div>
            <h3>Tu Tribe importa</h3>
            <p>Colabora con otros usuarios para alcanzar objetivos comunes y desbloquear niveles.</p>
          </article>
          <article>
            <div><Gamepad2 size={18} /></div>
            <h3>Todo en una temporada</h3>
            <p>Cada tres meses reiniciamos el ranking con premios exclusivos para los líderes.</p>
          </article>
          <article>
            <div><Medal size={18} /></div>
            <h3>Recompensas dentro de Toka</h3>
            <p>Los puntos ganados son canjeables por beneficios reales en todo el ecosistema.</p>
          </article>
        </section>

        <footer className="fig-home-footer">
          <div>
            <span className="active" />
            <span />
            <span />
          </div>
          <p>© 2026 TokaTribe. Paso 1 de 3</p>
          <nav>
            <Link href="#">Privacidad</Link>
            <Link href="#">Términos</Link>
          </nav>
        </footer>
      </main>

      <main className="fig-mobile-home fig-mobile-only">
        <header className="fig-mobile-topbar">
          <div className="fig-mobile-topbar__left">
            <span className="fig-mobile-menu"><Menu size={20} /></span>
            <strong>TokaTribe</strong>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/demo" className="fig-mobile-enter-btn">Demo</Link>
            <Link href="/dashboard" className="fig-mobile-enter-btn">Entrar</Link>
          </div>
        </header>

        <section className="fig-mobile-hero">
          <img className="fig-mobile-hero-img" src={FIGMA_ASSETS.landing.hero} alt="Mascot" draggable="false" />
          <span className="fig-mobile-kicker">MINI APP DENTRO DEL ECOSISTEMA TOKA</span>
          <h1>Bienvenido a tu Tribe</h1>
          <div className="fig-mobile-hero-cta">
            <Link href="/dashboard" className="fig-pill-btn fig-pill-btn--primary">Entrar con Toka</Link>
            <Link href="/onboarding" className="fig-pill-btn fig-pill-btn--light">Conocer la dinámica</Link>
          </div>
        </section>

        <section className="fig-mobile-quick-actions">
          <article>
            <div className="fig-mobile-quick-icon"><Gamepad2 size={20} color="#2a55b9" /></div>
            <span>JUEGA RETOS</span>
          </article>
          <article>
            <div className="fig-mobile-quick-icon"><Users size={20} color="#2a55b9" /></div>
            <span>COMPITE EN EQUIPO</span>
          </article>
          <article>
            <div className="fig-mobile-quick-icon"><Trophy size={20} color="#2a55b9" /></div>
            <span>GANA RECOMPENSAS</span>
          </article>
        </section>

        <section className="fig-mobile-status-card">
          <div className="fig-mobile-status-top">
            <div>
              <p>ESTADO DE TU TRIBE</p>
              <h2>Axo Squad</h2>
            </div>
            <span>RANKING #4</span>
          </div>

          <div className="fig-mobile-status-main">
            <div className="fig-mobile-avatar-ring">
              <img src={FIGMA_ASSETS.dashboard.userPic} alt="Avatar" />
            </div>
            <div>
              <div className="fig-mobile-tier">Plata</div>
              <div className="fig-mobile-points">1,480 pts</div>
            </div>
            <img className="fig-mobile-status-mascot" src={FIGMA_ASSETS.landing.hero} alt="Mascot" draggable="false" />
          </div>

          <div className="fig-mobile-progress-labels">
            <span>A 120 pts de ascender</span>
            <strong>92%</strong>
          </div>
          <div className="fig-mobile-progress-track"><div style={{ width: "92%" }} /></div>
        </section>

        <section className="fig-mobile-ecosystem">
          <h3>Explora el Ecosistema</h3>
          <article>
            <div className="fig-mobile-eco-icon"><Users size={18} color="#2a55b9" /></div>
            <h4>Tu Tribe importa</h4>
            <p>Colabora con tu equipo para desbloquear niveles exclusivos y bonos semanales.</p>
          </article>
          <article>
            <div className="fig-mobile-eco-icon"><Gamepad2 size={18} color="#2a55b9" /></div>
            <h4>Todo en una temporada</h4>
            <p>Cada 30 días el tablero se reinicia. ¡Nuevos retos te esperan cada mes!</p>
          </article>
          <article>
            <div className="fig-mobile-eco-icon"><Medal size={18} color="#2a55b9" /></div>
            <h4>Recompensas dentro de Toka</h4>
            <p>Canjea tus puntos por beneficios reales en todo el ecosistema de aplicaciones.</p>
          </article>
        </section>

        <nav className="fig-mobile-bottom-nav">
          <Link href="/dashboard" className="active">
            <span className="fig-mobile-nav-icon"><Home size={20} /></span>
            <span>INICIO</span>
          </Link>
          <Link href="/tribe">
            <span className="fig-mobile-nav-icon"><Users size={20} /></span>
            <span>SQUAD</span>
          </Link>
          <Link href="/retos">
            <span className="fig-mobile-nav-icon"><Gamepad2 size={20} /></span>
            <span>RETOS</span>
          </Link>
          <Link href="/perfil">
            <span className="fig-mobile-nav-icon"><User size={20} /></span>
            <span>PERFIL</span>
          </Link>
        </nav>
      </main>
    </>
  );
}
