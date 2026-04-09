"use client";

import React, { useEffect, useMemo, useState } from "react";
import { FIGMA_ASSETS } from "@/lib/data";
import BottomNav from "@/components/BottomNav";
import { AppShell } from "@/components/app-shell";
import { MobileHamburgerMenu } from "@/components/mobile-hamburger-menu";
import { TokaApi } from "@/services/toka-api.service";

type TribeCard = {
  id: string;
  name: string;
  avatarUrl: string;
  tier: string;
  memberCount: number;
  maxMembers: number;
  pointsWeek: number;
};

const tiers = ["Todos", "Bronce", "Plata", "Oro", "Diamante"];

const fallbackTribes: TribeCard[] = [
  { id: "1", name: "Los Jaguares", avatarUrl: FIGMA_ASSETS.explorador.tribePhotos[0], tier: "Oro", memberCount: 48, maxMembers: 50, pointsWeek: 125400 },
  { id: "2", name: "Serpientes del Rio", avatarUrl: FIGMA_ASSETS.explorador.tribePhotos[1], tier: "Plata", memberCount: 32, maxMembers: 50, pointsWeek: 98750 },
  { id: "3", name: "Aguilas Nocturnas", avatarUrl: FIGMA_ASSETS.explorador.tribePhotos[2], tier: "Diamante", memberCount: 45, maxMembers: 50, pointsWeek: 156200 },
];

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function toText(value: unknown): string | null {
  if (typeof value === "string" && value.trim() !== "") return value.trim();
  return null;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, ""));
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function normalizeTier(raw: string): string {
  const value = raw.toLowerCase();
  if (value.includes("diam")) return "Diamante";
  if (value.includes("oro")) return "Oro";
  if (value.includes("plat")) return "Plata";
  if (value.includes("bron")) return "Bronce";
  return "Bronce";
}

function extractTribes(payload: unknown): TribeCard[] {
  const queue: unknown[] = [payload];
  const tribes: TribeCard[] = [];
  let imageCursor = 0;

  while (queue.length > 0) {
    const current = queue.shift();

    if (Array.isArray(current)) {
      for (const item of current) {
        const rec = toRecord(item);
        if (!rec) continue;

        const id = toText(rec.id) ?? toText(rec.tribeId) ?? null;
        const name = toText(rec.name) ?? toText(rec.tribeName) ?? null;
        if (!id || !name) continue;

        const tierRaw = toText(rec.tier) ?? toText(rec.division) ?? "Bronce";
        const memberCount = toNumber(rec.memberCount) ?? toNumber(rec.membersCount) ?? toNumber(toRecord(rec.members)?.count) ?? 0;
        const maxMembers = toNumber(rec.maxMembers) ?? toNumber(rec.capacity) ?? 50;
        const pointsWeek = toNumber(rec.pointsWeek) ?? toNumber(rec.scoreWeek) ?? toNumber(rec.points) ?? 0;
        const avatarUrl =
          toText(rec.avatarUrl) ??
          toText(rec.imageUrl) ??
          FIGMA_ASSETS.explorador.tribePhotos[imageCursor % FIGMA_ASSETS.explorador.tribePhotos.length];

        tribes.push({
          id,
          name,
          avatarUrl,
          tier: normalizeTier(tierRaw),
          memberCount,
          maxMembers,
          pointsWeek,
        });
        imageCursor += 1;
      }
      continue;
    }

    const rec = toRecord(current);
    if (!rec) continue;

    for (const value of Object.values(rec)) {
      if (value && typeof value === "object") queue.push(value);
    }
  }

  return tribes.filter((item, idx, arr) => arr.findIndex((x) => x.id === item.id) === idx);
}

export default function ExplorerPage() {
  const [selectedTier, setSelectedTier] = useState<string>("Todos");
  const [searchText, setSearchText] = useState("");
  const [tribes, setTribes] = useState<TribeCard[]>(fallbackTribes);
  const [loading, setLoading] = useState(false);
  const [joiningTribeId, setJoiningTribeId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function loadTribes() {
    setLoading(true);
    try {
      const response = await TokaApi.tribesList();
      const parsed = extractTribes(response.data);
      if (parsed.length > 0) {
        setTribes(parsed);
      }
      setMessage(null);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Error desconocido";
      setMessage(`No se pudo sincronizar explorador. ${detail}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTribes();
  }, []);

  async function handleJoin(tribeId: string) {
    setJoiningTribeId(tribeId);
    setMessage(null);
    try {
      await TokaApi.tribesJoin(tribeId);
      setMessage("Te uniste a la Tribe correctamente.");
      await loadTribes();
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Error desconocido";
      setMessage(`No se pudo unir a la Tribe. ${detail}`);
    } finally {
      setJoiningTribeId(null);
    }
  }

  const filteredTribes = useMemo(() => {
    const text = searchText.trim().toLowerCase();
    return tribes.filter((tribe) => {
      const byTier = selectedTier === "Todos" || tribe.tier === selectedTier;
      const bySearch = text.length === 0 || tribe.name.toLowerCase().includes(text);
      return byTier && bySearch;
    });
  }, [tribes, selectedTier, searchText]);

  const content = (
    <>
      <header className="fig-mobile-search-head">
        <div className="fig-mobile-search-box">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Buscar Tribe..."
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
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
                  <button
                    type="button"
                    disabled={tribe.memberCount >= tribe.maxMembers || joiningTribeId !== null}
                    onClick={() => void handleJoin(tribe.id)}
                  >
                    {joiningTribeId === tribe.id ? "Uniendo..." : "Unirse"}
                  </button>
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
              <button
                type="button"
                disabled={tribe.memberCount >= tribe.maxMembers || joiningTribeId !== null}
                onClick={() => void handleJoin(tribe.id)}
              >
                {joiningTribeId === tribe.id ? "Uniendo..." : tribe.memberCount >= tribe.maxMembers ? "Lleno" : "Unirse"}
              </button>
            </article>
          ))}
        </section>
      </div>

      <button type="button" className="fig-mobile-create-tribe-btn" onClick={() => setMessage("Creación de Tribe se habilita en el siguiente paso de producto.")}>
        + Crear mi Tribe
      </button>

      {loading ? <p className="subtle">Sincronizando Tribes...</p> : null}
      {message ? <p className="subtle">{message}</p> : null}

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
        <header className="fig-mobile-topbar">
          <div className="fig-mobile-topbar__left">
            <MobileHamburgerMenu />
            <strong>Explorador</strong>
          </div>
          <div style={{ width: 36, height: 36 }} />
        </header>

        {content}

        <BottomNav active="inicio" />
      </main>
    </>
  );
}
