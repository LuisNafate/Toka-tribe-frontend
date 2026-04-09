"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import BottomNav from "@/components/BottomNav";
import { MobileHamburgerMenu } from "@/components/mobile-hamburger-menu";
import { TribeDashboardContent, type ActivityItem, type Member } from "@/components/tribe-dashboard-content";
import { TokaApi } from "@/services/toka-api.service";
import { readAppPoints } from "@/components/use-app-points";
import { useTribe } from "@/hooks/useTribe";

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function toText(value: unknown): string | null {
  if (typeof value === "string" && value.trim() !== "") return value.trim();
  return null;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, ""));
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function tierVariant(label: string): "oro" | "plata" | undefined {
  const lower = label.toLowerCase();
  if (lower.includes("oro")) return "oro";
  if (lower.includes("plat")) return "plata";
  return undefined;
}

export default function TribePage() {
  const router = useRouter();
  const { isLeader, leaveTribe, toast } = useTribe();
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [withoutTier, setWithoutTier] = useState(false);
  const [runtimeData, setRuntimeData] = useState<{
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
  } | undefined>(undefined);

  useEffect(() => {
    async function loadTribe() {
      const points = readAppPoints();
      const usersMe = await Promise.allSettled([TokaApi.usersMe(), TokaApi.authMe(), TokaApi.gameSessionsMe()]);

      const usersData = usersMe[0].status === "fulfilled" ? usersMe[0].value.data : null;
      const authData = usersMe[1].status === "fulfilled" ? usersMe[1].value.data : null;
      const sessionsData = usersMe[2].status === "fulfilled" ? usersMe[2].value.data : null;

      const root = { usersData, authData };

      const tribeId =
        toText(toRecord(usersData)?.tribeId) ??
        toText(toRecord(toRecord(usersData)?.tribe)?.id) ??
        toText(toRecord(authData)?.tribeId) ??
        null;

      const tierLabel =
        toText(toRecord(usersData)?.tier) ??
        toText(toRecord(toRecord(usersData)?.tribe)?.tier) ??
        toText(toRecord(authData)?.tier) ??
        "No sincronizado";

      const hasNoTier = tierLabel.toLowerCase().includes("sin") || tierLabel.toLowerCase().includes("none");
      setWithoutTier(hasNoTier);

      let tribeName =
        toText(toRecord(usersData)?.tribeName) ??
        toText(toRecord(toRecord(usersData)?.tribe)?.name) ??
        "Tribe no sincronizada";

      let members: Member[] = [];
      let memberCount = toNumber(toRecord(toRecord(usersData)?.tribe)?.memberCount) ?? 0;
      let maxMembers = toNumber(toRecord(toRecord(usersData)?.tribe)?.maxMembers) ?? 10;
      let rankingLabel = "Division no sincronizada";

      if (tribeId) {
        const [detailResult, membersResult, historyResult] = await Promise.allSettled([
          TokaApi.tribesDetail(tribeId),
          TokaApi.tribesMembers(tribeId),
          TokaApi.leaderboardTribeHistory(tribeId),
        ]);

        if (detailResult.status === "fulfilled") {
          const detail = toRecord(detailResult.value.data);
          tribeName = toText(detail?.name) ?? toText(detail?.tribeName) ?? tribeName;
          memberCount = toNumber(detail?.memberCount) ?? memberCount;
          maxMembers = toNumber(detail?.maxMembers) ?? maxMembers;
          const division = toText(detail?.division) ?? toText(detail?.tier) ?? null;
          const rank = toNumber(detail?.rank) ?? null;
          if (division && rank !== null) {
            rankingLabel = `#${rank} en ${division}`;
          }
        }

        if (membersResult.status === "fulfilled") {
          const payload = membersResult.value.data;
          const list = Array.isArray(payload)
            ? payload
            : Array.isArray(toRecord(payload)?.members)
              ? (toRecord(payload)?.members as unknown[])
              : [];

          const parsedMembers: Member[] = [];
          for (const item of list) {
            const rec = toRecord(item);
            if (!rec) continue;
            const name = toText(rec.username) ?? toText(rec.name) ?? toText(rec.displayName) ?? "Miembro";
            const score = toNumber(rec.points) ?? toNumber(rec.score) ?? 0;
            const tier = toText(rec.tier) ?? "";
            const avatar = toText(rec.avatarUrl) ?? toText(rec.avatar) ?? "/images/ajolotes_1.png";

            parsedMembers.push({
              name,
              note: "Miembro activo",
              pts: `+${score.toLocaleString("es-ES")} pts`,
              avatar,
              tierLabel: tier || undefined,
              tierVariant: tier ? tierVariant(tier) : undefined,
            });
          }

          members = parsedMembers.slice(0, 6);
        }

        if (historyResult.status === "fulfilled") {
          const payload = historyResult.value.data;
          const items = Array.isArray(payload)
            ? payload
            : Array.isArray(toRecord(payload)?.items)
              ? (toRecord(payload)?.items as unknown[])
              : [];
          if (items.length > 0) {
            const latest = toRecord(items[0]);
            const rank = toNumber(latest?.rank);
            const division = toText(latest?.division);
            if (rank !== null && division) {
              rankingLabel = `#${rank} en ${division}`;
            }
          }
        }
      }

      const sessions = Array.isArray(sessionsData)
        ? sessionsData
        : Array.isArray(toRecord(sessionsData)?.sessions)
          ? (toRecord(sessionsData)?.sessions as unknown[])
          : [];

      const retosLabel = `${Math.min(4, sessions.length)}/4 jugados`;

      const activity: ActivityItem[] = sessions.slice(0, 3).map((item, index) => {
        const rec = toRecord(item);
        const gameType = toText(rec?.gameType) ?? "reto";
        const score = toNumber(rec?.score) ?? 0;
        return {
          actor: index === 0 ? "Tu Tribe" : "Miembro",
          action: `completó ${gameType}`,
          pointsLabel: `+${score.toLocaleString("es-ES")} pts`,
          whenLabel: index === 0 ? "hoy" : "reciente",
          variant: index === 1 ? "teal" : "navy",
        };
      });

      const progressPercent = Math.min(100, Math.max(0, Math.round((points / Math.max(points + 120, 1)) * 100)));

      setRuntimeData({
        tribeName,
        tierText: tierLabel.toUpperCase(),
        pointsText: `${points.toLocaleString("es-ES")} pts`,
        statusText: hasNoTier ? "Tu tribe aun no tiene tier asignado" : "Multiplicador y progresión activos",
        progressPercent,
        progressHint: `A ${Math.max(0, 120).toLocaleString("es-ES")} pts de ascender · ${progressPercent}%`,
        rankingLabel,
        membersTitle: `Tu Tribe (${memberCount}/${maxMembers})`,
        currentStreakLabel: `${Math.max(1, Math.min(10, sessions.length + 1))} días`,
        retosLabel,
        members,
        activity: activity.length > 0 ? activity : undefined,
      });
    }

    void loadTribe();
  }, []);

  async function handleLeave() {
    const result = await leaveTribe();
    if (result.success) router.push("/explorador-tribs");
    setConfirmLeave(false);
  }

  const content = <TribeDashboardContent withoutTier={withoutTier} runtime={runtimeData} />;

  const avatarUrl = useMemo(() => runtimeData?.members?.[0]?.avatar ?? "/images/ajolotes_1.png", [runtimeData]);

  return (
    <>
      <div className="fig-desktop-only">
        <AppShell title="Mi Tribe" subtitle="Estado actual, miembros y progreso competitivo">
          {content}
        </AppShell>
      </div>

      <main className="fig-mobile-tribe fig-responsive-page fig-mobile-only">
        <header className="fig-mobile-topbar">
          <div className="fig-mobile-topbar__left">
            <MobileHamburgerMenu />
            <strong>TokaTribe</strong>
          </div>
          <img src={avatarUrl} alt="Perfil" />
        </header>

        {content}

        {/* Leave tribe — solo para miembros no-líderes */}
        {!isLeader && (
          <button
            type="button"
            className="fig-tribe-leave-btn"
            onClick={() => setConfirmLeave(true)}
          >
            <LogOut size={15} />
            Salir de la Tribe
          </button>
        )}

        {/* Confirm dialog */}
        {confirmLeave && (
          <div className="fig-tribe-modal-overlay" onClick={() => setConfirmLeave(false)}>
            <div className="fig-tribe-modal" onClick={(e) => e.stopPropagation()}>
              <h3 className="fig-tribe-modal-title">¿Salir de la Tribe?</h3>
              <p className="fig-tribe-modal-body">Perderás tu progreso en esta temporada y tendrás que unirte a una nueva Tribe.</p>
              <div className="fig-tribe-modal-actions">
                <button type="button" className="fig-tribe-modal-cancel" onClick={() => setConfirmLeave(false)}>Cancelar</button>
                <button type="button" className="fig-tribe-modal-danger" onClick={() => void handleLeave()}>Sí, salir</button>
              </div>
            </div>
          </div>
        )}

        {toast && (
          <div className={`fig-mascota-toast fig-mascota-toast--${toast.type}`} role="status">
            {toast.text}
          </div>
        )}

        <BottomNav active="squad" />
      </main>
    </>
  );
}
