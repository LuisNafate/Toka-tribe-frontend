"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Users } from "lucide-react";
import { FIGMA_ASSETS } from "@/lib/data";
import BottomNav from "@/components/BottomNav";
import { AppShell } from "@/components/app-shell";
import { MobileHamburgerMenu } from "@/components/mobile-hamburger-menu";
import { TokaApi } from "@/services/toka-api.service";
import { useTribe } from "@/hooks/useTribe";
import { CreateTribeModal } from "@/components/organisms/CreateTribeModal";

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
  const v = raw.toLowerCase();
  if (v.includes("diam")) return "Diamante";
  if (v.includes("oro"))  return "Oro";
  if (v.includes("plat")) return "Plata";
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
        const memberCount = toNumber(rec.memberCount) ?? toNumber(rec.membersCount) ?? 0;
        const maxMembers = toNumber(rec.maxMembers) ?? toNumber(rec.capacity) ?? 10;
        const pointsWeek = toNumber(rec.pointsWeek) ?? toNumber(rec.scoreWeek) ?? toNumber(rec.points) ?? 0;
        const avatarUrl =
          toText(rec.avatarUrl) ?? toText(rec.imageUrl) ??
          FIGMA_ASSETS.explorador.tribePhotos[imageCursor % FIGMA_ASSETS.explorador.tribePhotos.length];
        tribes.push({ id, name, avatarUrl, tier: normalizeTier(tierRaw), memberCount, maxMembers, pointsWeek });
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


// ── Main Page ──────────────────────────────────────────────────────────────────
export default function ExplorerPage() {
  const { myTribe, isMember, loading: tribeLoading, toast, joinTribe, createTribe } = useTribe();

  const [selectedTier, setSelectedTier] = useState<string>("Todos");
  const [searchText, setSearchText] = useState("");
  const [tribes, setTribes] = useState<TribeCard[]>([]);
  const [loadingTribes, setLoadingTribes] = useState(false);
  const [joiningTribeId, setJoiningTribeId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function loadTribes() {
    setLoadingTribes(true);
    try {
      const response = await TokaApi.tribesList();
      const parsed = extractTribes(response.data);
      if (parsed.length > 0) setTribes(parsed);
      setMessage(null);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Error desconocido";
      setMessage(`No se pudo sincronizar explorador. ${detail}`);
    } finally {
      setLoadingTribes(false);
    }
  }

  useEffect(() => { void loadTribes(); }, []);

  async function handleJoin(tribeId: string) {
    setJoiningTribeId(tribeId);
    const result = await joinTribe(tribeId);
    if (result.success) await loadTribes();
    setJoiningTribeId(null);
  }

  async function handleCreate(name: string, slug: string, description?: string) {
    const result = await createTribe({ name, slug, description });
    if (result.success) {
      setShowCreate(false);
      await loadTribes();
    }
  }

  function getJoinLabel(tribe: TribeCard): string {
    if (joiningTribeId === tribe.id) return "Uniendo...";
    if (myTribe?.id === tribe.id) return "Tu Tribe";
    if (tribe.memberCount >= tribe.maxMembers) return "Lleno";
    return "Unirse";
  }

  function isJoinDisabled(tribe: TribeCard): boolean {
    if (joiningTribeId !== null) return true;
    if (myTribe?.id === tribe.id) return true;
    if (tribe.memberCount >= tribe.maxMembers) return true;
    return false;
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

      {/* User's current tribe banner */}
      {!tribeLoading && myTribe && (
        <div className="fig-explorer-my-tribe-banner">
          <Users size={14} />
          <span>Eres miembro de <strong>{myTribe.name}</strong></span>
        </div>
      )}

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
            {filteredTribes.slice(0, 3).map((tribe) => {
              const isMyTribe = myTribe?.id === tribe.id;
              const tierKey = tribe.tier.toLowerCase().replace("á","a").replace("é","e");
              const joinBtnClass = isMyTribe
                ? "fig-explorer-join-btn fig-explorer-join-btn--mine"
                : tribe.memberCount >= tribe.maxMembers
                  ? "fig-explorer-join-btn fig-explorer-join-btn--full"
                  : "fig-explorer-join-btn";
              return (
                <article key={tribe.id} className={`fig-mobile-reco-card${isMyTribe ? " fig-mobile-reco-card--mine" : ""}`}>
                  <div className="fig-mobile-reco-card__top">
                    <img src={tribe.avatarUrl} alt={tribe.name} />
                    <div className="fig-mobile-reco-card__info">
                      <div className="fig-mobile-reco-card__name">
                        <h3>{tribe.name}</h3>
                        <span className={`fig-tier-badge fig-tier-badge--${tierKey}`}>{tribe.tier}</span>
                      </div>
                      <p className="fig-mobile-reco-card__members">{tribe.memberCount}/{tribe.maxMembers} miembros</p>
                    </div>
                  </div>
                  <div className="fig-mobile-reco-bottom">
                    <div className="fig-mobile-reco-bottom__pts">
                      <small>PUNTOS SEMANA</small>
                      <strong>{new Intl.NumberFormat("es-ES").format(tribe.pointsWeek)} pts</strong>
                    </div>
                    <button
                      type="button"
                      disabled={isJoinDisabled(tribe)}
                      className={joinBtnClass}
                      onClick={() => !isMyTribe && !isMember && void handleJoin(tribe.id)}
                    >
                      {getJoinLabel(tribe)}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="fig-mobile-popular">
          <h2>Tribes populares esta semana</h2>
          {filteredTribes.map((tribe) => {
            const isMyTribe = myTribe?.id === tribe.id;
            const tierKey = tribe.tier.toLowerCase().replace("á","a").replace("é","e");
            const joinBtnClass = isMyTribe
              ? "fig-explorer-join-btn fig-explorer-join-btn--mine"
              : tribe.memberCount >= tribe.maxMembers
                ? "fig-explorer-join-btn fig-explorer-join-btn--full"
                : "fig-explorer-join-btn";
            return (
              <article key={tribe.id}>
                <div>
                  <img src={tribe.avatarUrl} alt={tribe.name} />
                  <div>
                    <h3>{tribe.name}{isMyTribe && <span className="fig-explorer-you-badge">Tú</span>}</h3>
                    <p>
                      <span className={`fig-tier-badge fig-tier-badge--${tierKey}`}>{tribe.tier}</span>
                      {tribe.memberCount}/{tribe.maxMembers} miembros
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={isJoinDisabled(tribe)}
                  className={joinBtnClass}
                  onClick={() => !isMyTribe && !isMember && void handleJoin(tribe.id)}
                >
                  {getJoinLabel(tribe)}
                </button>
              </article>
            );
          })}
        </section>
      </div>

      {/* Create tribe — only if not already a member */}
      {!isMember && (
        <button
          type="button"
          className="fig-mobile-create-tribe-btn"
          onClick={() => setShowCreate(true)}
        >
          + Crear mi Tribe
        </button>
      )}

      {loadingTribes && <p className="subtle">Sincronizando Tribes...</p>}
      {message && <p className="subtle">{message}</p>}

      {filteredTribes.length === 0 && !loadingTribes && (
        <div className="explorer-empty">
          <div className="empty-icon">🔍</div>
          <h3 className="empty-title">No se encontraron tribus</h3>
        </div>
      )}

      {/* Toast from useTribe */}
      {toast && (
        <div className={`fig-mascota-toast fig-mascota-toast--${toast.type}`} role="status">
          {toast.text}
        </div>
      )}

      {/* Create tribe modal */}
      {showCreate && (
        <CreateTribeModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}
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
