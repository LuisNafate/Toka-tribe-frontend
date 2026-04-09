"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { PetCustomizer } from "@/components/organisms/PetCustomizer";

export default function MascotaPage() {
  const router = useRouter();

  return (
    <main className="fig-mascota-page fig-mobile-only">
      <button
        type="button"
        className="fig-mascota-back"
        onClick={() => router.back()}
        aria-label="Volver"
      >
        <ChevronLeft size={20} />
      </button>
      <PetCustomizer />
    </main>
  );
}
