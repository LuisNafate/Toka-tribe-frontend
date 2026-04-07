"use client";

interface LandingHeroProps {
  title: string;
  subtitle?: string;
  badge?: string;
  actions?: {
    primary: { label: string; onClick?: () => void };
    secondary?: { label: string; onClick?: () => void };
  };
  imageUrl?: string;
  variant?: "mobile" | "desktop";
}

export function LandingHero({
  title,
  subtitle,
  badge,
  actions,
  imageUrl,
  variant = "desktop",
}: LandingHeroProps) {
  return (
    <div className="hero-section-mobile" style={{ zIndex: 1, position: "relative" }}>
      {badge && (
        <div className="overlay-blur" style={{ marginBottom: "16px", display: "inline-block" }}>
          <span style={{ fontSize: "10px", fontWeight: "bold", letterSpacing: "1.5px", textTransform: "uppercase" }}>
            {badge}
          </span>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px" }}>
        <h1 style={{ fontSize: variant === "desktop" ? "3.75rem" : "2.75rem", fontWeight: 800, margin: 0, letterSpacing: "-0.06em", lineHeight: 1 }}>
          {title}
        </h1>

        {subtitle && (
          <p style={{ fontSize: "1.03rem", lineHeight: 1.65, margin: 0, opacity: 0.92, maxWidth: "58ch" }}>
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
          <button
            onClick={actions.primary.onClick}
            style={{
              background: "linear-gradient(135deg, var(--hero-blue), var(--hero-blue-light))",
              color: "#f1f2ff",
              border: "none",
              borderRadius: "9999px",
              padding: "16px 24px",
              fontWeight: 800,
              fontSize: "16px",
              cursor: "pointer",
              width: "100%",
              transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            {actions.primary.label}
          </button>

          {actions.secondary && (
            <button
              onClick={actions.secondary.onClick}
              style={{
                background: "white",
                color: "var(--hero-blue)",
                border: "none",
                borderRadius: "9999px",
                padding: "16px 24px",
                fontWeight: 800,
                fontSize: "16px",
                cursor: "pointer",
                width: "100%",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f8f9fc";
                e.currentTarget.style.boxShadow = "0 14px 32px rgba(7, 43, 105, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "white";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {actions.secondary.label}
            </button>
          )}
        </div>
      )}

      {imageUrl && (
        <div
          style={{
            position: "absolute",
            right: "-57px",
            top: "-45px",
            width: "245px",
            height: "309px",
          }}
        >
          <img src={imageUrl} alt="hero" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}
    </div>
  );
}
