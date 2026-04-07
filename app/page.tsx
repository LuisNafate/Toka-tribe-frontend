import Link from "next/link";
import { Gamepad2, Medal, Users } from "lucide-react";
import { FIGMA_ASSETS } from "@/lib/data";

export default function LandingPage() {
  return (
    <main className="fig-home-desktop">
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
          <button type="button">Ver demo</button>
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
  );
}
