import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import BottomNav from "@/components/BottomNav";
import { TribeDashboardContent } from "@/components/tribe-dashboard-content";

export default function TribePage() {
  const content = <TribeDashboardContent withoutTier />;

  return (
    <>
      <div className="fig-desktop-only">
        <AppShell title="Mi Tribe" subtitle="Membresía crítica activa: selecciona un tier para desbloquear beneficios">
          {content}
        </AppShell>
      </div>

      <main className="fig-mobile-tribe fig-responsive-page fig-mobile-only">
        <header className="fig-mobile-topbar">
          <div className="fig-mobile-topbar__left">
            <span className="fig-mobile-menu">☰</span>
            <strong>TokaTribe</strong>
          </div>
          <img src={"http://localhost:3845/assets/339b32c23261ca4d6bee3f2fbd560b8fc7ba98a3.png"} alt="Perfil" />
        </header>

        {content}

        <BottomNav active="squad" />
      </main>
    </>
  );
}
