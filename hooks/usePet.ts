"use client";

import { useState, useEffect, useCallback } from "react";
import type { Pet, PetItem, PetItemState } from "@/types/pet";

const API = process.env.NEXT_PUBLIC_API_URL ?? "";

function authHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, { ...init, headers: authHeaders() });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const json = await res.json();
  return json.data as T;
}

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
    let alive = true;
    async function load() {
      try {
        const [petData, catalogData, userData] = await Promise.all([
          apiFetch<Pet>("/api/v1/pets/me"),
          apiFetch<PetItem[]>("/api/v1/pets/items/store"),
          apiFetch<{ totalPoints: number }>("/api/v1/users/me"),
        ]);
        if (!alive) return;
        setPet(petData);
        setCatalog(catalogData);
        setTotalPoints(userData.totalPoints);
      } catch (e) {
        if (!alive) return;
        setError("No se pudo cargar la mascota. Intenta de nuevo.");
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
      // Optimistic update
      const prevPet = pet;
      const prevPoints = totalPoints;
      setPet({ ...pet, unlockedItems: [...pet.unlockedItems, item._id] });
      setTotalPoints((p) => p - item.pointCost);
      try {
        await apiFetch(`/api/v1/pets/items/${item.itemId}/unlock`, { method: "POST" });
        showToast("ok", `¡${item.name} desbloqueado!`);
      } catch {
        setPet(prevPet);
        setTotalPoints(prevPoints);
        showToast("error", "No se pudo comprar el ítem. Inténtalo de nuevo.");
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
        await apiFetch("/api/v1/pets/me/equip", {
          method: "POST",
          body: JSON.stringify({ itemId: item.itemId }),
        });
      } catch {
        setPet(prevPet);
        showToast("error", "No se pudo equipar el ítem. Inténtalo de nuevo.");
      }
    },
    [pet],
  );

  return { pet, catalog, totalPoints, loading, error, toast, getItemState, buyItem, toggleEquip };
}
