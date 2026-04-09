"use client";

import { useEffect, useMemo, useState } from "react";
import { Crown } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { AppPointsBadge } from "@/components/app-points-badge";
import BottomNav from "@/components/BottomNav";
import { MobileHamburgerMenu } from "@/components/mobile-hamburger-menu";
import { Panel, SectionHeader } from "@/components/common";
import { TokaApi } from "@/services/toka-api.service";

type Division = "bronce" | "plata" | "oro";
type Zone = "up" | "down" | "neutral";

type TribeRank = {
  rank: number;
  name: string;
  pts: number;
  initials: string;
  color: string;
  isUser?: boolean;
  zone: Zone;
};

type MemberRank = {
  rank: number;
  userId: string;
  name: string;
  contributed: number;
  initials: string;
  role: "LEADER" | "MEMBER";
  isMe: boolean;
};

const DIV_LABELS: Record<Division, string> = {
  bronce: "Bronce",
  plata: "Plata",
  oro: "Oro",
};

const RANK_CIRCLE_CLASS: Record<number, string> = {
  1: "fig-lb-rank-circle--gold",
  2: "fig-lb-rank-circle--silver",
  3: "fig-lb-rank-circle--bronze",
};

const palette = ["#f97316", "#4a77e3", "#8b5cf6", "#10b981", "#ef4444", "#14b8a6", "#6366f1", "#64748b"];

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, ""));
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function toText(value: unknown): string | null {
  if (typeof value === "string" && value.trim() !== "") return value.trim();
  return null;
}

function initialsFromName(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "TR";
}

function zoneForRank(rank: number): Zone {
  if (rank <= 2) return "up";
  if (rank >= 7) return "down";
  return "neutral";
}

function normalizeDivision(raw: string): Division {
  const value = raw.toLowerCase();
  if (value.includes("oro")) return "oro";
  if (value.includes("bron")) return "bronce";
  return "plata";
}

function parsePts(rec: Record<string, unknown>): number | null {
  return (
    toNumber(rec.seasonPoints) ??
    toNumber(rec.points) ??
    toNumber(rec.score) ??
    toNumber(rec.totalPoints) ??
    toNumber(rec.pointsWeek) ??
    null
  );
}

function parseArrayIntoRows(arr: unknown[]): TribeRank[] {
  const rows: TribeRank[] = [];
  for (let i = 0; i < arr.length; i++) {
    const rec = toRecord(arr[i]);
    if (!rec) continue;
    const name = toText(rec.name) ?? toText(rec.tribeName) ?? toText(rec.teamName) ?? null;
    if (!name) continue;
    // rank: use field if present, otherwise use array index + 1
    const rank = toNumber(rec.rank) ?? toNumber(rec.position) ?? (i + 1);
    const pts = parsePts(rec) ?? 0;
    rows.push({
      rank, name, pts,
      initials: initialsFromName(name),
      color: palette[(rank - 1 + palette.length) % palette.length],
      isUser: Boolean(rec.isMine ?? rec.isCurrentUser ?? rec.me ?? false),
      zone: zoneForRank(rank),
    });
  }
  return rows;
}

function findArray(payload: unknown): unknown[] | null {
  if (Array.isArray(payload)) return payload;
  const rec = toRecord(payload);
  if (!rec) return null;
  for (const key of ["items", "data", "tribes", "results", "entries", "leaderboard"]) {
    if (Array.isArray(rec[key])) return rec[key] as unknown[];
  }
  // last resort: first array value found
  for (const val of Object.values(rec)) {
    if (Array.isArray(val) && val.length > 0) return val as unknown[];
  }
  return null;
}

function extractRows(payload: unknown): TribeRank[] {
  const arr = findArray(payload);
  if (!arr) return [];
  return parseArrayIntoRows(arr)
    .filter((item, idx, self) => self.findIndex((x) => x.name === item.name) === idx)
    .sort((a, b) => a.rank - b.rank);
}

function extractRowsWithDivision(payload: unknown): { row: TribeRank; division: Division }[] {
  const arr = findArray(payload);
  if (!arr) return [];
  const rows = parseArrayIntoRows(arr);
  return rows
    .filter((row, idx, self) => self.findIndex((x) => x.name === row.name) === idx)
    .map((row, idx) => {
      const rec = toRecord(arr[idx]);
      const divRaw = rec ? (toText(rec.division) ?? toText(rec.tier) ?? null) : null;
      return { row, division: divRaw ? normalizeDivision(divRaw) : "plata" as Division };
    });
}

