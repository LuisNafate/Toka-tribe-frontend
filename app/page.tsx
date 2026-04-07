import Link from "next/link";
import { Gamepad2, Medal, Users } from "lucide-react";
import { featureCards } from "@/lib/data";

export default function LandingPage() {
  return (
    <div className="landing">
      <header className="landing__nav">
        <div className="brand">
          <div className="brand__mark" aria-hidden="true">
            ✦
          </div>
          <div className="brand__text">TokaTribe</div>
        </div>

        <nav className="landing__menu" aria-label="Secciones">
          <Link href="#como-funciona">Cómo funciona</Link>
          <Link href="#temporada">Temporada</Link>
          <Link href="#recompensas">Recompensas</Link>
          <Link href="/dashboard" className="button button--ghost" style={{ paddingInline: 18 }}>
            Entrar con Toka
          </Link>
        </nav>
      </header>

      <section className="landing__hero">
        <div className="hero-card">
          <div className="hero-card__content">
            <span className="pill">Mini app dentro del ecosistema Toka</span>
            <div>
              <h1 className="hero-card__title">Bienvenido a tu Tribe</h1>
              <p className="hero-card__copy">
                Compite en retos semanales, suma puntos con tu equipo y sube de división dentro de Toka.
              </p>
            </div>

            <p className="hero-card__copy" style={{ maxWidth: 520, fontSize: "0.98rem" }}>
              Accede con tu cuenta Toka. Sin registros extra, sin fricción y con una experiencia mobile-first pensada para retención.
            </p>

            <div className="chip-list">
              <span className="chip chip--active">
                <Gamepad2 size={16} /> Juega retos
              </span>
              <span className="chip">
                <Users size={16} /> Compite en equipo
              </span>
              <span className="chip">
                <Medal size={16} /> Gana recompensas
              </span>
            </div>

            <div className="hero-actions">
              <Link href="/dashboard" className="button button--primary">
                Entrar con Toka
              </Link>
              <Link href="/onboarding" className="button button--secondary">
                Conocer la dinámica
              </Link>
            </div>
          </div>
        </div>

        <aside className="hero-aside" aria-label="Resumen visual">
          <div className="panel" style={{ minHeight: 220, background: "linear-gradient(180deg, #ffffff 0%, #f6f8ff 100%)" }}>
            <span className="badge">Estado de tu Tribe</span>
            <h2 style={{ margin: "16px 0 6px", fontFamily: "var(--font-manrope)", fontSize: "2rem", letterSpacing: "-0.04em" }}>Axo Squad</h2>
            <div className="inline-row" style={{ justifyContent: "space-between", marginTop: 18 }}>
              <div>
                <div className="metric-card__value">#4</div>
                <div className="metric-card__label">Posición semanal</div>
              </div>
              <div>
                <div className="reward-pill">Plata</div>
              </div>
            </div>
            <div style={{ marginTop: 18 }}>
              <div className="subtle" style={{ marginBottom: 8 }}>A 120 pts de ascender 92%</div>
              <div className="progress progress--muted"><div className="progress__bar" style={{ width: "92%" }} /></div>
            </div>
          </div>

          <div className="panel muted-card">
            <div className="inline-row" style={{ justifyContent: "space-between" }}>
              <strong>Reto del día</strong>
              <span className="status-pill">Disponible ahora</span>
            </div>
            <p style={{ marginTop: 10 }}>Completa 2 retos más para desbloquear el bonus semanal.</p>
          </div>
        </aside>
      </section>

      <section className="feature-grid" id="como-funciona" style={{ marginTop: 22 }}>
        {featureCards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.title} className="feature-card">
              <div className="feature-card__icon">
                <Icon size={18} />
              </div>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </article>
          );
        })}
      </section>

      <section className="stack" style={{ justifyContent: "center", alignItems: "center", marginTop: 38 }} id="temporada">
        <div className="footer-dots" style={{ display: "flex", gap: 10 }}>
          <span className="avatar" style={{ width: 10, height: 10, background: "#0b1f36" }} />
          <span className="avatar" style={{ width: 10, height: 10, background: "#d0d7e4", boxShadow: "none" }} />
          <span className="avatar" style={{ width: 10, height: 10, background: "#d0d7e4", boxShadow: "none" }} />
        </div>
        <p className="subtle" style={{ textAlign: "center" }}>© 2026 TokaTribe. Paso 1 de 3</p>
        <div className="inline-row" style={{ justifyContent: "center", gap: 18 }} id="recompensas">
          <Link href="#">Privacidad</Link>
          <Link href="#">Términos</Link>
        </div>
      </section>
    </div>
  );
}
