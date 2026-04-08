import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import BottomNav from "@/components/BottomNav";
import { TribeDashboardContent } from "@/components/tribe-dashboard-content";

export default function TribePage() {
  const content = <TribeDashboardContent />;

  return (
    <>
      <div className="fig-desktop-only">
        <AppShell title="Mi Tribe" subtitle="Rendimiento, miembros y actividad del equipo">
          {content}
        </AppShell>
      </div>

      <main className="fig-mobile-tribe fig-responsive-page fig-mobile-only">
        <header className="fig-mobile-topbar">
          <div className="fig-mobile-topbar__left">
            <span className="fig-mobile-menu">☰</span>
            <strong>TokaTribe</strong>
          </div>
        </header>

        {content}

        <BottomNav active="squad" />
      </main>
    </>
  );
}
