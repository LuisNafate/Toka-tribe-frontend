"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const MOBILE_MENU_ITEMS = [
  { href: "/dashboard", label: "Home" },
  { href: "/tribe", label: "Mi Tribe" },
  { href: "/retos", label: "Retos" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/recompensas", label: "Recompensas" },
  { href: "/perfil", label: "Perfil" },
];

export function MobileHamburgerMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) {
      document.body.classList.add("body-sidebar-locked");
    } else {
      document.body.classList.remove("body-sidebar-locked");
    }

    return () => {
      document.body.classList.remove("body-sidebar-locked");
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="fig-mobile-menu-btn"
        aria-label="Abrir menú"
        aria-expanded={open}
        aria-controls="fig-mobile-menu-drawer"
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      <aside id="fig-mobile-menu-drawer" className={`fig-mobile-menu-drawer ${open ? "is-open" : ""}`}>
        <div className="fig-mobile-menu-drawer__head">
          <strong>TokaTribe</strong>
          <button type="button" aria-label="Cerrar menú" onClick={() => setOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <nav className="fig-mobile-menu-drawer__nav" aria-label="Navegación móvil">
          {MOBILE_MENU_ITEMS.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);

            return (
              <Link key={item.href} href={item.href} className={active ? "active" : ""}>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <button
        type="button"
        className={`fig-mobile-menu-backdrop ${open ? "is-open" : ""}`}
        aria-label="Cerrar menú"
        onClick={() => setOpen(false)}
      />
    </>
  );
}