function extractUserId(usersData: unknown, authData: unknown): string | null {
  const usersRec = toRecord(usersData);
  const authRec = toRecord(authData);
  return (
    toText(usersRec?.id) ?? toText(usersRec?.userId) ?? toText(usersRec?._id) ??
    toText(authRec?.id) ?? toText(authRec?.userId) ?? toText(authRec?._id) ??
    null
  );
}

function extractTribeId(usersData: unknown, authData: unknown): string | null {
  const usersRec = toRecord(usersData);
  const authRec = toRecord(authData);
  return (
    toText(usersRec?.tribeId) ??
    toText(toRecord(usersRec?.tribe)?.id) ??
    toText(toRecord(usersRec?.tribe)?._id) ??
    toText(authRec?.tribeId) ??
    toText(toRecord(authRec?.tribe)?.id) ??
    toText(toRecord(authRec?.tribe)?._id) ??
    null
  );
}

function extractTribeName(usersData: unknown, authData: unknown): string {
  const usersRec = toRecord(usersData);
  const authRec = toRecord(authData);
  return (
    toText(usersRec?.tribeName) ??
    toText(toRecord(usersRec?.tribe)?.name) ??
    toText(authRec?.tribeName) ??
    toText(toRecord(authRec?.tribe)?.name) ??
    "Mi Tribe"
  );
}

function extractMembers(payload: unknown, currentUserId: string | null): MemberRank[] {
  const list = findArray(payload);
  if (!list) return [];

  const rows: MemberRank[] = [];
  for (const item of list) {
    const rec = toRecord(item);
    if (!rec) continue;

    const userId = toText(rec.userId) ?? toText(rec.id) ?? toText(rec._id) ?? "";
    const name = toText(rec.username) ?? toText(rec.displayName) ?? toText(rec.name) ?? "Miembro";
    const contributed =
      toNumber(rec.pointsContributed) ??
      toNumber(rec.points) ??
      toNumber(rec.score) ??
      toNumber(rec.totalPoints) ??
      0;
    const role = rec.role === "LEADER" ? "LEADER" : "MEMBER";

    rows.push({
      rank: 0,
      userId,
      name,
      contributed,
      initials: initialsFromName(name),
      role,
      isMe: !!currentUserId && userId === currentUserId,
    });
  }

  rows.sort((a, b) => b.contributed - a.contributed);
  return rows
    .filter((item, idx, self) => self.findIndex((x) => x.userId !== "" ? x.userId === item.userId : x.name === item.name) === idx)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));
}

async function fetchDivisionRows(division: Division): Promise<unknown> {
  const upperDivision = DIV_LABELS[division].toUpperCase();
  try {
    const upperResponse = await TokaApi.leaderboardByDivision(upperDivision);
    return upperResponse.data ?? upperResponse;
  } catch {
    const lowerResponse = await TokaApi.leaderboardByDivision(division);
    return lowerResponse.data ?? lowerResponse;
  }
}

