import Link from "next/link";
import { AppShell } from "@/components/app-shell";
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

        <nav className="fig-mobile-bottom-nav">
          <Link href="/dashboard">INICIO</Link>
          <Link href="/tribe" className="active">SQUAD</Link>
          <Link href="/retos">RETOS</Link>
          <Link href="/perfil">PERFIL</Link>
        </nav>
      </main>
    </>
  );
}
