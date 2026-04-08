import { ShieldCheck, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Panel, SectionHeader } from "@/components/common";
import { FIGMA_ASSETS, profileHighlights } from "@/lib/data";

export default function PerfilPage() {
  return (
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
  );
}
