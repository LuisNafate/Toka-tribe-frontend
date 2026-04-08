"use client";

import { formatAppPoints, useAppPoints } from "@/components/use-app-points";

type AppPointsBadgeProps = {
  label?: string;
  className?: string;
};

export function AppPointsBadge({ label = "Puntos de la app", className }: AppPointsBadgeProps) {
  const { points } = useAppPoints();

  return (
    <div className={`balance-pill ${className ?? ""}`.trim()} aria-label={label}>
      {formatAppPoints(points)} pts
    </div>
  );
}