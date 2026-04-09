import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import BottomNav from "@/components/BottomNav";
import { MobileHamburgerMenu } from "@/components/mobile-hamburger-menu";
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
            <MobileHamburgerMenu />
            <strong>TokaTribe</strong>
          </div>
          <img src="/images/ajolotes_1.png" alt="Perfil" />
        </header>

        <TribeDashboardContent withoutTier />

        <BottomNav active="squad" />
      </main>
    </>
  );
}
