import Link from "next/link";
import { Gamepad2, Home, User, Users } from "lucide-react";

type NavTab = "inicio" | "squad" | "retos" | "perfil";

const NAV_ITEMS: { tab: NavTab; href: string; label: string; icon: React.ReactNode }[] = [
  { tab: "inicio", href: "/dashboard", label: "INICIO", icon: <Home size={20} /> },
  { tab: "squad", href: "/tribe", label: "SQUAD", icon: <Users size={20} /> },
  { tab: "retos", href: "/retos", label: "RETOS", icon: <Gamepad2 size={20} /> },
  { tab: "perfil", href: "/perfil", label: "PERFIL", icon: <User size={20} /> },
];

export default function BottomNav({ active }: { active: NavTab }) {
  return (
    <nav className="fig-mobile-bottom-nav">
      {NAV_ITEMS.map(({ tab, href, label, icon }) => (
        <Link key={tab} href={href} className={active === tab ? "active" : ""}>
          <span className="fig-mobile-nav-icon">{icon}</span>
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
