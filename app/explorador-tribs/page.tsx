"use client";

import React, { useState } from "react";
import { FIGMA_ASSETS } from "@/lib/data";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";

const tiers = ["Todos", "Bronce", "Plata", "Oro", "Diamante"];

const mockTribes = [
  {
    id: 1,
    name: "Los Jaguares",
    avatarUrl: FIGMA_ASSETS.explorador.tribePhotos[0],
    tier: "Oro" as const,
    memberCount: 48,
    maxMembers: 50,
    pointsWeek: 125400,
  },
  {
    id: 2,
    name: "Serpientes del Rio",
    avatarUrl: FIGMA_ASSETS.explorador.tribePhotos[1],
    tier: "Plata" as const,
    memberCount: 32,
    maxMembers: 50,
    pointsWeek: 98750,
  },
  {
    id: 3,
    name: "Águilas Nocturnas",
    avatarUrl: FIGMA_ASSETS.explorador.tribePhotos[2],
    tier: "Diamante" as const,
    memberCount: 45,
    maxMembers: 50,
    pointsWeek: 156200,
  },
  {
    id: 4,
    name: "Pumas Veloces",
    avatarUrl: FIGMA_ASSETS.explorador.tribePhotos[3],
    tier: "Oro" as const,
    memberCount: 42,
    maxMembers: 50,
    pointsWeek: 132100,
  },
  {
    id: 5,
    name: "Osos Polares",
    avatarUrl: FIGMA_ASSETS.explorador.tribePhotos[4],
    tier: "Plata" as const,
    memberCount: 28,
    maxMembers: 50,
    pointsWeek: 87600,
  },
  {
    id: 6,
    name: "Leones del Savana",
    avatarUrl: FIGMA_ASSETS.explorador.tribePhotos[5],
    tier: "Bronce" as const,
    memberCount: 15,
    maxMembers: 50,
    pointsWeek: 54300,
  },
];

export default function ExplorerPage() {
  const [selectedTier, setSelectedTier] = useState<string>("Todos");

  const filteredTribes = mockTribes.filter(
    (tribe) => selectedTier === "Todos" || tribe.tier === selectedTier
  );

  const content = (
    <>
      <header className="fig-mobile-search-head">
        <div className="fig-mobile-search-box">
          <span>🔍</span>
          <input type="text" placeholder="Buscar Tribe..." />
        </div>
        <img src={FIGMA_ASSETS.landing.hero} alt="Avatar" draggable="false" />
      </header>

      <section className="fig-mobile-filter-strip">
        <div className="filter-pills-container">
          {tiers.map((tier) => (
            <button
              key={tier}
              className={`filter-pill ${selectedTier === tier ? "active" : ""}`}
              onClick={() => setSelectedTier(tier)}
            >
              {tier}
            </button>
          ))}
        </div>
      </section>

      <div className="fig-explorer-responsive-grid">
        <section className="fig-mobile-recommended">
          <h2>Tribes recomendadas</h2>
          <div className="fig-mobile-reco-scroll">
            {filteredTribes.slice(0, 3).map((tribe) => (
              <article key={tribe.id} className="fig-mobile-reco-card">
                <div>
                  <img src={tribe.avatarUrl} alt={tribe.name} />
                  <div>
                    <h3>{tribe.name}</h3>
                    <p>
                      <span>{tribe.tier}</span> {tribe.memberCount}/{tribe.maxMembers} miembros
                    </p>
                  </div>
                </div>
                <div className="fig-mobile-reco-bottom">
                  <div>
                    <small>PUNTOS SEMANA</small>
                    <strong>{new Intl.NumberFormat("es-ES").format(tribe.pointsWeek)} pts</strong>
                  </div>
                  <button type="button">Unirse</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="fig-mobile-popular">
          <h2>Tribes populares esta semana</h2>
          {filteredTribes.map((tribe) => (
            <article key={tribe.id}>
              <div>
                <img src={tribe.avatarUrl} alt={tribe.name} />
                <div>
                  <h3>{tribe.name}</h3>
                  <p>
                    <span>{tribe.tier}</span> {tribe.memberCount}/{tribe.maxMembers} miembros
                  </p>
                </div>
              </div>
              <button type="button" disabled={tribe.memberCount >= tribe.maxMembers}>
                {tribe.memberCount >= tribe.maxMembers ? "Lleno" : "Unirse"}
              </button>
            </article>
          ))}
        </section>
      </div>

      <button type="button" className="fig-mobile-create-tribe-btn">
        + Crear mi Tribe
      </button>

      {filteredTribes.length === 0 ? (
        <div className="explorer-empty">
          <div className="empty-icon">🔍</div>
          <h3 className="empty-title">No se encontraron tribus</h3>
        </div>
      ) : null}
    </>
  );

  return (
    <>
      <div className="fig-desktop-only">
        <AppShell title="Explorador" subtitle="Descubre, filtra y únete a nuevas Tribes">
          {content}
        </AppShell>
      </div>

      <main className="fig-mobile-explorer fig-responsive-page fig-mobile-only">
        {content}

        <nav className="fig-mobile-bottom-nav">
          <Link href="/dashboard" className="active">INICIO</Link>
          <Link href="/tribe">SQUAD</Link>
          <Link href="/retos">RETOS</Link>
          <Link href="/perfil">PERFIL</Link>
        </nav>
      </main>
    </>
  );
}
