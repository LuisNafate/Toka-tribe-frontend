"use client";

interface TribeCardProps {
  name: string;
  avatarUrl: string;
  tier: "Oro" | "Plata" | "Bronce" | "Diamante";
  memberCount: number;
  maxMembers: number;
  pointsWeek: number;
  onJoin?: () => void;
}

export function TribeCard({
  name,
  avatarUrl,
  tier,
  memberCount,
  maxMembers,
  pointsWeek,
  onJoin,
}: TribeCardProps) {
  const formattedPoints = new Intl.NumberFormat("es-ES").format(pointsWeek);
  const memberFill = Math.min(100, Math.max(0, Math.round((memberCount / Math.max(maxMembers, 1)) * 100)));

  const getTierColor = () => {
    switch (tier) {
      case "Oro":
        return "rgba(70, 86, 181, 0.1)";
      case "Plata":
        return "rgba(192, 192, 192, 0.1)";
      case "Diamante":
        return "rgba(90, 248, 251, 0.1)";
      default:
        return "rgba(70, 86, 181, 0.1)";
    }
  };

  const getTierTextColor = () => {
    switch (tier) {
      case "Oro":
        return "#1a2b8c";
      case "Plata":
        return "#666666";
      case "Diamante":
        return "#0088cc";
      default:
        return "#1a2b8c";
    }
  };

  return (
    <div className="tribe-card">
      <div className="tribe-header">
        <div className="tribe-avatar">
          <img src={avatarUrl} alt={name} draggable="false" />
        </div>
        <div className="tribe-info">
          <h3 className="tribe-name">{name}</h3>
          <div className="tribe-badges">
            <span className="tribe-tier-badge" style={{ background: getTierColor(), color: getTierTextColor() }}>
              {tier}
            </span>
            <div className="tribe-members-progress" aria-label={`Capacidad de miembros ${memberCount}/${maxMembers}`}>
              <div className="tribe-members-progress__track">
                <span style={{ width: `${memberFill}%` }} />
              </div>
              <span className="tribe-members-progress__label">{memberCount}/{maxMembers} miembros</span>
            </div>
          </div>
        </div>
      </div>

      <div className="tribe-footer">
        <div>
          <p className="tribe-points-label">Puntos semana</p>
          <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
            <span className="tribe-points-display">{formattedPoints}</span>
            <span className="tribe-points-unit">pts</span>
          </div>
        </div>
        <button className="tribe-join-btn" onClick={onJoin}>
          Únirse
        </button>
      </div>
    </div>
  );
}
