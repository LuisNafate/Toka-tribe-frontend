"use client";

import { useEffect, useMemo, useState } from "react";
import { CircleDollarSign, Flame, Gift, Wallet } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AppPointsBadge } from "@/components/app-points-badge";
import BottomNav from "@/components/BottomNav";
import { MobileHamburgerMenu } from "@/components/mobile-hamburger-menu";
import { Panel, ProgressBar, SectionHeader } from "@/components/common";
import { FIGMA_ASSETS, rewardCards } from "@/lib/data";
import { TokaApi } from "@/services/toka-api.service";

type RewardItem = {
  id: string;
  title: string;
  description: string;
  status: string;
  claimable: boolean;
};

const FALLBACK_REWARDS: RewardItem[] = rewardCards.map((item, index) => ({
  id: `fallback-${index + 1}`,
  title: item.title,
  description: item.description,
  status: item.status,
  claimable: item.status.toLowerCase().includes("disponible"),
}));

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

function extractRewards(payload: unknown): RewardItem[] {
  const queue: unknown[] = [payload];
  const rewards: RewardItem[] = [];

  while (queue.length > 0) {
    const current = queue.shift();

    if (Array.isArray(current)) {
      for (const item of current) {
        const rec = toRecord(item);
        if (!rec) continue;

        const id = toText(rec.id) ?? toText(rec.rewardId) ?? null;
        const title = toText(rec.title) ?? toText(rec.name) ?? null;
        const description = toText(rec.description) ?? "Recompensa del ecosistema Toka.";
        const status = toText(rec.status) ?? (Boolean(rec.claimable ?? rec.available) ? "Disponible" : "Próxima recompensa");
        const claimable = Boolean(rec.claimable ?? rec.available ?? status.toLowerCase().includes("disponible"));

        if (id && title) {
          rewards.push({ id, title, description, status, claimable });
        }
      }
      continue;
    }

    const rec = toRecord(current);
    if (!rec) continue;

    for (const value of Object.values(rec)) {
      if (value && typeof value === "object") queue.push(value);
    }
  }

  return rewards.filter((item, idx, arr) => arr.findIndex((x) => x.id === item.id) === idx);
}

