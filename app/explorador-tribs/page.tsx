"use client";

import React, { useState } from "react";
import Link from "next/link";
import { TribeCard } from "@/components/tribe-card";
import { FIGMA_ASSETS } from "@/lib/data";

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

  return (
    <main className="explorer-page">
      {/* Header Section */}
      <div className="explorer-header">
        <div className="explorer-header-content">
          <h1 className="explorer-title">Explorador de Tribs</h1>
          <p className="explorer-subtitle">
            Descubre nuevas comunidades, únete y compite con otros jugadores
          </p>
        </div>
        <Link href="/dashboard" className="btn btn--secondary">
          ← Volver al Dashboard
        </Link>
      </div>

      {/* Filter Section */}
      <div className="explorer-filters">
        <div className="filter-label">Filtrar por Tier:</div>
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
      </div>

      {/* Results Counter */}
      <div className="explorer-results">
        <span className="results-count">
          {filteredTribes.length} tribu{filteredTribes.length !== 1 ? "s" : ""} encontrada{filteredTribes.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Tribes Grid */}
      {filteredTribes.length > 0 ? (
        <div className="tribes-grid">
          {filteredTribes.map((tribe) => (
            <TribeCard
              key={tribe.id}
              name={tribe.name}
              avatarUrl={tribe.avatarUrl}
              tier={tribe.tier}
              memberCount={tribe.memberCount}
              maxMembers={tribe.maxMembers}
              pointsWeek={tribe.pointsWeek}
              onJoin={() => console.log(`Joining tribe: ${tribe.name}`)}
            />
          ))}
        </div>
      ) : (
        <div className="explorer-empty">
          <div className="empty-icon">🔍</div>
          <h3 className="empty-title">No se encontraron tribs</h3>
          <p className="empty-message">
            Intenta con otro filtro o crea tu propia tribu
          </p>
        </div>
      )}
    </main>
  );
}
