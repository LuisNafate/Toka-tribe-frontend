"use client";

import type { EquippedItems, PetItem } from "@/types/pet";

type Size = "sm" | "md" | "lg";

const SIZE_PX: Record<Size, number> = { sm: 80, md: 160, lg: 300 };

interface PetDisplayProps {
  equippedItems: EquippedItems;
  catalogItems: PetItem[];
  size?: Size;
}

export function PetDisplay({ equippedItems, catalogItems, size = "md" }: PetDisplayProps) {
  const px = SIZE_PX[size];

  function resolveUrl(objectId: string | null, slot: keyof EquippedItems) {
    if (!objectId) return null;
    return catalogItems.find((i) => i._id === objectId && i.slot === slot)?.imageUrl ?? null;
  }

  const hatUrl = resolveUrl(equippedItems.hat, "hat");
  const shirtUrl = resolveUrl(equippedItems.shirt, "shirt");
  const accessoryUrl = resolveUrl(equippedItems.accessory, "accessory");

  return (
    <div
      className="fig-pet-display"
      style={{ width: px, height: px }}
    >
      {/* Layer 1 — base mascota */}
      <img src="/images/mascota.png" alt="Mascota" draggable="false" />
      {/* Layer 2 — hat */}
      {hatUrl && <img src={hatUrl} alt="Hat" draggable="false" />}
      {/* Layer 3 — shirt */}
      {shirtUrl && <img src={shirtUrl} alt="Shirt" draggable="false" />}
      {/* Layer 4 — accessory */}
      {accessoryUrl && <img src={accessoryUrl} alt="Accessory" draggable="false" />}
    </div>
  );
}
