"use client";

import Link from "next/link";
import { BarChart3, Brain, ChevronRight, Gamepad2, Medal, PlayCircle, TrendingUp, UserPlus, Zap } from "lucide-react";
import { useMemo, useState } from "react";

type TribeDashboardContentProps = {
  withoutTier?: boolean;
  runtime?: {
    tribeName?: string;
    tierText?: string;
    pointsText?: string;
    statusText?: string;
    progressPercent?: number;
    progressHint?: string;
    rankingLabel?: string;
    membersTitle?: string;
    currentStreakLabel?: string;
    retosLabel?: string;
    members?: Member[];
    activity?: ActivityItem[];
  };
};

export type Member = {
  name: string;
  note: string;
  pts: string;
  avatar: string;
  top?: boolean;
  tierLabel?: string;
  tierVariant?: "oro" | "plata";
  noTier?: boolean;
};

export type ActivityItem = {
  actor: string;
  action: string;
  pointsLabel: string;
  whenLabel: string;
  variant?: "navy" | "teal" | "blue";
  highlight?: boolean;
};

export function TribeDashboardContent({ withoutTier = false, runtime }: TribeDashboardContentProps) {
  const [feedback, setFeedback] = useState<{ tone: "info" | "ok" | "warn"; text: string } | null>(null);

  const tierText = runtime?.tierText ?? "NO SINCRONIZADO";
  const tribeName = runtime?.tribeName ?? "Tribe no sincronizada";
  const pointsText = runtime?.pointsText ?? "0 pts";
  const statusText = runtime?.statusText ?? "Sin respuesta de tribu por ahora";
  const progressPercent = runtime?.progressPercent ?? 0;
  const progressHint = runtime?.progressHint ?? "La progresion se muestra al cargar los datos";
  const rankingLabel = runtime?.rankingLabel ?? "Division no sincronizada";
  const membersTitle = runtime?.membersTitle ?? "Tu Tribe";
  const currentStreakLabel = runtime?.currentStreakLabel ?? "0 días";
  const retosLabel = runtime?.retosLabel ?? "0/0 jugados";
  const members = runtime?.members ?? [];
  const activity = runtime?.activity ?? [];

  const tierActivationLabel = useMemo(() => {
    if (!withoutTier) {
      return "Tu membresía está activa y acumulando multiplicador.";
    }
    return "Membresía crítica: activa un tier para desbloquear multiplicador y recompensas de temporada.";
  }, [withoutTier]);

  const tierCtaLabel = useMemo(() => {
    if (withoutTier) {
      return "Comprar membresías del tier";
    }

    return "Gestionar membresías del tier";
  }, [withoutTier]);

  const feedbackToneClass = feedback?.tone === "ok"
    ? "fig-tribe-feedback--ok"
    : feedback?.tone === "warn"
      ? "fig-tribe-feedback--warn"
      : "fig-tribe-feedback--info";

  return (
    <>
      <div className="fig-tribe-responsive-top">
        <section className="fig-tribe-hero">
          <div className="fig-tribe-hero-top">
            <span>
              <Medal size={11} />
              {tierText}
            </span>
            <h1>{tribeName}</h1>
            {withoutTier ? <small className="fig-tribe-hero-subtitle">Sigue jugando para desbloquear tu primer tier</small> : null}
          </div>
          <img src={withoutTier ? "/images/ajolote_4.png" : "/images/ajolote_2.png"} alt="Mascot" draggable="false" />
          <p>
            <strong>{pointsText}</strong> esta semana
          </p>
          <div className="fig-tribe-hero-chip">{statusText}</div>
          <div className="fig-mobile-progress-track">
            <div style={{ width: `${progressPercent}%` }} />
          </div>
          <small>
            <TrendingUp size={11} />
            {progressHint}
          </small>
        </section>

        <Link href="/tribe/activar-tier" className="fig-tribe-redirect-cta" aria-label={tierCtaLabel}>
          <span>{tierCtaLabel}</span>
          <ChevronRight size={10} strokeWidth={3} />
        </Link>

        <section className="fig-tribe-stats">
          <article className="fig-tribe-stat-racha">
            <div>
              <p>Racha de la Tribe</p>
              <h3>{currentStreakLabel} 🔥</h3>
            </div>
            <Zap size={34} className="fig-tribe-stat-zap" fill="currentColor" />
          </article>
          <div className="fig-tribe-stat-pair">
            <article>
              <Gamepad2 size={17} className="fig-tribe-stat-icon" />
              <p>RETOS</p>
              <h3>{retosLabel}</h3>
            </article>
            <article>
              <BarChart3 size={17} className="fig-tribe-stat-icon" />
              <p>RANKING</p>
              <h3>{rankingLabel}</h3>
            </article>
          </div>
        </section>
      </div>

      <div className="fig-tribe-responsive-bottom">
        <section className="fig-tribe-members">
          <div className="fig-tribe-section-head">
            <h2>{membersTitle}</h2>
            <button
              type="button"
              className="fig-tribe-link-btn"
              onClick={() => setFeedback({ tone: "info", text: "Vista completa de miembros habilitada para la próxima iteración." })}
            >
              Ver todos
            </button>
          </div>
          <div className="fig-tribe-members-card">
            {members.length === 0 ? <p className="subtle">Sin miembros sincronizados.</p> : null}
            {members.map((member) => (
              <article key={member.name} className={member.top ? "top" : ""}>
                <div className="fig-member-main">
                  <img src={member.avatar} alt={member.name} />
                  <div>
                    <div className="fig-member-note-row">
                      <h3>{member.name}</h3>
                      {member.noTier ? (
                        <span className="fig-member-tier-chip fig-member-tier-chip--none">(Sin tier)</span>
                      ) : member.tierVariant === "oro" ? (
                        <span className="fig-member-tier-chip fig-member-tier-chip--oro">{member.tierLabel}</span>
                      ) : member.tierVariant === "plata" ? (
                        <span className="fig-member-tier-chip fig-member-tier-chip--plata">{member.tierLabel}</span>
                      ) : member.tierLabel ? (
                        <span className="fig-member-tier-chip">{member.tierLabel}</span>
                      ) : null}
                    </div>
                    <p>{member.note}</p>
                  </div>
                </div>
                <strong className={member.top ? "fig-member-pts-top" : ""}>{member.pts}</strong>
              </article>
            ))}
            <button
              type="button"
              className="fig-tribe-invite-btn"
              onClick={() => setFeedback({ tone: "ok", text: "Invitación enviada. Te avisaremos cuando el miembro acepte." })}
            >
              <UserPlus size={15} />
              Invitar miembro
            </button>
          </div>
        </section>

        <section className="fig-tribe-activity">
          <h2>Actividad reciente</h2>
          {activity.length === 0 ? <p className="subtle">Sin actividad sincronizada.</p> : null}
          {activity.map((item) => (
            <article key={`${item.actor}-${item.action}`} className={item.highlight ? "highlight" : ""}>
              <div className={`fig-tribe-activity-icon fig-tribe-activity-icon--${item.variant ?? "navy"}`}>
                {item.highlight ? <TrendingUp size={16} /> : item.variant === "teal" ? <Zap size={16} /> : <Brain size={16} />}
              </div>
              <div>
                <div><strong>{item.actor}</strong> {item.action}</div>
                <p>{item.pointsLabel}</p>
              </div>
              <span>{item.whenLabel}</span>
            </article>
          ))}
        </section>

        <Link href="/retos" className="fig-tribe-play-cta">
          <PlayCircle size={18} />
          Jugar reto de hoy
        </Link>
      </div>

      <p className="subtle" style={{ marginTop: 10 }}>{tierActivationLabel}</p>

      {feedback ? (
        <section className={`fig-tribe-feedback ${feedbackToneClass}`} role="status" aria-live="polite">
          <p>{feedback.text}</p>
        </section>
      ) : null}
    </>
  );
}
