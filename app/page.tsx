import Link from "next/link";
import { Gamepad2, Medal, Menu, Trophy, Users } from "lucide-react";
import { FIGMA_ASSETS } from "@/lib/data";
import { TokaLoginButton } from "@/components/toka-login-button";

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
            <TokaLoginButton>Entrar con Toka</TokaLoginButton>
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
              <TokaLoginButton className="primary" showDiagnostics>Entrar con Toka</TokaLoginButton>
              <Link href="/onboarding" className="secondary">Conocer la dinámica</Link>
            </div>
          </div>

          <aside className="fig-home-hero-right">
            <p>ESTADO DE TU TRIBE</p>
            <h2>Sincroniza tu sesión</h2>
            <div className="fig-home-rank-row">
              <div>
                <strong>Inicia sesión</strong>
                <span>RANKING DISPONIBLE CON DATOS BACKEND</span>
              </div>
              <span className="fig-home-tier-chip">Estado backend</span>
            </div>
            <div className="fig-home-progress-copy">Este panel se completa al autenticar la cuenta en Toka.</div>
            <div className="fig-mobile-progress-track"><div style={{ width: "0%" }} /></div>
            <div className="fig-home-score-row">
              <strong>Sincronización requerida</strong>
              <span>Meta visible con respuesta de temporada</span>
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
            <TokaLoginButton className="fig-mobile-enter-btn">Entrar</TokaLoginButton>
          </div>
        </header>

        <section className="fig-mobile-hero">
          <img className="fig-mobile-hero-img" src={FIGMA_ASSETS.landing.hero} alt="Mascot" draggable="false" />
          <span className="fig-mobile-kicker">MINI APP DENTRO DEL ECOSISTEMA TOKA</span>
          <h1>Bienvenido a tu Tribe</h1>
          <div className="fig-mobile-hero-cta">
            <TokaLoginButton className="fig-pill-btn fig-pill-btn--primary" showDiagnostics>Entrar con Toka</TokaLoginButton>
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
              <h2>Sincroniza tu sesión</h2>
            </div>
            <span>RANKING BACKEND</span>
          </div>

          <div className="fig-mobile-status-main">
            <div className="fig-mobile-avatar-ring">
              <img src={FIGMA_ASSETS.dashboard.userPic} alt="Avatar" />
            </div>
            <div>
              <div className="fig-mobile-tier">Estado backend</div>
              <div className="fig-mobile-points">Sincronización requerida</div>
            </div>
            <img className="fig-mobile-status-mascot" src="/images/ajolote_2.png" alt="Mascot" draggable="false" />
          </div>

          <div className="fig-mobile-progress-labels">
            <span>Progreso disponible al iniciar sesión</span>
            <strong>--</strong>
          </div>
          <div className="fig-mobile-progress-track"><div style={{ width: "0%" }} /></div>
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

      </main>
    </>
  );
}
