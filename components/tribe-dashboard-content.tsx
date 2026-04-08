import Link from "next/link";
import { FIGMA_ASSETS } from "@/lib/data";

type TribeDashboardContentProps = {
  withoutTier?: boolean;
};

type Member = {
  name: string;
  note: string;
  pts: string;
  avatar: string;
  top?: boolean;
  tierLabel?: string;
  noTier?: boolean;
};

const members: Member[] = [
  {
    name: "Alix",
    note: "MVP de la semana",
    pts: "+450 pts",
    avatar: "http://localhost:3845/assets/9f93a0889bfd14e518b986a7a998c6d22eff79dc.png",
    top: true,
    tierLabel: "Oro",
  },
  {
    name: "Jeshua",
    note: "Activo hace 2h",
    pts: "+320 pts",
    avatar: "http://localhost:3845/assets/b0bd42ef8ce8629861e4e063ca86a7450cb7d934.png",
    tierLabel: "Plata",
  },
  {
    name: "Nafa",
    note: "En racha 🔥",
    pts: "+280 pts",
    avatar: "http://localhost:3845/assets/5c07578cebccf945e0e1b8a63ae53c78bda8b1a5.png",
    noTier: true,
  },
];

export function TribeDashboardContent({ withoutTier = false }: TribeDashboardContentProps) {
  const tierText = withoutTier ? "Sin Tier" : "PLATA";
  const pointsText = withoutTier ? "1,640 pts" : "2,140 pts";
  const statusText = withoutTier ? "Tu tribe aun no tiene tier asignado" : "Multiplicador x1,3 activo";

  return (
    <>
      <div className="fig-tribe-responsive-top">
        <section className="fig-tribe-hero">
          <div className="fig-tribe-hero-top">
            <span>{tierText}</span>
            <h1>Axo Squad</h1>
            {withoutTier ? <small className="fig-tribe-hero-subtitle">Sigue jugando para desbloquear tu primer tier</small> : null}
          </div>
          <img src={FIGMA_ASSETS.landing.hero} alt="Mascot" draggable="false" />
          <p>
            <strong>{pointsText}</strong> esta semana
          </p>
          <div className="fig-tribe-hero-chip">{statusText}</div>
          <div className="fig-mobile-progress-track">
            <div style={{ width: withoutTier ? "61%" : "92%" }} />
          </div>
          <small>{withoutTier ? "Suma 360 pts para entrar a Bronce" : "A 120 pts de ascender · 92%"}</small>
        </section>

        <section className="fig-tribe-stats">
          <article className="wide">
            <p>Racha de la Tribe</p>
            <h3>5 dias 🔥</h3>
          </article>
          <article>
            <p>RETOS</p>
            <h3>3/4 jugados</h3>
          </article>
          <article>
            <p>RANKING</p>
            <h3>{withoutTier ? "Sin división" : "#4 en Plata"}</h3>
          </article>
        </section>
      </div>

      <div className="fig-tribe-responsive-bottom">
        <section className="fig-tribe-members">
          <div className="fig-tribe-section-head">
            <h2>Tu Tribe (7/10)</h2>
            <button type="button" className="fig-tribe-link-btn">Ver todos</button>
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
                      ) : member.tierLabel ? (
                        <span className="fig-member-tier-chip">{member.tierLabel}</span>
                      ) : null}
                    </div>
                    <p>{member.note}</p>
                  </div>
                </div>
                <strong>{member.pts}</strong>
              </article>
            ))}
            <button type="button">Invitar miembro</button>
          </div>
        </section>

        <section className="fig-tribe-activity">
          <h2>Actividad reciente</h2>
          <article>
            <div>
              <strong>Alix</strong> completó Toka Trivia
              <p>+40 pts</p>
            </div>
            <span>hace 2h</span>
          </article>
          <article>
            <div>
              <strong>Jeshua</strong> completó Reflejos Tribe
              <p>+25 pts</p>
            </div>
            <span>Ayer</span>
          </article>
          <article className="highlight">
            <div>
              <strong>Tribe ascendió a Plata</strong>
              <p>Nueva división desbloqueada</p>
            </div>
            <span>hace 3 días</span>
          </article>
        </section>
      </div>

      <Link href="/retos" className="fig-tribe-play-btn fig-tribe-play-btn--responsive">
        Jugar reto de hoy
      </Link>
    </>
  );
}
