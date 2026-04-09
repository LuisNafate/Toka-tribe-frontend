"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface CreateTribeModalProps {
  onClose: () => void;
  onCreate: (name: string, slug: string, description?: string) => Promise<void>;
}

function slugify(text: string): string {
  return text.toLowerCase().trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 30);
}

export function CreateTribeModal({ onClose, onCreate }: CreateTribeModalProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleNameChange(val: string) {
    setName(val);
    setSlug(slugify(val));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 3) return;
    setSubmitting(true);
    await onCreate(name.trim(), slug || slugify(name), description.trim() || undefined);
    setSubmitting(false);
  }

  return (
    <div className="fig-tribe-modal-overlay" onClick={onClose}>
      <div className="fig-tribe-modal" onClick={(e) => e.stopPropagation()}>
        <div className="fig-tribe-modal-header">
          <h3>Crear mi Tribe</h3>
          <button type="button" onClick={onClose} className="fig-tribe-modal-close">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="fig-tribe-modal-form">
          <label className="fig-tribe-modal-label">
            Nombre *
            <input
              className="fig-tribe-modal-input"
              type="text"
              placeholder="Ej: Axo Squad"
              value={name}
              maxLength={30}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />
          </label>
          <label className="fig-tribe-modal-label">
            Slug (identificador)
            <input
              className="fig-tribe-modal-input"
              type="text"
              placeholder="axo-squad"
              value={slug}
              maxLength={30}
              onChange={(e) => setSlug(e.target.value)}
            />
          </label>
          <label className="fig-tribe-modal-label">
            Descripción (opcional)
            <input
              className="fig-tribe-modal-input"
              type="text"
              placeholder="¿De qué trata tu Tribe?"
              value={description}
              maxLength={120}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <button
            type="submit"
            className="fig-tribe-modal-submit"
            disabled={name.trim().length < 3 || submitting}
          >
            {submitting ? "Creando..." : "Crear Tribe"}
          </button>
        </form>
      </div>
    </div>
  );
}
