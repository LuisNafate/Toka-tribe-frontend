import { CircleDollarSign, Gift, Wallet } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Panel, ProgressBar, SectionHeader } from "@/components/common";
import { rewardCards } from "@/lib/data";

export default function RecompensasPage() {
  return (
    <AppShell title="Recompensas" subtitle="Wallet, canjes y beneficios del ecosistema">
      <div className="workspace__grid">
        <Panel>
          <SectionHeader eyebrow="Wallet Toka" title="$1,240 balance disponible" description="Tus recompensas pasan por la wallet simulada y quedan listas para canje." />
          <div className="metric-grid">
            <article className="metric-card"><div className="metric-card__icon"><Wallet size={18} /></div><div className="metric-card__value">$1,240</div><div className="metric-card__label">Saldo actual</div></article>
            <article className="metric-card"><div className="metric-card__icon"><Gift size={18} /></div><div className="metric-card__value">4</div><div className="metric-card__label">Recompensas listas</div></article>
            <article className="metric-card"><div className="metric-card__icon"><CircleDollarSign size={18} /></div><div className="metric-card__value">92%</div><div className="metric-card__label">Tribe elegible</div></article>
          </div>
          <div style={{ marginTop: 20 }}>
            <ProgressBar value={72} label="Progreso a siguiente canje" suffix="72%" muted />
          </div>
        </Panel>

        <div className="dashboard-side">
          <Panel className="muted-card">
            <span className="status-pill">Disponible ahora</span>
            <h3>$50 en saldo Toka</h3>
            <p>Recompensa disponible por racha y consistencia semanal.</p>
            <button className="button button--primary full-width" style={{ marginTop: 14 }} type="button">Reclamar</button>
          </Panel>

          <Panel>
            <SectionHeader eyebrow="Canjes" title="Historial reciente" description="Registro de recompensas y micro-transacciones." />
            <div className="timeline">
              <div className="timeline-row"><div className="timeline-dot" /><div><strong>Recompensa canjeada</strong><p>$20 saldo</p></div><span className="subtle">Hoy</span></div>
              <div className="timeline-row"><div className="timeline-dot" /><div><strong>Racha semanal</strong><p>+85 pts</p></div><span className="subtle">Ayer</span></div>
            </div>
          </Panel>
        </div>
      </div>

      <div className="reward-grid" style={{ marginTop: 18 }}>
        {rewardCards.map((item) => (
          <article key={item.title} className="reward-card">
            <span className="reward-pill">{item.status}</span>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
