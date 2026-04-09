import Link from "next/link";
import { FIGMA_ASSETS } from "@/lib/data";
import { AppShell } from "@/components/app-shell";
import BottomNav from "@/components/BottomNav";
import { MobileHamburgerMenu } from "@/components/mobile-hamburger-menu";
import { TokaLoginButton } from "@/components/toka-login-button";

function OnboardingContent() {
  return (
    <>
      <div className="fig-home-responsive-grid">
        <section className="fig-mobile-hero">
          <img className="fig-mobile-hero-img" src={FIGMA_ASSETS.landing.hero} alt="Axo mascot" draggable="false" />
          <span className="fig-mobile-kicker">MINI APP DENTRO DEL ECOSISTEMA TOKA</span>
          <h1>Bienvenido a tu Tribe</h1>
          <div className="fig-mobile-hero-cta">
            <TokaLoginButton className="fig-pill-btn fig-pill-btn--primary">
              Entrar con Toka
            </TokaLoginButton>
            <Link href="/" className="fig-pill-btn fig-pill-btn--light">
              Conocer la dinámica
            </Link>
          </div>
        </section>

        <section className="fig-mobile-status-card fig-mobile-status-card--desktop-sticky">
          <div className="fig-mobile-status-top">
            <div>
              <p>ESTADO DE TU TRIBE</p>
              <h2>Sincroniza tu sesión</h2>
            </div>
            <span>RANKING EN VIVO</span>
          </div>
          <div className="fig-mobile-status-main">
            <div className="fig-mobile-avatar-ring">
              <img src={FIGMA_ASSETS.dashboard.userPic} alt="Avatar" />
            </div>
            <div>
              <div className="fig-mobile-tier">Estado sincronizado</div>
              <div className="fig-mobile-points">Sincronización requerida</div>
            </div>
            <img className="fig-mobile-status-mascot" src={FIGMA_ASSETS.landing.hero} alt="Mascot" draggable="false" />
          </div>
          <div className="fig-mobile-progress-labels">
            <span>Progreso disponible al iniciar sesión</span>
            <strong>--</strong>
          </div>
          <div className="fig-mobile-progress-track">
            <div style={{ width: "0%" }} />
          </div>
        </section>
      </div>

      <div className="fig-home-responsive-lower">
        <section className="fig-mobile-quick-actions fig-home-responsive-actions">
          <article>
            <img src={FIGMA_ASSETS.landing.playIcon} alt="Jugar retos" />
            <span>JUEGA RETOS</span>
          </article>
          <article>
            <img src={FIGMA_ASSETS.landing.teamIcon} alt="Compite en equipo" />
            <span>COMPITE EN EQUIPO</span>
          </article>
          <article>
            <img src={FIGMA_ASSETS.landing.rewardIcon} alt="Gana recompensas" />
            <span>GANA RECOMPENSAS</span>
          </article>
        </section>

        <section className="fig-mobile-ecosystem fig-home-responsive-ecosystem">
          <h3>Explora el Ecosistema</h3>
          <article>
            <img src={FIGMA_ASSETS.landing.rewardIcon} alt="Tu tribe importa" />
            <h4>Tu Tribe importa</h4>
            <p>Colabora con tu equipo para desbloquear niveles exclusivos y bonos semanales.</p>
          </article>
          <article>
            <img src={FIGMA_ASSETS.landing.rewardIcon} alt="Todo en una temporada" />
            <h4>Todo en una temporada</h4>
            <p>Cada 30 dias el tablero se reinicia. Nuevos retos te esperan cada mes.</p>
          </article>
          <article>
            <img src={FIGMA_ASSETS.landing.rewardIcon} alt="Recompensas dentro de Toka" />
            <h4>Recompensas dentro de Toka</h4>
            <p>Canjea tus puntos por beneficios reales en todo el ecosistema de aplicaciones.</p>
          </article>
        </section>
      </div>
    </>
  );
}

export default function OnboardingPage() {
  return (
    <>
      <div className="fig-desktop-only">
        <AppShell title="Onboarding" subtitle="Bienvenida y estado inicial de tu Tribe">
          <OnboardingContent />
        </AppShell>
      </div>

      <main className="fig-mobile-home fig-responsive-page fig-mobile-only">
        <header className="fig-mobile-topbar">
          <div className="fig-mobile-topbar__left">
            <MobileHamburgerMenu />
            <strong>TokaTribe</strong>
          </div>
          <TokaLoginButton className="fig-mobile-enter-btn">
            Entrar
          </TokaLoginButton>
        </header>

        <OnboardingContent />

        <BottomNav active="inicio" />
      </main>
    </>
  );
}
