"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Crown, Shield, Star, ChevronRight, ArrowLeft } from "lucide-react";

type Tier = "basic" | "vip" | "premium";

const TIERS = [
  {
    id: "premium" as Tier,
    label: "Premium",
    icon: <Crown size={22} />,
    color: "#f59e0b",
    bg: "linear-gradient(135deg, #f59e0b22, #d9770622)",
    border: "#f59e0b",
    multiplier: "2.0x",
    price: 50,
    popular: true,
  },
  {
    id: "vip" as Tier,
    label: "VIP",
    icon: <Star size={22} />,
    color: "#4a77e3",
    bg: "linear-gradient(135deg, #4a77e322, #6366f122)",
    border: "transparent",
    multiplier: "1.5x",
    price: 25,
    popular: false,
  },
  {
    id: "basic" as Tier,
    label: "Basic",
    icon: <Shield size={22} />,
    color: "#64748b",
    bg: "linear-gradient(135deg, #64748b22, #94a3b822)",
    border: "transparent",
    multiplier: "1.2x",
    price: 10,
    popular: false,
  },
];

const MOCK_BALANCE = 120;

export default function MembresiaPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Tier>("premium");
  const [activated, setActivated] = useState(false);

  const selectedTier = TIERS.find((t) => t.id === selected)!;
  const afterBalance = MOCK_BALANCE - selectedTier.price;

  function handleActivar() {
    setActivated(true);
    setTimeout(() => router.back(), 1800);
  }

  return (
    <main className="fig-membresia-page">
      {/* Header */}
      <header className="fig-membresia-header">
        <button type="button" className="fig-membresia-back" onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </button>
        <span className="fig-membresia-brand">TokaTribe</span>
        <div className="fig-membresia-avatar">
          <img src="/images/ajolote_2.png" alt="Avatar" />
        </div>
      </header>

      {/* Hero */}
      <section className="fig-membresia-hero">
        <div className="fig-membresia-hero-text">
          <h1>Activa tu tier</h1>
          <p>Invierte en tu temporada y multiplica<br />tus recompensas al cierre</p>
        </div>
        <img src="/images/mascota.png" alt="Ajolote" className="fig-membresia-hero-img" draggable="false" />
      </section>

      {/* Tier list */}
      <div className="fig-membresia-list">
        {TIERS.map((tier) => (
          <button
            key={tier.id}
            type="button"
            className={`fig-membresia-tier${selected === tier.id ? " fig-membresia-tier--active" : ""}`}
            style={selected === tier.id ? { background: tier.bg, borderColor: tier.border } : {}}
            onClick={() => setSelected(tier.id)}
          >
            <span className="fig-membresia-tier-icon" style={{ color: tier.color, background: `${tier.color}22` }}>
              {tier.icon}
            </span>
            <div className="fig-membresia-tier-info">
              <span className="fig-membresia-tier-name">Tier {tier.label}</span>
              <span className="fig-membresia-tier-sub">Multiplicador {tier.multiplier}</span>
            </div>
            {tier.popular && (
              <span className="fig-membresia-popular">MÁS POPULAR</span>
            )}
            <div className="fig-membresia-tier-price">
              <span className="fig-membresia-tier-amount">${tier.price}</span>
              <span className="fig-membresia-tier-currency">Toka</span>
            </div>
          </button>
        ))}
      </div>

      {/* Balance summary */}
      <div className="fig-membresia-summary">
        <div className="fig-membresia-summary-row">
          <span>Tu balance:</span>
          <span>${MOCK_BALANCE} Toka</span>
        </div>
        <div className="fig-membresia-summary-row">
          <span>Pagarás:</span>
          <span className="fig-membresia-summary-cost">-${selectedTier.price} Toka</span>
        </div>
        <div className="fig-membresia-summary-divider" />
        <div className="fig-membresia-summary-row fig-membresia-summary-row--total">
          <span>Balance después:</span>
          <span className="fig-membresia-summary-after">${afterBalance} Toka</span>
        </div>
      </div>

      {/* CTA */}
      <button
        type="button"
        className={`fig-membresia-cta${activated ? " fig-membresia-cta--done" : ""}`}
        onClick={handleActivar}
        disabled={activated}
      >
        {activated ? `¡Tier ${selectedTier.label} activado!` : `Activar Tier ${selectedTier.label}`}
        {!activated && <ChevronRight size={18} />}
      </button>
    </main>
  );
}
