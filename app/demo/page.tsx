"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

type MockMission = {
  id: string;
  title: string;
  xp: number;
  status: "pendiente" | "en_progreso" | "completado";
};

type MockUser = {
  name: string;
  alias: string;
  tribe: string;
  level: number;
  streakDays: number;
  energy: number;
};

const INITIAL_USER: MockUser = {
  name: "Andrea Flores",
  alias: "AFlow",
  tribe: "Aqua Flux",
  level: 12,
  streakDays: 19,
  energy: 78,
};

const INITIAL_MISSIONS: MockMission[] = [
  { id: "m1", title: "Reto diario de movimiento", xp: 120, status: "pendiente" },
  { id: "m2", title: "Comparte tu avance de temporada", xp: 90, status: "en_progreso" },
  { id: "m3", title: "Completa bonus de equipo", xp: 200, status: "completado" },
  { id: "m4", title: "Canjea recompensa semanal", xp: 140, status: "pendiente" },
];

function statusLabel(status: MockMission["status"]) {
  if (status === "pendiente") return "Pendiente";
  if (status === "en_progreso") return "En progreso";
  return "Completado";
}

export default function DemoPage() {
  const [user, setUser] = useState<MockUser>(INITIAL_USER);
  const [missions, setMissions] = useState<MockMission[]>(INITIAL_MISSIONS);
  const [draftName, setDraftName] = useState(INITIAL_USER.name);
  const [draftAlias, setDraftAlias] = useState(INITIAL_USER.alias);
  const [activeFilter, setActiveFilter] = useState<"todas" | MockMission["status"]>("todas");
  const [log, setLog] = useState<string[]>([
    "Escenario frontend inicializado",
    "Sin conexiones externas activas",
  ]);

  const visibleMissions = useMemo(() => {
    if (activeFilter === "todas") return missions;
    return missions.filter((mission) => mission.status === activeFilter);
  }, [activeFilter, missions]);

  const totalXp = useMemo(
    () => missions.reduce((acc, mission) => acc + mission.xp, 0),
    [missions],
  );

  const completedCount = useMemo(
    () => missions.filter((mission) => mission.status === "completado").length,
    [missions],
  );

  function onSaveProfile(event: FormEvent) {
    event.preventDefault();

    const nextName = draftName.trim();
    const nextAlias = draftAlias.trim();

    if (!nextName || !nextAlias) {
      setLog((prev) => ["Perfil no actualizado: faltan datos", ...prev].slice(0, 8));
      return;
    }

    setUser((prev) => ({ ...prev, name: nextName, alias: nextAlias }));
    setLog((prev) => [`Perfil actualizado: ${nextAlias}`, ...prev].slice(0, 8));
  }

  function cycleMissionStatus(id: string) {
    setMissions((prev) => prev.map((mission) => {
      if (mission.id !== id) return mission;

      const nextStatus = mission.status === "pendiente"
        ? "en_progreso"
        : mission.status === "en_progreso"
          ? "completado"
          : "pendiente";

      return { ...mission, status: nextStatus };
    }));

    const changed = missions.find((mission) => mission.id === id);
    if (changed) {
      setLog((prev) => [`Estado cambiado: ${changed.title}`, ...prev].slice(0, 8));
    }
  }

  function resetScenario() {
    setUser(INITIAL_USER);
    setMissions(INITIAL_MISSIONS);
    setDraftName(INITIAL_USER.name);
    setDraftAlias(INITIAL_USER.alias);
    setActiveFilter("todas");
    setLog(["Escenario reiniciado", "Sin conexiones externas activas"]);
  }

  return (
    <main className="demo-page">
      <header className="demo-header">
        <div>
          <h1>Laboratorio Frontend</h1>
          <p>Sandbox visual para iterar UX de TokaTribe sin dependencias de infraestructura.</p>
        </div>
        <Link href="/" className="demo-back-link">Volver a landing</Link>
      </header>

      <section className="demo-panel">
        <h2>Estado de experiencia</h2>
        <div className="demo-grid">
          <label>
            Nivel
            <input value={String(user.level)} readOnly />
          </label>
          <label>
            Racha
            <input value={`${user.streakDays} dias`} readOnly />
          </label>
          <label>
            Energia
            <input value={`${user.energy}%`} readOnly />
          </label>
        </div>
        <p className="subtle" style={{ marginTop: 10 }}>
          Progreso de misiones: {completedCount}/{missions.length} completadas · XP potencial: {totalXp}
        </p>
      </section>

      <section className="demo-panel">
        <h2>Perfil editable</h2>
        <form className="demo-actions" onSubmit={onSaveProfile}>
          <div className="demo-grid">
            <label>
              Nombre
              <input value={draftName} onChange={(event) => setDraftName(event.target.value)} placeholder="Nombre visible" />
            </label>
            <label>
              Alias
              <input value={draftAlias} onChange={(event) => setDraftAlias(event.target.value)} placeholder="Alias de juego" />
            </label>
            <label>
              Tribu
              <input value={user.tribe} readOnly />
            </label>
          </div>
          <button type="submit">Guardar cambios</button>
        </form>
      </section>

      <section className="demo-panel">
        <h2>Retos de Hoy</h2>
        <div className="demo-actions demo-actions--buttons" style={{ marginBottom: 12 }}>
          <button type="button" onClick={() => setActiveFilter("todas")} disabled={activeFilter === "todas"}>Todas</button>
          <button type="button" onClick={() => setActiveFilter("pendiente")} disabled={activeFilter === "pendiente"}>Pendientes</button>
          <button type="button" onClick={() => setActiveFilter("en_progreso")} disabled={activeFilter === "en_progreso"}>En progreso</button>
          <button type="button" onClick={() => setActiveFilter("completado")} disabled={activeFilter === "completado"}>Completadas</button>
        </div>

        <div className="demo-actions">
          {visibleMissions.map((mission) => (
            <div key={mission.id} className="demo-panel" style={{ padding: 14 }}>
              <p style={{ margin: 0, fontWeight: 800 }}>{mission.title}</p>
              <p className="subtle" style={{ margin: "6px 0 10px" }}>
                {statusLabel(mission.status)} · {mission.xp} XP
              </p>
              <button type="button" onClick={() => cycleMissionStatus(mission.id)}>
                Cambiar estado
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="demo-panel">
        <h2>Bitacora local</h2>
        <div className="demo-actions demo-actions--buttons">
          <button type="button" onClick={resetScenario}>Reiniciar escenario</button>
        </div>
        <pre style={{ marginTop: 12 }}>{JSON.stringify({ user, activeFilter, missions, log }, null, 2)}</pre>
      </section>
    </main>
  );
}
