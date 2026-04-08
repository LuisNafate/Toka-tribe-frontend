"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gamepad2, Home, User, Users } from "lucide-react";

type NavTab = "inicio" | "squad" | "retos" | "perfil";

const NAV_ITEMS: { tab: NavTab; href: string; label: string; icon: React.ReactNode }[] = [
  { tab: "inicio", href: "/dashboard", label: "INICIO", icon: <Home size={20} /> },
  { tab: "squad", href: "/tribe", label: "SQUAD", icon: <Users size={20} /> },
  { tab: "retos", href: "/retos", label: "RETOS", icon: <Gamepad2 size={20} /> },
  { tab: "perfil", href: "/perfil", label: "PERFIL", icon: <User size={20} /> },
];

export default function BottomNav({ active }: { active?: NavTab }) {
  const pathname = usePathname();

  function isActive(item: (typeof NAV_ITEMS)[number]) {
    if (active) return active === item.tab;
    return pathname === item.href || pathname?.startsWith(`${item.href}/`);
  }

  return (
    <nav className="fig-mobile-bottom-nav">
      {NAV_ITEMS.map((item) => (
        <Link key={item.tab} href={item.href} className={isActive(item) ? "active" : ""}>
          <span className="fig-mobile-nav-icon">{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
