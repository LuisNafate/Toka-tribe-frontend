import Link from "next/link";
import { AppShell } from "@/components/app-shell";
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