export default function LeaderboardPage() {
  const [activeDiv, setActiveDiv] = useState<Division>("plata");
  const [divisions, setDivisions] = useState<Record<Division, TribeRank[]>>({
    bronce: [],
    plata: [],
    oro: [],
  });
  const [weekLabel, setWeekLabel] = useState("Semana activa");
  const [warning, setWarning] = useState<string | null>(null);
  const [membersPodium, setMembersPodium] = useState<MemberRank[]>([]);
  const [memberWarning, setMemberWarning] = useState<string | null>(null);
  const [memberTribeName, setMemberTribeName] = useState<string>("Mi Tribe");

  useEffect(() => {
    async function loadLeaderboard() {
      setWarning(null);
      setMemberWarning(null);

      const [current, bronceRes, plataRes, oroRes, usersResult, authResult] = await Promise.allSettled([
        TokaApi.leaderboardCurrent(),
        fetchDivisionRows("bronce"),
        fetchDivisionRows("plata"),
        fetchDivisionRows("oro"),
        TokaApi.usersMe(),
        TokaApi.authMe(),
      ]);

      const next: Record<Division, TribeRank[]> = { bronce: [], plata: [], oro: [] };

      // Process division-specific endpoints first (most accurate)
      if (bronceRes.status === "fulfilled") {
        const raw = bronceRes.value;
        const rows = extractRows(raw);
        if (rows.length > 0) next.bronce = rows;
      }
      if (plataRes.status === "fulfilled") {
        const raw = plataRes.value;
        const rows = extractRows(raw);
        if (rows.length > 0) next.plata = rows;
      }
      if (oroRes.status === "fulfilled") {
        const raw = oroRes.value;
        const rows = extractRows(raw);
        if (rows.length > 0) next.oro = rows;
      }

      // /leaderboard/current — distribute tribes by their division field
      if (current.status === "fulfilled") {
        const raw = current.value.data ?? current.value;
        const rec = toRecord(raw);
        const seasonName = toText(rec?.seasonName ?? rec?.name ?? null);
        if (seasonName) setWeekLabel(seasonName);

        // Try to distribute all entries from current into their division buckets
        const allRows = extractRowsWithDivision(raw);
        for (const { row, division } of allRows) {
          const bucket = next[division];
          if (!bucket.some((r: TribeRank) => r.name === row.name)) {
            bucket.push(row);
          }
        }
        for (const div of ["bronce", "plata", "oro"] as Division[]) {
          next[div].sort((a: TribeRank, b: TribeRank) => a.rank - b.rank);
        }

        // Set active tab to first division that has data
        const firstWithData = (["oro", "plata", "bronce"] as Division[]).find((d) => next[d].length > 0);
        if (firstWithData) setActiveDiv(firstWithData);
      }

      setDivisions(next);

      const usersData = usersResult.status === "fulfilled" ? usersResult.value.data ?? null : null;
      const authData = authResult.status === "fulfilled" ? authResult.value.data ?? null : null;
      const tribeId = extractTribeId(usersData, authData);
      const currentUserId = extractUserId(usersData, authData);
      setMemberTribeName(extractTribeName(usersData, authData));

      if (tribeId) {
        const [membersResult, tribeDetailResult] = await Promise.allSettled([
          TokaApi.tribesMembers(tribeId),
          TokaApi.tribesDetail(tribeId),
        ]);

        if (membersResult.status === "fulfilled") {
          const parsed = extractMembers(membersResult.value.data ?? membersResult.value, currentUserId);
          setMembersPodium(parsed.slice(0, 3));
        } else {
          setMembersPodium([]);
          setMemberWarning("No se pudo sincronizar el ranking interno de tu Tribe.");
        }

        if (tribeDetailResult.status === "fulfilled") {
          const detail = toRecord(tribeDetailResult.value.data ?? tribeDetailResult.value);
          const detailName = toText(detail?.name) ?? toText(detail?.tribeName);
          if (detailName) setMemberTribeName(detailName);
        }
      } else {
        setMembersPodium([]);
      }

      const allEmpty = Object.values(next).every((arr) => arr.length === 0);
      const failedMainCalls = [current, bronceRes, plataRes, oroRes].filter((res) => res.status === "rejected").length;
      if (allEmpty) {
        setWarning("No hay datos de ranking disponibles aún. El snapshot se genera al finalizar la temporada.");
      } else if (failedMainCalls > 0) {
        setWarning("Algunas divisiones no pudieron sincronizarse. Mostramos los datos disponibles.");
      }
    }

    void loadLeaderboard();
  }, []);

  const teams = divisions[activeDiv];
  const podium = teams.length >= 3 ? [teams[1], teams[0], teams[2]] : [];
  const listTeams = teams.slice(3);
  const userTribe = teams.find((team) => team.isUser) ?? teams[1] ?? teams[0];
  const teamAbove = teams.find((team) => team.rank === Math.max(1, (userTribe?.rank ?? 2) - 1)) ?? teams[0] ?? userTribe;
  const ptsNeeded = Math.max(0, (teamAbove?.pts ?? 0) - (userTribe?.pts ?? 0));
  const progressPct = teamAbove?.pts ? Math.min(100, Math.round(((userTribe?.pts ?? 0) / teamAbove.pts) * 100)) : 0;

  return (
    <>
      <div className="fig-desktop-only">
        <AppShell
          title="Leaderboard"
          subtitle="Ranking por división y temporada"
          headerBadge={<AppPointsBadge />}
        >
          <div className="workspace__grid">
            <Panel>
              <SectionHeader
                eyebrow={`División ${DIV_LABELS[activeDiv]}`}
                title="Clasificación semanal"
                description="Las posiciones cambian conforme tu Tribe suma puntos."
                action={<span className="badge">{weekLabel}</span>}
              />
              {warning ? <p className="subtle">{warning}</p> : null}
              {teams.length === 0 ? <p className="subtle">No hay datos de ranking disponibles para esta división.</p> : null}
              <div className="leaderboard-list">
                {teams.map((row) => (
                  <div
                    key={`${row.rank}-${row.name}`}
                    className={`leaderboard-row ${row.isUser ? "leaderboard-row--highlight" : ""}`}
                  >
                    <div className="rank">{row.rank}</div>
                    <div className="avatar" style={{ width: 40, height: 40 }}>{row.initials}</div>
                    <div>
                      <div className="team-name">{row.name}</div>
                      <div className="subtle">Progreso semanal</div>
                    </div>
                    <div className="score">{row.pts.toLocaleString("es-ES")}</div>
                  </div>
                ))}
              </div>
            </Panel>
            <div className="dashboard-side">
              <Panel className="muted-card">
                <span className="status-pill">Top 3</span>
                <h3 style={{ fontSize: "1.55rem" }}>Puntos por estabilidad</h3>
                <p>La retención de la Tribe depende de la suma colectiva diaria y el cierre de temporada.</p>
              </Panel>
              <Panel>
                <SectionHeader
                  eyebrow="Ranking interno"
                  title={`Top 3 de ${memberTribeName}`}
                  description="Miembros con mayor aporte acumulado en la temporada."
                />
                {memberWarning ? <p className="subtle">{memberWarning}</p> : null}
                {membersPodium.length === 0 ? <p className="subtle">No hay ranking interno disponible por ahora.</p> : null}
                <div className="leaderboard-list">
                  {membersPodium.map((member) => (
                    <div key={`${member.userId || member.name}-${member.rank}`} className={`leaderboard-row ${member.isMe ? "leaderboard-row--highlight" : ""}`}>
                      <div className="rank">{member.rank}</div>
                      <div className="avatar" style={{ width: 40, height: 40 }}>{member.initials}</div>
                      <div>
                        <div className="team-name">{member.name}</div>
                        <div className="subtle">{member.role === "LEADER" ? "Líder" : "Miembro"}</div>
                      </div>
                      <div className="score">{member.contributed.toLocaleString("es-ES")}</div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </div>
        </AppShell>
      </div>

      <main className="fig-lb-page fig-mobile-only">
        <header className="fig-lb-header">
          <div className="fig-lb-header-left">
            <MobileHamburgerMenu />
            <span className="fig-lb-brand">TokaTribe</span>
          </div>
          <div className="fig-retos-avatar">
            <img src="/images/ajolote_2.png" alt="Avatar" />
          </div>
        </header>

        <div className="fig-lb-tabs">
          {(["bronce", "plata", "oro"] as Division[]).map((div) => (
            <button
              key={div}
              type="button"
              className={`fig-lb-tab${activeDiv === div ? ` fig-lb-tab--active fig-lb-tab--${div}` : ""}`}
              onClick={() => setActiveDiv(div)}
            >
              {DIV_LABELS[div]}
            </button>
          ))}
        </div>

        <div className="fig-lb-hero">
          <div>
            <h2 className="fig-lb-hero-title">Liga TokaTribe</h2>
            <p className="fig-lb-hero-sub">{weekLabel}</p>
          </div>
          {userTribe ? (
            <span className="fig-lb-hero-chip">
              {userTribe.name.toUpperCase()} · #{userTribe.rank} EN {DIV_LABELS[activeDiv].toUpperCase()}
            </span>
          ) : null}
        </div>

        <section className="fig-lb-podium">
          {podium.length === 0 ? <p className="subtle">Sin podio sincronizado desde backend.</p> : null}
          {podium.map((team, i) => {
            const isFirst = i === 1;
            return (
              <div
                key={team.name}
                className={`fig-lb-podium-slot${isFirst ? " fig-lb-podium-slot--first" : ""}`}
              >
                {isFirst && (
                  <Crown size={22} className="fig-lb-crown" fill="currentColor" />
                )}
                <div className={`fig-lb-podium-card${isFirst ? " fig-lb-podium-card--first" : ""}`}>
                  <div
                    className="fig-lb-podium-avatar"
                    style={{ background: team.color }}
                  >
                    {team.initials}
                    {team.isUser && <span className="fig-lb-you-dot" />}
                  </div>
                  <p className="fig-lb-podium-pts">{team.pts.toLocaleString("es-ES")} pts</p>
                  <p className="fig-lb-podium-name">{team.name}</p>
                </div>
                <div className={`fig-lb-rank-circle ${RANK_CIRCLE_CLASS[team.rank] ?? ""}`}>
                  {team.rank}
                </div>
              </div>
            );
          })}
        </section>

        <section className="fig-lb-list">
          {listTeams.map((team) => (
            <div
              key={team.name}
              className={`fig-lb-row${team.isUser ? " fig-lb-row--user" : ""}`}
            >
              <span className="fig-lb-row-rank">{team.rank}</span>
              <div className="fig-lb-row-avatar-wrap">
                {team.isUser && (
                  <span className="fig-lb-tu-equipo">TU EQUIPO</span>
                )}
                <div
                  className="fig-lb-row-avatar"
                  style={{ background: team.color }}
                >
                  {team.initials}
                </div>
              </div>
              <span className="fig-lb-row-name">{team.name}</span>
              {team.zone === "up" && (
                <span className="fig-lb-zone-chip fig-lb-zone-chip--up">ZONA DE ASCENSO</span>
              )}
              {team.zone === "down" && (
                <span className="fig-lb-zone-chip fig-lb-zone-chip--down">ZONA DE DESCENSO</span>
              )}
              <span className="fig-lb-row-pts">
                {team.pts.toLocaleString("es-ES")}
              </span>
            </div>
          ))}
        </section>

        <section className="fig-lb-list">
          <div className="fig-lb-row" style={{ fontWeight: 800 }}>
            <span className="fig-lb-row-rank">#</span>
            <span className="fig-lb-row-name" style={{ gridColumn: "3 / span 2" }}>Top interno · {memberTribeName}</span>
            <span className="fig-lb-row-pts">Pts</span>
          </div>
          {memberWarning ? <p className="subtle">{memberWarning}</p> : null}
          {membersPodium.length === 0 ? <p className="subtle">Sin podio interno disponible.</p> : null}
          {membersPodium.map((member) => (
            <div key={`${member.userId || member.name}-mobile-${member.rank}`} className={`fig-lb-row${member.isMe ? " fig-lb-row--user" : ""}`}>
              <span className="fig-lb-row-rank">{member.rank}</span>
              <div className="fig-lb-row-avatar-wrap">
                <div className="fig-lb-row-avatar" style={{ background: "#4a77e3" }}>
                  {member.initials}
                </div>
              </div>
              <span className="fig-lb-row-name">{member.name}</span>
              <span className="fig-lb-row-pts">{member.contributed.toLocaleString("es-ES")}</span>
            </div>
          ))}
        </section>

        {userTribe ? (
          <div className="fig-lb-footer">
            <div className="fig-lb-footer-top">
              <div className="fig-lb-footer-main-row">
                <span className="fig-lb-footer-eyebrow">TU POSICIÓN</span>
                <Link href="/tribe" className="fig-lb-footer-link">Ver tu Squad →</Link>
              </div>
              <p className="fig-lb-footer-main">
                #{userTribe.rank} {userTribe.name} · {userTribe.pts.toLocaleString("es-ES")} pts
              </p>
            </div>
            <div className="fig-lb-footer-meta">
              <span>A {ptsNeeded.toLocaleString("es-ES")} pts del #1 · {teamAbove?.name ?? "Top"}</span>
              <span>Progreso {progressPct}%</span>
            </div>
            <div className="fig-lb-footer-bar">
              <div style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        ) : null}

        <BottomNav />
      </main>
    </>
  );
}
