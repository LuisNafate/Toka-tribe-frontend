"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FIGMA_ASSETS } from "@/lib/data";

type TierOption = {
  id: "oro" | "plata" | "bronce";
  name: string;
  multiplier: string;
  price: number;
  popular?: boolean;
};

const tierOptions: TierOption[] = [
  { id: "oro", name: "Tier Oro", multiplier: "Multiplicador 2.0x", price: 50, popular: true },
  { id: "plata", name: "Tier Plata", multiplier: "Multiplicador 1.5x", price: 25 },
  { id: "bronce", name: "Tier Bronce", multiplier: "Multiplicador 1.2x", price: 10 },
];

const walletBalance = 120;

export default function ActivarTierPage() {
  const [selectedTier, setSelectedTier] = useState<TierOption>(tierOptions[0]);
  const [feedback, setFeedback] = useState<string>("");

  const finalBalance = useMemo(() => walletBalance - selectedTier.price, [selectedTier.price]);

  function onActivateTier() {
    setFeedback(`Tier activado: ${selectedTier.name}. Tu membresía ahora aplica ${selectedTier.multiplier}.`);
  }

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
        <h1>Activa tu tier</h1>
        <p>Invierte en tu temporada y multiplica tus recompensas al cierre.</p>
        <img src="/images/ajolote_4.png" alt="Mascot" draggable="false" />
      </section>

      <section className="fig-tier-options">
        {tierOptions.map((option) => {
          const active = option.id === selectedTier.id;
          return (
            <button
              key={option.id}
              type="button"
              className={`fig-tier-option ${active ? "fig-tier-option--active" : ""}`}
              onClick={() => {
                setSelectedTier(option);
                setFeedback(`Seleccionaste ${option.name}.`);
              }}
            >
              <div>
                <h2>{option.name}</h2>
                <p>{option.multiplier}</p>
                {option.popular ? <span>Más popular</span> : null}
              </div>
              <strong>${option.price} Toka</strong>
            </button>
          );
        })}
      </section>

      <section className="fig-tier-balance">
        <div>
          <span>Tu balance:</span>
          <strong>${walletBalance} Toka</strong>
        </div>
        <div>
          <span>Pagarás:</span>
          <strong className="negative">-${selectedTier.price} Toka</strong>
        </div>
        <div className="fig-tier-balance-total">
          <span>Balance después:</span>
          <strong>${finalBalance} Toka</strong>
        </div>
      </section>

      {feedback ? <p className="fig-tier-feedback" role="status" aria-live="polite">{feedback}</p> : null}

      <button type="button" className="fig-tier-activate" onClick={onActivateTier}>
        Activar {selectedTier.name}
      </button>
    </main>
  );
}