export default function RecompensasPage() {
  const [rewards, setRewards] = useState<RewardItem[]>(FALLBACK_REWARDS);
  const [walletBalance, setWalletBalance] = useState<number>(1240);
  const [myClaimsCount, setMyClaimsCount] = useState<number>(0);
  const [message, setMessage] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState<string | null>(null);

  useEffect(() => {
    async function loadRewards() {
      setMessage(null);

      const [listResult, claimsResult, paymentsResult] = await Promise.allSettled([
        TokaApi.rewardsList(),
        TokaApi.rewardsMyClaims(),
        TokaApi.paymentsMe(),
      ]);

      if (listResult.status === "fulfilled") {
        const parsed = extractRewards(listResult.value.data);
        if (parsed.length > 0) setRewards(parsed);
      }

      if (claimsResult.status === "fulfilled") {
        const claimsPayload = claimsResult.value.data;
        if (Array.isArray(claimsPayload)) {
          setMyClaimsCount(claimsPayload.length);
        } else {
          const claimsRec = toRecord(claimsPayload);
          if (Array.isArray(claimsRec?.items)) {
            setMyClaimsCount(claimsRec.items.length);
          }
        }
      }

      if (paymentsResult.status === "fulfilled") {
        const payload = paymentsResult.value.data;
        const rec = toRecord(payload);
        const nextBalance =
          toNumber(rec?.balance) ??
          toNumber(rec?.walletBalance) ??
          toNumber(rec?.totalBalance) ??
          toNumber(toRecord(rec?.summary)?.balance) ??
          null;
        if (nextBalance !== null) {
          setWalletBalance(nextBalance);
        }
      }

      const failed = [listResult, claimsResult, paymentsResult].filter((item) => item.status === "rejected").length;
      if (failed > 0) {
        setMessage("Parte de las recompensas no se pudo sincronizar. Se muestran datos de respaldo.");
      }
    }

    void loadRewards();
  }, []);

  async function handleClaim(rewardId: string) {
    setIsClaiming(rewardId);
    setMessage(null);
    try {
      await TokaApi.rewardsClaim(rewardId);
      setMessage("Recompensa reclamada correctamente.");

      const [listResult, claimsResult] = await Promise.allSettled([TokaApi.rewardsList(), TokaApi.rewardsMyClaims()]);
      if (listResult.status === "fulfilled") {
        const parsed = extractRewards(listResult.value.data);
        if (parsed.length > 0) setRewards(parsed);
      }
      if (claimsResult.status === "fulfilled") {
        const claimsPayload = claimsResult.value.data;
        if (Array.isArray(claimsPayload)) {
          setMyClaimsCount(claimsPayload.length);
        }
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Error desconocido";
      setMessage(`No se pudo reclamar la recompensa. ${detail}`);
    } finally {
      setIsClaiming(null);
    }
  }

  const claimableRewards = useMemo(() => rewards.filter((item) => item.claimable), [rewards]);
  const progress = Math.min(100, Math.max(0, Math.round((claimableRewards.length / Math.max(1, rewards.length)) * 100)));

  return (
    <>
      <div className="fig-desktop-only">
        <AppShell title="Recompensas" subtitle="Wallet, canjes y beneficios del ecosistema" headerBadge={<AppPointsBadge />}>
          <div className="workspace__grid">
            <Panel>
              <SectionHeader eyebrow="Wallet Toka" title={`$${walletBalance.toLocaleString("es-ES")} balance disponible`} description="Tus recompensas se acreditan en tu wallet y quedan listas para canje." />
              <div className="metric-grid">
                <article className="metric-card"><div className="metric-card__icon"><Wallet size={18} /></div><div className="metric-card__value">${walletBalance.toLocaleString("es-ES")}</div><div className="metric-card__label">Saldo actual</div></article>
                <article className="metric-card"><div className="metric-card__icon"><Gift size={18} /></div><div className="metric-card__value">{myClaimsCount}</div><div className="metric-card__label">Canjes realizados</div></article>
                <article className="metric-card"><div className="metric-card__icon"><CircleDollarSign size={18} /></div><div className="metric-card__value">{progress}%</div><div className="metric-card__label">Recompensas disponibles</div></article>
              </div>
              <div style={{ marginTop: 20 }}>
                <ProgressBar value={progress} label="Progreso a siguiente canje" suffix={`${progress}%`} muted />
              </div>
              {message ? <p className="subtle" style={{ marginTop: 10 }}>{message}</p> : null}
            </Panel>

            <div className="dashboard-side">
              <Panel className="muted-card">
                <span className="status-pill">Disponible ahora</span>
                <h3>{claimableRewards[0]?.title ?? "$50 en saldo Toka"}</h3>
                <p>{claimableRewards[0]?.description ?? "Recompensa disponible por racha y consistencia semanal."}</p>
                <button
                  className="button button--primary full-width"
                  style={{ marginTop: 14 }}
                  type="button"
                  disabled={!claimableRewards[0] || isClaiming !== null}
                  onClick={() => {
                    if (claimableRewards[0]) {
                      void handleClaim(claimableRewards[0].id);
                    }
                  }}
                >
                  {isClaiming ? "Reclamando..." : "Reclamar"}
                </button>
              </Panel>

              <Panel>
                <SectionHeader eyebrow="Canjes" title="Historial reciente" description="Registro de recompensas y micro-transacciones." />
                <div className="timeline">
                  <div className="timeline-row"><div className="timeline-dot" /><div><strong>Canjes acumulados</strong><p>{myClaimsCount} reclamaciones exitosas</p></div><span className="subtle">Hoy</span></div>
                  <div className="timeline-row"><div className="timeline-dot" /><div><strong>Recompensas disponibles</strong><p>{claimableRewards.length} listas para reclamar</p></div><span className="subtle">Semana</span></div>
                </div>
              </Panel>
            </div>
          </div>

          <div className="reward-grid" style={{ marginTop: 18 }}>
            {rewards.map((item) => (
              <article key={item.id} className="reward-card">
                <span className="reward-pill">{item.status}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <button
                  type="button"
                  className="button button--secondary"
                  style={{ marginTop: 10 }}
                  disabled={!item.claimable || isClaiming !== null}
                  onClick={() => void handleClaim(item.id)}
                >
                  {isClaiming === item.id ? "Reclamando..." : item.claimable ? "Reclamar" : "No disponible"}
                </button>
              </article>
            ))}
          </div>
        </AppShell>
      </div>

      <main className="fig-mobile-recompensas fig-mobile-only">
        <header className="fig-mobile-topbar fig-retos-topbar">
          <div className="fig-mobile-topbar__left">
            <MobileHamburgerMenu />
            <strong className="fig-retos-brand">TokaTribe</strong>
          </div>
          <div className="fig-retos-avatar">
            <img src={FIGMA_ASSETS.landing.hero} alt="Avatar" />
          </div>
        </header>

        <section className="fig-retos-hero">
          <div className="fig-retos-hero__content">
            <h1>Recompensas</h1>
            <p>Wallet · Canjes · Beneficios</p>
            <span className="fig-retos-racha"><Flame size={14} /> Disponibles ahora: {claimableRewards.length}</span>
          </div>
          <img src="/images/ajolote_4.png" alt="Mascot" draggable="false" />
        </section>

        <section className="fig-unified-section">
          <article className="fig-unified-card">
            <div className="fig-unified-head">
              <strong>Wallet Toka</strong>
              <AppPointsBadge className="fig-unified-badge" />
            </div>
            <h3>${walletBalance.toLocaleString("es-ES")} balance disponible</h3>
            <p>Canjes realizados: {myClaimsCount}. Recompensas disponibles: {claimableRewards.length}.</p>
          </article>

          {rewards.map((item) => (
            <article key={item.id} className="fig-unified-card fig-unified-card--soft">
              <div className="fig-unified-head">
                <strong>{item.title}</strong>
                <span>{item.status}</span>
              </div>
              <p>{item.description}</p>
              <button
                type="button"
                className="button button--secondary"
                disabled={!item.claimable || isClaiming !== null}
                onClick={() => void handleClaim(item.id)}
              >
                {isClaiming === item.id ? "Reclamando..." : item.claimable ? "Reclamar" : "No disponible"}
              </button>
            </article>
          ))}
        </section>
        {message ? <p className="subtle" style={{ padding: "0 20px" }}>{message}</p> : null}
        <BottomNav active="retos" />
      </main>
    </>
  );
}
