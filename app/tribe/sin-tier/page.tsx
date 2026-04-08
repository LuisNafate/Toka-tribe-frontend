import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import BottomNav from "@/components/BottomNav";
import { TribeDashboardContent } from "@/components/tribe-dashboard-content";

export default function TribeSinTierPage() {
  return (
    <>
      <div className="fig-desktop-only">
        <AppShell title="Mi Tribe" subtitle="Vista de progreso sin tier asignado">
          <TribeDashboardContent withoutTier />
        </AppShell>
      </div>

      <main className="fig-mobile-tribe fig-responsive-page fig-mobile-only">
        <header className="fig-mobile-topbar">
          <div className="fig-mobile-topbar__left">
            <span className="fig-mobile-menu">☰</span>
            <strong>TokaTribe</strong>
          </div>
        </header>

        <TribeDashboardContent withoutTier />

        <BottomNav active="squad" />
      </main>
    </>
  );
}
