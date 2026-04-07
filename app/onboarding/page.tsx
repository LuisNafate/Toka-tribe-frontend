import Link from "next/link";
import { Gamepad2, Medal, Users } from "lucide-react";

export default function OnboardingPage() {
  return (
    <div className="app-shell" style={{ padding: 18 }}>
      <div className="mobile-frame">
        <div className="phone-shell">
          <div className="phone-topbar">
            <div className="brand" style={{ gap: 8 }}>
              <div className="brand__mark" style={{ width: 30, height: 30, borderRadius: 10 }}>✦</div>
              <div className="brand__text" style={{ fontSize: "0.98rem" }}>TokaTribe</div>
            </div>
            <Link href="/dashboard" className="button button--primary" style={{ padding: "0.65rem 1rem" }}>Entrar</Link>
          </div>

          <div className="phone-content">
            <section className="hero-card" style={{ minHeight: 430, padding: 20 }}>
              <div className="hero-card__content" style={{ gap: 18 }}>
                <span className="pill" style={{ width: "fit-content" }}>Mini app dentro del ecosistema Toka</span>
                <h1 className="hero-card__title" style={{ fontSize: "2.5rem" }}>Bienvenido a tu Tribe</h1>
                <p className="hero-card__copy" style={{ fontSize: "0.96rem" }}>Compite en retos semanales, suma puntos con tu equipo y sube de división dentro de Toka.</p>
                <div className="phone-cta">
                  <Link href="/dashboard" className="button button--secondary full-width">Entrar con Toka</Link>
                  <Link href="/" className="button button--ghost full-width" style={{ color: "#fff" }}>Conocer la dinámica</Link>
                </div>
                <div className="feature-row" style={{ gridTemplateColumns: "1fr", marginTop: 8 }}>
                  <article className="mini-card"><div className="mini-icon"><Gamepad2 size={18} /></div><h3>Juega retos</h3><p>Acciones rápidas para sumar puntos.</p></article>
                  <article className="mini-card"><div className="mini-icon"><Users size={18} /></div><h3>Compite en equipo</h3><p>La Tribe marca el avance colectivo.</p></article>
                  <article className="mini-card"><div className="mini-icon"><Medal size={18} /></div><h3>Gana recompensas</h3><p>Saldo Toka y beneficios del ecosistema.</p></article>
                </div>
              </div>
            </section>

            <div className="feature-row" style={{ gridTemplateColumns: "1fr" }}>
              <article className="feature-card"><div className="feature-card__icon"><Gamepad2 size={18} /></div><h3>Tu Tribe importa</h3><p>La identidad tribal es el motor de retención.</p></article>
              <article className="feature-card"><div className="feature-card__icon"><Medal size={18} /></div><h3>Todo en una temporada</h3><p>El ranking reinicia y premia el desempeño constante.</p></article>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
