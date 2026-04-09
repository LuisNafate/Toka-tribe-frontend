"use client";

import { useState, useEffect, useCallback } from "react";
import { ApiError, TokaApi } from "@/services/toka-api.service";
import { getSessionToken } from "@/services/auth.service";
import type { Pet, PetItem, PetItemState } from "@/types/pet";

function toText(v: unknown): string { return typeof v === "string" && v.trim() ? v.trim() : ""; }
function toNum(v: unknown): number { return typeof v === "number" && Number.isFinite(v) ? v : 0; }
function toArr(v: unknown): unknown[] { return Array.isArray(v) ? v : []; }
function toRec(v: unknown): Record<string, unknown> { return v && typeof v === "object" && !Array.isArray(v) ? v as Record<string, unknown> : {}; }

function normalizePet(raw: Record<string, unknown>): import("@/types/pet").Pet {
  const equipped = toRec(raw.equippedItems);
  return {
    id: toText(raw.id) || toText(raw._id),
    name: toText(raw.name) || "Mi mascota",
    unlockedItems: toArr(raw.unlockedItems).map((x) => toText(x)).filter(Boolean) as string[],
    equippedItems: {
      hat: toText(equipped.hat) || null,
      shirt: toText(equipped.shirt) || null,
      accessory: toText(equipped.accessory) || null,
    },
  };
}

function normalizeCatalog(raw: unknown): import("@/types/pet").PetItem[] {
  return toArr(raw).flatMap((item) => {
    const r = toRec(item);
    const id = toText(r._id) || toText(r.id);
    const slot = (["hat", "shirt", "accessory"].includes(toText(r.slot)) ? toText(r.slot) : null) as import("@/types/pet").PetSlot | null;
    if (!id || !slot) return [];
    return [{
      _id: id,
      itemId: toText(r.itemId) || id,
      name: toText(r.name) || "Ítem",
      imageUrl: toText(r.imageUrl) || toText(r.image) || "/images/mascota.png",
      slot,
      pointCost: toNum(r.pointCost) || toNum(r.cost) || toNum(r.price),
      isAvailable: r.isAvailable !== false,
      seasonId: toText(r.seasonId) || undefined,
    }];
  });
}

export function usePet() {
  const [pet, setPet] = useState<Pet | null>(null);
  const [needsCreate, setNeedsCreate] = useState(false);
  const [catalog, setCatalog] = useState<PetItem[]>([]);
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  function showToast(type: "ok" | "error", text: string) {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => {
    if (!getSessionToken()) {
      setError("No hay sesión activa. Inicia sesión para personalizar tu mascota.");
      setLoading(false);
      return;
    }

    let alive = true;
    async function load() {
      try {
        // petsStore may return 404 if endpoint not yet deployed — treat as empty catalog
        const [catalogResult, userEnv] = await Promise.allSettled([
          TokaApi.petsStore(),
          TokaApi.usersMe(),
        ]);

        let petData: Pet | null = null;
        try {
          const petEnv = await TokaApi.petsMe();
          // Backend may return pet at root or nested under .data
          const raw = (petEnv.data ?? petEnv) as Record<string, unknown>;
          petData = normalizePet(raw);
        } catch (petErr) {
          const is404 = petErr instanceof ApiError && petErr.status === 404;
          if (is404) {
            if (alive) setNeedsCreate(true);
          } else {
            throw petErr;
          }
        }

        if (!alive) return;
        setPet(petData);

        const rawCatalog = catalogResult.status === "fulfilled"
          ? ((catalogResult.value.data ?? catalogResult.value) as unknown)
          : [];
        setCatalog(normalizeCatalog(rawCatalog));

        const userRaw = (userEnv.status === "fulfilled"
          ? (userEnv.value.data ?? userEnv.value) as Record<string, unknown>
          : {}) as { totalPoints?: number };
        setTotalPoints(typeof userRaw.totalPoints === "number" ? userRaw.totalPoints : 0);
      } catch (e) {
        if (!alive) return;
        const msg = e instanceof Error ? e.message : "No se pudo cargar la mascota.";
        setError(msg);
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, []);

  const createPet = useCallback(async (name: string) => {
    setCreating(true);
    setError(null);
    try {
      const env = await TokaApi.petsCreate(name);
      const raw = toRec((env.data ?? env) as unknown);
      setPet(normalizePet(raw));
      setNeedsCreate(false);
      showToast("ok", `¡Mascota "${name}" creada!`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "No se pudo crear la mascota.";
      showToast("error", msg);
    } finally {
      setCreating(false);
    }
  }, []);

  const getItemState = useCallback(
    (item: PetItem): PetItemState => {
      if (!pet) return "bloqueado";
      const isUnlocked = pet.unlockedItems.includes(item._id);
      const isEquipped = pet.equippedItems[item.slot] === item._id;
      if (isEquipped) return "equipado";
      if (isUnlocked) return "desbloqueado";
      if (item.pointCost <= totalPoints) return "disponible";
      return "bloqueado";
    },
    [pet, totalPoints],
  );

  const buyItem = useCallback(
    async (item: PetItem) => {
      if (!pet) return;
      const prevPet = pet;
      const prevPoints = totalPoints;
      setPet({ ...pet, unlockedItems: [...pet.unlockedItems, item._id] });
      setTotalPoints((p) => p - item.pointCost);
      try {
        await TokaApi.petsUnlockItem(item.itemId);
        showToast("ok", `¡${item.name} desbloqueado!`);
      } catch (e) {
        setPet(prevPet);
        setTotalPoints(prevPoints);
        const msg = e instanceof Error ? e.message : "No se pudo comprar el ítem.";
        showToast("error", msg);
      }
    },
    [pet, totalPoints],
  );

  const toggleEquip = useCallback(
    async (item: PetItem) => {
      if (!pet) return;
      const prevPet = pet;
      const isEquipped = pet.equippedItems[item.slot] === item._id;
      setPet({
        ...pet,
        equippedItems: {
          ...pet.equippedItems,
          [item.slot]: isEquipped ? null : item._id,
        },
      });
      try {
        await TokaApi.petsEquip(item.itemId);
      } catch (e) {
        setPet(prevPet);
        const msg = e instanceof Error ? e.message : "No se pudo equipar el ítem.";
        showToast("error", msg);
      }
    },
    [pet],
  );

  return {
    pet,
    needsCreate,
    catalog,
    totalPoints,
    loading,
    creating,
    error,
    toast,
    createPet,
    getItemState,
    buyItem,
    toggleEquip,
  };
}
