"use client";

import { useState } from "react";
import { Lock, CheckCircle2, ShoppingBag, Shirt, Star, HardHat, Sparkles } from "lucide-react";
import { usePet } from "@/hooks/usePet";
import { PetDisplay } from "./PetDisplay";
import type { PetItem, PetSlot } from "@/types/pet";

type TabFilter = "all" | PetSlot;

const TABS: { id: TabFilter; label: string; icon: React.ReactNode }[] = [
  { id: "all",       label: "Todos",       icon: <Star size={16} /> },
  { id: "hat",       label: "Sombreros",   icon: <HardHat size={16} /> },
  { id: "shirt",     label: "Camisas",     icon: <Shirt size={16} /> },
  { id: "accessory", label: "Accesorios",  icon: <ShoppingBag size={16} /> },
];

export function PetCustomizer() {
  const { pet, needsCreate, catalog, totalPoints, loading, creating, error, toast, createPet, getItemState, buyItem, toggleEquip } = usePet();
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [confirmItem, setConfirmItem] = useState<PetItem | null>(null);
  const [petName, setPetName] = useState("");

  const filtered = catalog.filter((i) => activeTab === "all" || i.slot === activeTab);

  function handleItemClick(item: PetItem) {
    const state = getItemState(item);
    if (state === "equipado" || state === "desbloqueado") {
      toggleEquip(item);
    } else if (state === "disponible") {
      setConfirmItem(item);
    }
  }

  if (loading) {
    return (
      <div className="fig-mascota-loading">
        <div className="fig-mascota-spinner" />
        <p>Cargando mascota...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fig-mascota-error">
        <p>{error}</p>
      </div>
    );
  }

  if (needsCreate) {
    const valid = petName.trim().length >= 3 && petName.trim().length <= 20;
    return (
      <div className="fig-mascota-create-screen">
        <div className="fig-mascota-preview-area">
          <Sparkles size={28} color="rgba(255,255,255,0.7)" style={{ marginBottom: 8 }} />
          <img src="/images/mascota.png" alt="Mascota" className="fig-mascota-create-img" draggable="false" />
        </div>
        <div className="fig-mascota-sheet">
          <h2 className="fig-mascota-create-title">Ponle nombre a tu mascota</h2>
          <p className="fig-mascota-create-sub">Entre 3 y 20 caracteres</p>
          <input
            className="fig-mascota-name-input"
            type="text"
            placeholder="Ej: Toky"
            value={petName}
            maxLength={20}
            onChange={(e) => setPetName(e.target.value)}
          />
          <button
            type="button"
            className="fig-mascota-create-btn"
            disabled={!valid || creating}
            onClick={() => createPet(petName.trim())}
          >
            {creating ? "Creando..." : "Crear mascota"}
          </button>
        </div>
        {toast && (
          <div className={`fig-mascota-toast fig-mascota-toast--${toast.type}`} role="status">
            {toast.text}
          </div>
        )}
      </div>
    );
  }

  if (!pet) return null;

  return (
    <div className="fig-mascota-customizer">

      {/* Top preview area */}
      <div className="fig-mascota-preview-area">
        <div className="fig-mascota-sparkle fig-mascota-sparkle--tl">✦</div>
        <div className="fig-mascota-sparkle fig-mascota-sparkle--tr">✦</div>
        <PetDisplay equippedItems={pet.equippedItems} catalogItems={catalog} size="lg" />
        <p className="fig-mascota-pet-name">{pet.name}</p>
      </div>

      {/* Bottom sheet */}
      <div className="fig-mascota-sheet">

        {/* Points chip */}
        <div className="fig-mascota-points-row">
          <span className="fig-mascota-points-label">Tus puntos</span>
          <span className="fig-mascota-points-value">{totalPoints.toLocaleString()} pts</span>
        </div>

        {/* Category tabs */}
        <div className="fig-mascota-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`fig-mascota-tab${activeTab === t.id ? " fig-mascota-tab--active" : ""}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Item grid */}
        <div className="fig-mascota-grid">
          {filtered.length === 0 && (
            <p className="fig-mascota-empty">No hay ítems en esta categoría.</p>
          )}
          {filtered.map((item) => {
            const state = getItemState(item);
            return (
              <button
                key={item._id}
                type="button"
                className={`fig-mascota-item fig-mascota-item--${state}`}
                onClick={() => handleItemClick(item)}
                disabled={state === "bloqueado"}
              >
                <div className="fig-mascota-item-img-wrap">
                  <img src={item.imageUrl} alt={item.name} draggable="false" />
                  {state === "equipado" && (
                    <span className="fig-mascota-item-badge fig-mascota-item-badge--equipped">
                      <CheckCircle2 size={12} />
                    </span>
                  )}
                  {state === "desbloqueado" && (
                    <span className="fig-mascota-item-badge fig-mascota-item-badge--owned">
                      <CheckCircle2 size={12} />
                    </span>
                  )}
                  {state === "bloqueado" && (
                    <span className="fig-mascota-item-badge fig-mascota-item-badge--locked">
                      <Lock size={10} />
                    </span>
                  )}
                </div>
                <span className="fig-mascota-item-name">{item.name}</span>
                {(state === "disponible" || state === "bloqueado") && (
                  <span className={`fig-mascota-item-cost${state === "bloqueado" ? " fig-mascota-item-cost--locked" : ""}`}>
                    {item.pointCost.toLocaleString()} pts
                  </span>
                )}
                {state === "equipado" && (
                  <span className="fig-mascota-item-status">Equipado</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Confirm purchase modal */}
      {confirmItem && (
        <div className="fig-mascota-modal-overlay" onClick={() => setConfirmItem(null)}>
          <div className="fig-mascota-modal" onClick={(e) => e.stopPropagation()}>
            <div className="fig-mascota-modal-img-wrap">
              <img src={confirmItem.imageUrl} alt={confirmItem.name} />
            </div>
            <h3 className="fig-mascota-modal-title">{confirmItem.name}</h3>
            <p className="fig-mascota-modal-body">
              ¿Gastar <strong>{confirmItem.pointCost.toLocaleString()} pts</strong> para desbloquear este ítem?
            </p>
            <div className="fig-mascota-modal-actions">
              <button
                type="button"
                className="fig-mascota-modal-cancel"
                onClick={() => setConfirmItem(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="fig-mascota-modal-confirm"
                onClick={() => {
                  buyItem(confirmItem);
                  setConfirmItem(null);
                }}
              >
                Confirmar compra
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fig-mascota-toast fig-mascota-toast--${toast.type}`} role="status">
          {toast.text}
        </div>
      )}
    </div>
  );
}
