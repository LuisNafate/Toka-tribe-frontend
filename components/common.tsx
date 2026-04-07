import type { ReactNode } from "react";

type PanelProps = {
  children: ReactNode;
  className?: string;
};

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

type ProgressBarProps = {
  value: number;
  label?: string;
  suffix?: string;
  muted?: boolean;
};

export function Panel({ children, className = "" }: PanelProps) {
  return <section className={`panel ${className}`.trim()}>{children}</section>;
}

export function SectionHeader({ eyebrow, title, description, action }: SectionHeaderProps) {
  return (
    <div className="panel__header">
      <div>
        {eyebrow ? <p className="section-label">{eyebrow}</p> : null}
        <h2 className="panel__title" style={{ fontSize: "1.8rem", color: "var(--text)" }}>
          {title}
        </h2>
        {description ? <p className="panel__description" style={{ color: "var(--muted)" }}>{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function ProgressBar({ value, label, suffix, muted = false }: ProgressBarProps) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {(label || suffix) && (
        <div className="inline-row" style={{ justifyContent: "space-between" }}>
          <span className="subtle" style={{ color: muted ? "var(--muted)" : "inherit" }}>{label}</span>
          <strong style={{ color: muted ? "var(--text)" : "inherit" }}>{suffix ?? `${value}%`}</strong>
        </div>
      )}
      <div className={`progress ${muted ? "progress--muted" : ""}`}>
        <div className="progress__bar" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
