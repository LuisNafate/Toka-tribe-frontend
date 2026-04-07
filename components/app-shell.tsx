"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Bell, Plus, Settings, Sparkles } from "lucide-react";
import { navItems } from "@/lib/data";

type AppShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  aside?: ReactNode;
  headerBadge?: ReactNode;
};

export function AppShell({ title, subtitle, children, aside, headerBadge }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div>
          <div className="sidebar__brand">
            <div className="brand__mark" aria-hidden="true">
              ✦
            </div>
            <div>
              <div className="brand__text">TokaTribe</div>
              <div style={{ color: "rgba(255,255,255,0.72)", fontSize: "0.86rem" }}>La liga social del entretenimiento</div>
            </div>
          </div>

          <nav className="sidebar__nav" aria-label="Navegación principal">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link key={item.href} href={item.href} className="sidebar__nav-link" data-active={active ? "true" : "false"}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="sidebar__footer">
          <button className="button sidebar__cta" type="button">
            <Plus size={16} />
            New Activity
          </button>
          <div className="sidebar__meta">
            <Link href="/settings" className="inline-row">
              <Settings size={16} /> Settings
            </Link>
            <Link href="/settings" className="inline-row">
              <Sparkles size={16} /> Support
            </Link>
          </div>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div>
            <h1 className="topbar__title">{title}</h1>
            {subtitle ? <p className="topbar__subtitle">{subtitle}</p> : null}
          </div>

          <div className="topbar__actions">
            {headerBadge}
            <button className="balance-pill" type="button" aria-label="Notificaciones">
              <Bell size={16} style={{ verticalAlign: "-3px" }} />
            </button>
            <div className="inline-row" style={{ gap: 10 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 800 }}>Andrea</div>
                <div className="subtle">Axo Squad</div>
              </div>
              <div className="avatar" aria-hidden="true">
                AN
              </div>
            </div>
          </div>
        </header>

        {aside ? (
          <div className="dashboard-grid">
            <main className="dashboard-main">{children}</main>
            <aside className="dashboard-side">{aside}</aside>
          </div>
        ) : (
          <main className="workspace__stack">{children}</main>
        )}
      </div>

      <nav className="bottom-nav" aria-label="Navegación móvil">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href} className="bottom-nav__link" data-active={active ? "true" : "false"}>
              <Icon size={16} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
