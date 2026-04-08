import { CheckCircle2, Flame, LayoutList, ShieldCheck, Sparkles, Star, Trophy, User } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Panel, SectionHeader } from "@/components/common";
import { MobileHamburgerMenu } from "@/components/mobile-hamburger-menu";
import BottomNav from "@/components/BottomNav";
import { FIGMA_ASSETS, profileHighlights } from "@/lib/data";

export default function PerfilPage() {
  return (
    <>
      {/* ── Desktop (unchanged) ── */}
      <div className="fig-desktop-only">
        <AppShell title="Perfil" subtitle="Identidad, progreso y configuración personal">
          <div className="workspace__grid">
            <Panel>
              <SectionHeader eyebrow="Jugador" title="Alix" description="Miembro activo de Axo Squad" />
              <div className="inline-row" style={{ alignItems: "center" }}>
                <img
                  src={FIGMA_ASSETS.dashboard.userPic}
                  alt="Alix"
                  className="avatar avatar--lg"
                  style={{ objectFit: "cover" }}
                />
                <div>
                  <div className="item-title">Nivel Plata</div>
                  <div className="subtle">Participación constante y racha de equipo activa.</div>
                </div>
              </div>
              <div className="feature-row" style={{ marginTop: 20 }}>
                {profileHighlights.map((item) => (
                  <article key={item.title} className="mini-card">
                    <div className="mini-icon"><ShieldCheck size={18} /></div>
                    <h3>{item.title}</h3>
                    <p>{item.value}</p>
                  </article>
                ))}
              </div>
            </Panel>
            <div className="dashboard-side">
              <Panel className="muted-card">
                <div className="inline-row" style={{ justifyContent: "space-between" }}>
                  <span className="status-pill">Conectado</span>
                  <Sparkles size={18} />
                </div>
                <h3>Single Sign-On Toka</h3>
                <p>Acceso directo, sin registro adicional, con progreso sincronizado en todo el ecosistema.</p>
              </Panel>
              <Panel>
                <SectionHeader eyebrow="Preferencias" title="Visibilidad y alertas" description="Controla tu experiencia dentro de TokaTribe." />
                <div className="stack stack--tight">
                  <div className="setting-row"><div><div className="item-title">Perfil visible</div><div className="subtle">Los miembros pueden ver tu avatar.</div></div><div className="reward-pill">Activo</div></div>
                  <div className="setting-row"><div><div className="item-title">Alertas de temporada</div><div className="subtle">Recibe recordatorios de cierre.</div></div><div className="reward-pill">Activo</div></div>
                </div>
              </Panel>
            </div>
          </div>
        </AppShell>
      </div>

      {/* ── Mobile ── */}
      <main className="fig-perfil-page fig-mobile-only">

        {/* Hero header — blue gradient */}
        <header className="fig-perfil-hero">
          <div className="fig-perfil-hero-top">
            <MobileHamburgerMenu />
          </div>
          <div className="fig-perfil-avatar-wrap">
            <img src={FIGMA_ASSETS.landing.hero} alt="Avatar" className="fig-perfil-avatar" />
          </div>
          <h1 className="fig-perfil-name">Alix</h1>
          <div className="fig-perfil-chips">
            <span className="fig-perfil-chip fig-perfil-chip--plata">PLATA</span>
            <span className="fig-perfil-chip fig-perfil-chip--free">FREE</span>
          </div>
          <div className="fig-perfil-stats-row">
            <div className="fig-perfil-stat">
              <span className="fig-perfil-stat-label">TOTAL PTS</span>
              <span className="fig-perfil-stat-value">4,820</span>
            </div>
            <div className="fig-perfil-stat-divider" />
            <div className="fig-perfil-stat">
              <span className="fig-perfil-stat-label">RACHA MAX</span>
              <span className="fig-perfil-stat-value">12 días</span>
            </div>
            <div className="fig-perfil-stat-divider" />
            <div className="fig-perfil-stat">
              <span className="fig-perfil-stat-label">TRIBES</span>
              <span className="fig-perfil-stat-value">3</span>
            </div>
          </div>
        </header>

        <div className="fig-perfil-body">

          {/* Mi mascota */}
          <article className="fig-perfil-card fig-perfil-mascota-card">
            <div className="fig-perfil-card-head">
              <p className="fig-perfil-card-title">Mi mascota</p>
              <Link href="/perfil/mascota" className="fig-perfil-link">Personalizar →</Link>
            </div>
            <div className="fig-perfil-mascota-body">
              <img src="/images/mascota.png" alt="Mascota Toky" className="fig-perfil-mascota-img" />
              <p className="fig-perfil-mascota-name">Toky</p>
              <div className="fig-perfil-mascota-items">
                <button type="button" className="fig-perfil-item-btn" disabled>
                  <div className="fig-perfil-item-icon">
                    <User size={18} color="#b0b8c9" />
                  </div>
                  <span>HAT</span>
                </button>
                <button type="button" className="fig-perfil-item-btn" disabled>
                  <div className="fig-perfil-item-icon">
                    <User size={18} color="#b0b8c9" />
                  </div>
                  <span>SHIRT</span>
                </button>
                <button type="button" className="fig-perfil-item-btn" disabled>
                  <div className="fig-perfil-item-icon">
                    <Star size={18} color="#b0b8c9" />
                  </div>
                  <span>ACCESSORY</span>
                </button>
              </div>
            </div>
          </article>

          {/* Temporada activa */}
          <article className="fig-perfil-card">
            <div className="fig-perfil-card-head">
              <div>
                <p className="fig-perfil-card-title">Temporada activa: Axo Squad</p>
                <span className="fig-perfil-division-label">DIVISIÓN PLATA</span>
              </div>
              <Trophy size={18} color="#4a77e3" />
            </div>
            <div className="fig-perfil-progress-labels">
              <span>1,300 pts</span>
              <span>META: 2,000 PTS</span>
            </div>
            <div className="fig-perfil-progress">
              <div style={{ width: "65%" }} />
            </div>
          </article>

          {/* Stats 2×2 */}
          <div className="fig-perfil-stats-grid">
            <article className="fig-perfil-stat-card">
              <CheckCircle2 size={20} className="fig-perfil-stat-icon fig-perfil-stat-icon--blue" />
              <span className="fig-perfil-stat-card-label">RETOS COMPLETADOS</span>
              <span className="fig-perfil-stat-card-value">128</span>
            </article>
            <article className="fig-perfil-stat-card">
              <Flame size={20} className="fig-perfil-stat-icon fig-perfil-stat-icon--orange" />
              <span className="fig-perfil-stat-card-label">RACHA ACTUAL</span>
              <span className="fig-perfil-stat-card-value">5 días</span>
            </article>
            <article className="fig-perfil-stat-card">
              <LayoutList size={20} className="fig-perfil-stat-icon fig-perfil-stat-icon--teal" />
              <span className="fig-perfil-stat-card-label">TEMPORADAS</span>
              <span className="fig-perfil-stat-card-value">4</span>
            </article>
            <article className="fig-perfil-stat-card">
              <Star size={20} className="fig-perfil-stat-icon fig-perfil-stat-icon--purple" />
              <span className="fig-perfil-stat-card-label">MEJOR POSICIÓN</span>
              <span className="fig-perfil-stat-card-value">#12</span>
            </article>
          </div>

        </div>

        <BottomNav active="perfil" />
      </main>
    </>
  );
}
