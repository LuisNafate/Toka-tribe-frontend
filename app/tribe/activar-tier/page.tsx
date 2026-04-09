"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FIGMA_ASSETS } from "@/lib/data";
import { TokaApi } from "@/services/toka-api.service";
import { extractPaymentSnapshot } from "@/services/payment-contracts";

export default function ActivarTierPage() {
  const [paymentHistoryCount, setPaymentHistoryCount] = useState<number>(0);
  const [documentedBalance, setDocumentedBalance] = useState<number | null>(null);
  const [message, setMessage] = useState<string>("La activación de tiers requiere catálogo y validación oficial.");

  useEffect(() => {
    async function loadWallet() {
      try {
        const response = await TokaApi.paymentsMe();
        const snapshot = extractPaymentSnapshot(response.data);
        setPaymentHistoryCount(snapshot.historyCount);
        setDocumentedBalance(snapshot.documentedBalance);
      } catch {
        setPaymentHistoryCount(0);
        setDocumentedBalance(null);
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
            <p>Catálogo pendiente para precios, multiplicadores y validaciones.</p>
          </div>
          <strong>Pendiente</strong>
        </div>
      </section>

      <section className="fig-tier-balance">
        <div>
          <span>Historial de pagos:</span>
          <strong>{paymentHistoryCount === 0 ? "Sin registros" : `${paymentHistoryCount} movimientos sincronizados`}</strong>
          <p style={{ marginTop: 8 }}>
            {documentedBalance === null
              ? "Saldo no documentado todavía."
              : `Saldo documentado: $${documentedBalance.toLocaleString("es-ES")} Toka`}
          </p>
        </div>
      </section>

      <p className="fig-tier-feedback" role="status" aria-live="polite">{message}</p>

      <button type="button" className="fig-tier-activate" disabled>
        Activación pendiente
      </button>
    </main>
  );
}
