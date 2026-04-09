"use client";

import { useState, useEffect, useCallback } from "react";
import { TokaApi } from "@/services/toka-api.service";
import { getSessionToken } from "@/services/auth.service";
import type { Pet, PetItem, PetItemState } from "@/types/pet";

export function usePet() {
  const [pet, setPet] = useState<Pet | null>(null);
  const [catalog, setCatalog] = useState<PetItem[]>([]);
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);
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
        const [petEnv, catalogEnv, userEnv] = await Promise.all([
          TokaApi.petsMe(),
          TokaApi.petsStore(),
          TokaApi.usersMe(),
        ]);
        if (!alive) return;
        setPet(petEnv.data as Pet);
        setCatalog((catalogEnv.data as PetItem[]) ?? []);
        setTotalPoints((userEnv.data as { totalPoints: number })?.totalPoints ?? 0);
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
      // Optimistic update
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
      // Optimistic update
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

  return { pet, catalog, totalPoints, loading, error, toast, getItemState, buyItem, toggleEquip };
}
