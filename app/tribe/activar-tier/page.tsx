"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FIGMA_ASSETS } from "@/lib/data";
import { TokaApi } from "@/services/toka-api.service";

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, ""));
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export default function ActivarTierPage() {
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [message, setMessage] = useState<string>("La activación de tiers requiere endpoint de backend dedicado.");

  useEffect(() => {
    async function loadWallet() {
      try {
        const response = await TokaApi.paymentsMe();
        const payload = toRecord(response.data);
        const balance =
          toNumber(payload?.balance) ??
          toNumber(payload?.walletBalance) ??
          toNumber(payload?.totalBalance) ??
          toNumber(toRecord(payload?.summary)?.balance) ??
          null;

        setWalletBalance(balance);
      } catch {
        setWalletBalance(null);
      }
    }

    void loadWallet();
  }, []);

  return (
    <main className="fig-tier-page">
      <header className="fig-tier-topbar">
        <Link href="/tribe" className="fig-tier-back">Regresar</Link>
        <strong>TokaTribe</strong>
        <div className="fig-tier-avatar-wrap">
          <div className="fig-tier-avatar" style={{ backgroundImage: `url(${FIGMA_ASSETS.voidAvatar})` }} />
        </div>
      </header>

      <section className="fig-tier-hero">
        <h1>Activación de tier</h1>
        <p>Esta funcionalidad no utiliza valores simulados y queda bloqueada hasta contar con endpoint oficial.</p>
        <img src="/images/ajolote_4.png" alt="Mascot" draggable="false" />
      </section>

      <section className="fig-tier-options">
        <div className="fig-tier-option fig-tier-option--active" role="status">
          <div>
            <h2>Sin catálogo de tiers</h2>
            <p>Backend pendiente para precios, multiplicadores y validaciones.</p>
          </div>
          <strong>No disponible</strong>
        </div>
      </section>

      <section className="fig-tier-balance">
        <div>
          <span>Tu balance:</span>
          <strong>{walletBalance === null ? "Sin datos" : `$${walletBalance.toLocaleString("es-ES")} Toka`}</strong>
        </div>
      </section>

      <p className="fig-tier-feedback" role="status" aria-live="polite">{message}</p>

      <button type="button" className="fig-tier-activate" disabled>
        Activación no disponible
      </button>
    </main>
  );
}
