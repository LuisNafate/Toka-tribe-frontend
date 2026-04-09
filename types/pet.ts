export type PetSlot = "hat" | "shirt" | "accessory";
export type PetItemState = "disponible" | "desbloqueado" | "equipado" | "bloqueado";

export interface EquippedItems {
  hat: string | null;
  shirt: string | null;
  accessory: string | null;
}

export interface PetItem {
  _id: string;
  itemId: string;   // e.g. "hat_crown_gold" — used in API calls
  name: string;
  imageUrl: string;
  slot: PetSlot;
  pointCost: number;
  isAvailable: boolean;
  seasonId?: string;
  requiresMembership?: boolean;
}

export interface Pet {
  id: string;
  name: string;
  unlockedItems: string[];   // array of ObjectId strings
  equippedItems: EquippedItems; // each value is ObjectId string or null
}
