"use client";

import Link from "next/link";
import { FIGMA_ASSETS } from "@/lib/data";
import { LandingHero } from "@/components/landing-hero";

const features = [
  {
    id: 1,
    icon: "🎯",
    title: "Desafíos Semanales",
    description: "Participa en retos con tu tribu y gana puntos exclusivos",
  },
  {
    id: 2,
    icon: "🏆",
    title: "Ligas y Rankings",
    description: "Compite contra otras tribus y sube en la tabla de posiciones",
  },
  {
    id: 3,
    icon: "🎁",
    title: "Recompensas Premium",
    description: "Canjea tus puntos por premios y beneficios especiales",
  },
];

export default function LandingPage() {
  return (
    <main className="landing-desktop">
      {/* Hero Section */}
      <section className="landing-hero-section">
        <div className="landing-hero-content">
          <h1 className="landing-title">
            Únete a tu tribu y <span className="gradient-text">Domina el Juego</span>
          </h1>
          <p className="landing-subtitle">
            Compite, colabora y gana increíbles premios con tu comunidad
          </p>
          <div className="landing-cta-buttons">
            <Link href="/onboarding" className="btn btn--primary">
              Empezar Ahora
            </Link>
            <Link href="/explorador-tribs" className="btn btn--secondary">
              Explorar Tribs
            </Link>
          </div>
        </div>
        <div className="landing-hero-image">
          <img 
            src={FIGMA_ASSETS.landing.hero} 
            alt="Landing hero"
            draggable="false"
          />
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="landing-features-section">
        <div className="features-header">
          <h2 className="features-title">¿Por qué Toka Tribe?</h2>
          <p className="features-subtitle">Todo lo que necesitas para triunfar con tu comunidad</p>
        </div>

        <div className="features-grid-container">
          {features.map((feature) => (
            <div key={feature.id} className="feature-card landing-feature">
              <div className="feature-icon-circle">
                <span className="feature-emoji">{feature.icon}</span>
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
              <div className="feature-arrow">→</div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="landing-stats-section">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">50K+</div>
            <div className="stat-label">Jugadores Activos</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">500+</div>
            <div className="stat-label">Tribs Creadas</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">$100K+</div>
            <div className="stat-label">Premios Distribuidos</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-final-cta">
        <h2 className="final-cta-title">¿Listo para comenzar tu aventura?</h2>
        <p className="final-cta-subtitle">Crea tu tribu hoy y empieza a competir</p>
        <Link href="/onboarding" className="btn btn--large">
          Crear Mi Tribu
        </Link>
      </section>

      {/* Progress Dots */}
      <div className="landing-progress-dots">
        {[...Array(7)].map((_, i) => (
          <div 
            key={i} 
            className={`progress-dot ${i === 0 ? "active" : ""}`}
          />
        ))}
      </div>
    </main>
  );
}
