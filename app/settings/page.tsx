import { BellRing, LifeBuoy, LockKeyhole, Settings } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Panel, SectionHeader } from "@/components/common";
import { MobileHamburgerMenu } from "@/components/mobile-hamburger-menu";
import BottomNav from "@/components/BottomNav";
import { settingsItems } from "@/lib/data";

export default function SettingsPage() {
  return (
    <>
      <div className="fig-desktop-only">
        <AppShell title="Configuración" subtitle="Privacidad, soporte y preferencias del producto">
          <div className="workspace__grid">
            <Panel>
              <SectionHeader eyebrow="Cuenta" title="Ajustes del producto" description="Mantén el control del perfil y de la experiencia de la mini app." />
              <div className="settings-grid">
                {settingsItems.map((item, index) => {
                  const icons = [LockKeyhole, BellRing, LifeBuoy, LifeBuoy];
                  const Icon = icons[index] ?? LifeBuoy;

                  return (
                    <article key={item.title} className="setting-card">
                      <div className="inline-row" style={{ justifyContent: "space-between" }}>
                        <div className="inline-row">
                          <div className="mini-icon"><Icon size={18} /></div>
                          <div>
                            <h3>{item.title}</h3>
                            <p>{item.description}</p>
                          </div>
                        </div>
                        <span className="reward-pill">Editar</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </Panel>

            <div className="dashboard-side">
              <Panel className="muted-card">
                <span className="status-pill">SSO Toka</span>
                <h3>Autenticación centralizada</h3>
                <p>El acceso nativo evita fricción y mantiene la continuidad entre juegos, wallet y recompensas.</p>
              </Panel>

              <Panel>
                <SectionHeader eyebrow="Soporte" title="Rutas de ayuda" description="Contacto, preguntas frecuentes y escalamiento." />
                <div className="stack stack--tight">
                  <p>• Acceso y credenciales</p>
                  <p>• Wallet y recompensas</p>
                  <p>• Problemas en retos</p>
                  <p>• Reporte de actividad</p>
                </div>
              </Panel>
            </div>
          </div>
        </AppShell>
      </div>

      <main className="fig-mobile-settings fig-responsive-page fig-mobile-only">
        <header className="fig-mobile-topbar fig-settings-topbar">
          <div className="fig-mobile-topbar__left">
            <MobileHamburgerMenu />
            <strong className="fig-settings-brand">Configuración</strong>
          </div>
          <div style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Settings size={20} style={{ color: "#2a55b9" }} />
          </div>
        </header>

        <section className="fig-settings-hero">
          <h1>Ajustes</h1>
          <p>Controla tu experiencia y privacidad</p>
        </section>

        <div className="fig-settings-main">
          <article className="fig-unified-card">
            <div className="fig-unified-head">
              <strong>Cuenta</strong>
              <LockKeyhole size={16} />
            </div>
            <h3>Ajustes del producto</h3>
            <p className="fig-small-text">Mantén el control del perfil y de la experiencia de la mini app.</p>
            {settingsItems.slice(0, 2).map((item) => (
              <div key={item.title} className="fig-setting-row" style={{ marginTop: 12 }}>
                <div>
                  <h4 style={{ margin: "0 0 4px" }}>{item.title}</h4>
                  <p style={{ margin: 0, fontSize: 12, color: "#666" }}>{item.description}</p>
                </div>
                <span className="fig-pill-badge fig-pill-badge--edit">Editar</span>
              </div>
            ))}
          </article>

          <article className="fig-unified-card fig-unified-card--soft">
            <div className="fig-unified-head">
              <strong>Autenticación</strong>
              <LockKeyhole size={16} style={{ color: "#5d89e4" }} />
            </div>
            <h3>SSO Toka</h3>
            <p className="fig-small-text">El acceso nativo evita fricción y mantiene la continuidad entre juegos, wallet y recompensas.</p>
            <div style={{ marginTop: 8 }}>
              <span className="fig-status-pill">Autorizado</span>
            </div>
          </article>

          <article className="fig-unified-card">
            <div className="fig-unified-head">
              <strong>Soporte</strong>
              <LifeBuoy size={16} />
            </div>
            <h3>Rutas de ayuda</h3>
            <p className="fig-small-text">Contacto, preguntas frecuentes y escalamiento.</p>
            <div style={{ marginTop: 12, fontSize: 12, color: "#666", lineHeight: 1.8 }}>
              <p style={{ margin: "4px 0" }}>• Acceso y credenciales</p>
              <p style={{ margin: "4px 0" }}>• Wallet y recompensas</p>
              <p style={{ margin: "4px 0" }}>• Problemas en retos</p>
              <p style={{ margin: "4px 0" }}>• Reporte de actividad</p>
            </div>
          </article>

          <article className="fig-unified-card">
            <div className="fig-unified-head">
              <strong>Notificaciones</strong>
              <BellRing size={16} />
            </div>
            <div className="fig-setting-row" style={{ marginTop: 8 }}>
              <div>
                <h4 style={{ margin: "0 0 4px" }}>Alertas en vivo</h4>
                <p style={{ margin: 0, fontSize: 12, color: "#666" }}>Notificaciones de retos y temporada</p>
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
