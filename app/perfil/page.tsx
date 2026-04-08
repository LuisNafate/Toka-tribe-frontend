import { ShieldCheck, Sparkles, User } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Panel, SectionHeader } from "@/components/common";
import { MobileHamburgerMenu } from "@/components/mobile-hamburger-menu";
import BottomNav from "@/components/BottomNav";
import { FIGMA_ASSETS, profileHighlights } from "@/lib/data";

export default function PerfilPage() {
  return (
    <>
      <div className="fig-desktop-only">
        <AppShell title="Perfil" subtitle="Identidad, progreso y configuración personal">
          <div className="workspace__grid">
            <Panel>
              <SectionHeader eyebrow="Jugador" title="Andrea" description="Miembro activo de Axo Squad" />
              <div className="inline-row" style={{ alignItems: "center" }}>
                <img
                  src={FIGMA_ASSETS.dashboard.userPic}
                  alt="Andrea"
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

      <main className="fig-mobile-perfil fig-responsive-page fig-mobile-only">
        <header className="fig-mobile-topbar fig-perfil-topbar">
          <div className="fig-mobile-topbar__left">
            <MobileHamburgerMenu />
            <strong className="fig-perfil-brand">Perfil</strong>
          </div>
          <img src={FIGMA_ASSETS.dashboard.userPic} alt="Avatar" className="fig-perfil-avatar" />
        </header>

        <section className="fig-perfil-hero">
          <div className="fig-perfil-hero__content">
            <h1>Andrea</h1>
            <p className="fig-perfil-subtitle">Nivel Plata • Axo Squad</p>
          </div>
        </section>

        <div className="fig-perfil-main">
          <article className="fig-unified-card">
            <div className="fig-unified-head">
              <strong>Identidad</strong>
              <User size={16} />
            </div>
            <div className="fig-perfil-row">
              <img src={FIGMA_ASSETS.dashboard.userPic} alt="Andrea" style={{ width: 48, height: 48, borderRadius: 12 }} />
              <div>
                <h3 style={{ margin: 0 }}>Andrea</h3>
                <p style={{ margin: 0, fontSize: 12, color: "#666" }}>Miembro activo de Axo Squad</p>
              </div>
            </div>
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #e9ecf1" }}>
              <p style={{ fontSize: 12, color: "#666", margin: 0 }}>Participación constante y racha de equipo activa.</p>
            </div>
          </article>

          <article className="fig-unified-card fig-unified-card--soft">
            <div className="fig-unified-head">
              <strong>Autenticación</strong>
              <Sparkles size={16} style={{ color: "#5ef6e6" }} />
            </div>
            <h3>Single Sign-On</h3>
            <p className="fig-small-text">Acceso directo sin registro adicional. Progreso sincronizado en todo el ecosistema Toka.</p>
            <div style={{ marginTop: 8 }}>
              <span className="fig-status-pill">Conectado</span>
            </div>
          </article>

          <article className="fig-unified-card">
            <div className="fig-unified-head">
              <strong>Preferencias</strong>
            </div>
            <div className="fig-setting-item">
              <div>
                <h4 style={{ margin: "0 0 4px" }}>Perfil visible</h4>
                <p style={{ margin: 0, fontSize: 12, color: "#666" }}>Los miembros pueden ver tu avatar</p>
              </div>
              <span className="fig-pill-badge fig-pill-badge--active">Activo</span>
            </div>
            <div className="fig-setting-item" style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #e9ecf1" }}>
              <div>
                <h4 style={{ margin: "0 0 4px" }}>Alertas de temporada</h4>
                <p style={{ margin: 0, fontSize: 12, color: "#666" }}>Recibe recordatorios de cierre</p>
              </div>
              <span className="fig-pill-badge fig-pill-badge--active">Activo</span>
            </div>
          </article>
        </div>

        <BottomNav active="perfil" />
      </main>
    </>
  );
}
