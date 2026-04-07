import { BellRing, LifeBuoy, LockKeyhole } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Panel, SectionHeader } from "@/components/common";
import { settingsItems } from "@/lib/data";

export default function SettingsPage() {
  return (
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
  );
}
