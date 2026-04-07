import Link from "next/link";
import { FIGMA_ASSETS } from "@/lib/data";
import { AppShell } from "@/components/app-shell";

const members = [
  { name: "Alix", note: "MVP de la semana", pts: "+450 pts", avatar: "http://localhost:3845/assets/9f93a0889bfd14e518b986a7a998c6d22eff79dc.png", top: true },
  { name: "Jeshua", note: "Activo hace 2h", pts: "+320 pts", avatar: "http://localhost:3845/assets/b0bd42ef8ce8629861e4e063ca86a7450cb7d934.png" },
  { name: "Nafa", note: "En racha 🔥", pts: "+280 pts", avatar: "http://localhost:3845/assets/5c07578cebccf945e0e1b8a63ae53c78bda8b1a5.png" },
];

export default function TribePage() {
  const content = (
    <>
      <div className="fig-tribe-responsive-top">
        <section className="fig-tribe-hero">
          <div className="fig-tribe-hero-top">
            <span>PLATA</span>
            <h1>Axo Squad</h1>
          </div>
          <img src={FIGMA_ASSETS.landing.hero} alt="Mascot" draggable="false" />
          <p>
            <strong>2,140 pts</strong> esta semana
          </p>
          <div className="fig-tribe-hero-chip">Multiplicador x1,3 activo</div>
          <div className="fig-mobile-progress-track">
            <div style={{ width: "92%" }} />
          </div>
          <small>A 120 pts de ascender · 92%</small>
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
            <h3>#4 en Plata</h3>
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
                    <h3>{member.name}</h3>
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

  return (
    <>
      <div className="fig-desktop-only">
        <AppShell title="Mi Tribe" subtitle="Rendimiento, miembros y actividad del equipo">
          {content}
        </AppShell>
      </div>

      <main className="fig-mobile-tribe fig-responsive-page fig-mobile-only">
        <header className="fig-mobile-topbar">
          <div className="fig-mobile-topbar__left">
            <span className="fig-mobile-menu">☰</span>
            <strong>TokaTribe</strong>
          </div>
        </header>

        {content}

        <nav className="fig-mobile-bottom-nav">
          <Link href="/dashboard">INICIO</Link>
          <Link href="/tribe" className="active">SQUAD</Link>
          <Link href="/retos">RETOS</Link>
          <Link href="/perfil">PERFIL</Link>
        </nav>
      </main>
    </>
  );
}
