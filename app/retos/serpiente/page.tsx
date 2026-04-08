import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { AppPointsBadge } from "@/components/app-points-badge";
import { SnakeGame } from "@/components/snake-game";

export default function SnakeRetoPage() {
  return (
    <main className="fig-mobile-snake fig-snake-page">
      <header className="fig-mobile-topbar fig-retos-topbar fig-snake-topbar">
        <div className="fig-mobile-topbar__left">
          <Link href="/retos" className="fig-tier-back">← Retos</Link>
          <strong className="fig-retos-brand">Snake Tribe</strong>
        </div>
        <AppPointsBadge className="fig-mobile-snake-badge" />
      </header>

      <SnakeGame />

      <div className="fig-mobile-only">
        <BottomNav active="retos" />
      </div>
    </main>
  );
}