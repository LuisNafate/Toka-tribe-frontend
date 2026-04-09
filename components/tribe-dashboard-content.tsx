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

const defaultMembers: Member[] = [
  {
    name: "Alix",
    note: "MVP de la semana",
    pts: "+450 pts",
    avatar: "http://localhost:3845/assets/9f93a0889bfd14e518b986a7a998c6d22eff79dc.png",
    top: true,
    tierLabel: "Oro",
    tierVariant: "oro",
  },
  {
    name: "Jeshua",
    note: "Activo hace 2h",
    pts: "+320 pts",
    avatar: "http://localhost:3845/assets/b0bd42ef8ce8629861e4e063ca86a7450cb7d934.png",
    tierLabel: "Plata",
    tierVariant: "plata",
  },
  {
    name: "Nafa",
    note: "En racha",
    pts: "+280 pts",
    avatar: "http://localhost:3845/assets/5c07578cebccf945e0e1b8a63ae53c78bda8b1a5.png",
    noTier: true,
  },
];

const defaultActivity: ActivityItem[] = [
  { actor: "Alix", action: "completó Toka Trivia", pointsLabel: "+40 pts", whenLabel: "hace 2h", variant: "navy" },
  { actor: "Jeshua", action: "completó Reflejos Tribe", pointsLabel: "+25 pts", whenLabel: "Ayer", variant: "teal" },
  { actor: "Tribe", action: "ascendió a Plata", pointsLabel: "Nueva división desbloqueada", whenLabel: "hace 3 días", variant: "blue", highlight: true },
];

export function TribeDashboardContent({ withoutTier = false, runtime }: TribeDashboardContentProps) {
  const [feedback, setFeedback] = useState<{ tone: "info" | "ok" | "warn"; text: string } | null>(null);

  const tierText = runtime?.tierText ?? (withoutTier ? "Sin Tier" : "PLATA");
  const tribeName = runtime?.tribeName ?? "Axo Squad";
  const pointsText = runtime?.pointsText ?? (withoutTier ? "1,640 pts" : "2,140 pts");
  const statusText = runtime?.statusText ?? (withoutTier ? "Tu tribe aun no tiene tier asignado" : "Multiplicador x1,3 activo");
  const progressPercent = runtime?.progressPercent ?? (withoutTier ? 61 : 92);
  const progressHint = runtime?.progressHint ?? (withoutTier ? "Suma 360 pts para entrar a Bronce" : "A 120 pts de ascender · 92%");
  const rankingLabel = runtime?.rankingLabel ?? (withoutTier ? "Sin división" : "#4 en Plata");
  const membersTitle = runtime?.membersTitle ?? "Tu Tribe (7/10)";
  const currentStreakLabel = runtime?.currentStreakLabel ?? "5 días";
  const retosLabel = runtime?.retosLabel ?? "3/4 jugados";
  const members = runtime?.members && runtime.members.length > 0 ? runtime.members : defaultMembers;
  const activity = runtime?.activity && runtime.activity.length > 0 ? runtime.activity : defaultActivity;

  const tierActivationLabel = useMemo(() => {
    if (!withoutTier) {
      return "Tu membresía está activa y acumulando multiplicador.";
    }
    return "Membresía crítica: activa un tier para desbloquear multiplicador y recompensas de temporada.";
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

        {withoutTier ? (
          <Link href="/tribe/activar-tier" className="fig-tribe-redirect-cta">
            <span>Activa tu Tier esta temporada</span>
            <ChevronRight size={10} strokeWidth={3} />
          </Link>
        ) : null}

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
            {members.map((member) => (
              <article key={member.name} className={member.top ? "top" : ""}>
                <div className="fig-member-main">
                  <img src={member.avatar} alt={member.name} />
                  <div>
                    <div className="fig-member-note-row">
                      <h3>{member.name}</h3>
                      {member.noTier ? (
                        <span className="fig-member-tier-chip fig-member-tier-chip--none">(Sin Tier)</span>
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
