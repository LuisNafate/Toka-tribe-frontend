"use client";

import Link from "next/link";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import type { TouchEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FIGMA_ASSETS } from "@/lib/data";
import { getSessionToken } from "@/services/auth.service";
import { TokaApi } from "@/services/toka-api.service";
import { formatAppPoints, refreshAppPointsFromRemote, useAppPoints } from "@/components/use-app-points";
import { buildGameSessionRequest, resolveActiveChallengeId } from "@/services/game-session-sync";

type Cell = { x: number; y: number };
type Direction = { x: number; y: number };
type GameStatus = "idle" | "countdown" | "running" | "paused" | "game-over";

const BOARD_SIZE = 12;
const CELL_POINTS = 15;
const INITIAL_DIRECTION: Direction = { x: 1, y: 0 };
const INITIAL_COUNTDOWN = 3;

function createSnakeStart(): Cell[] {
  return [
    { x: 5, y: 6 },
    { x: 4, y: 6 },
    { x: 3, y: 6 },
  ];
}

function isSameCell(a: Cell, b: Cell) {
  return a.x === b.x && a.y === b.y;
}

function isOpposite(a: Direction, b: Direction) {
  return a.x + b.x === 0 && a.y + b.y === 0;
}

function createFoodPosition(snake: Cell[]) {
  while (true) {
    const candidate = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE),
    };

    if (!snake.some((segment) => isSameCell(segment, candidate))) {
      return candidate;
    }
  }
}

function cellKey(cell: Cell) {
  return `${cell.x}-${cell.y}`;
}

function loadBestScore() {
  if (typeof window === "undefined") return 0;
  const stored = Number(window.localStorage.getItem("tokatribe.snake.best"));
  return Number.isFinite(stored) ? stored : 0;
}

function saveBestScore(score: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("tokatribe.snake.best", String(score));
}

export function SnakeGame() {
  const { points, addAppPoints } = useAppPoints();

  const initialSnake = useMemo(() => createSnakeStart(), []);
  const [snake, setSnake] = useState<Cell[]>(initialSnake);
  const [food, setFood] = useState<Cell>(() => createFoodPosition(initialSnake));
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [status, setStatus] = useState<GameStatus>("idle");
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [lastReward, setLastReward] = useState("Listo para jugar");

  const snakeRef = useRef(snake);
  const foodRef = useRef(food);
  const directionRef = useRef(direction);
  const scoreRef = useRef(score);
  const statusRef = useRef(status);
  const bestScoreRef = useRef(0);
  const startedAtRef = useRef<number | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const syncSnakeScore = useCallback(async (applesEaten: number) => {
    const token = getSessionToken();
    if (!token) {
      setLastReward("Puntos locales sumados. Inicia sesión para sincronizar partida.");
      return;
    }

    const sessionPoints = applesEaten * CELL_POINTS;
    if (sessionPoints <= 0) {
      setLastReward("Partida cerrada sin puntaje para sincronizar.");
      return;
    }

    const challengeId = await resolveActiveChallengeId(["snake", "serpiente"]);
    if (!challengeId) {
      setLastReward("No hay challenge activo de Snake. Resultado guardado en local.");
      return;
    }

    const durationMs = startedAtRef.current ? Math.max(0, Date.now() - startedAtRef.current) : undefined;

    setLastReward("Sincronizando partida Snake...");

    try {
      await TokaApi.gameSessionsCreate(buildGameSessionRequest({
        challengeId,
        score: sessionPoints,
        durationMs,
        metadata: {
          applesEaten,
          pointsPerApple: CELL_POINTS,
          bestRun: bestScoreRef.current,
          source: "snake",
        },
      }));

      await refreshAppPointsFromRemote();
      setLastReward(`Partida sincronizada: +${sessionPoints} pts`);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Error desconocido";
      setLastReward(`No se pudo sincronizar Snake: ${detail}`);
    }
  }, []);

  useEffect(() => {
    const storedBest = loadBestScore();
    bestScoreRef.current = storedBest;
    setBestScore(storedBest);
  }, []);

  useEffect(() => {
    snakeRef.current = snake;
  }, [snake]);

  useEffect(() => {
    foodRef.current = food;
  }, [food]);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const endGame = useCallback(() => {
    const finalScore = scoreRef.current;
    const nextBest = Math.max(bestScoreRef.current, finalScore);

    bestScoreRef.current = nextBest;
    setBestScore(nextBest);
    saveBestScore(nextBest);
    setStatus("game-over");
    setLastReward(finalScore > 0 ? `Partida cerrada con ${finalScore} manzanas` : "La partida terminó antes de sumar puntos");
    void syncSnakeScore(finalScore);
  }, [syncSnakeScore]);

  const resetGame = useCallback((autostart = true) => {
    const nextSnake = createSnakeStart();
    const nextFood = createFoodPosition(nextSnake);

    snakeRef.current = nextSnake;
    foodRef.current = nextFood;
    directionRef.current = INITIAL_DIRECTION;
    scoreRef.current = 0;
    startedAtRef.current = null;

    setSnake(nextSnake);
    setFood(nextFood);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setCountdown(null);
    setLastReward("Nueva partida lista");
    setStatus(autostart ? "running" : "idle");
  }, []);

  const startCountdown = useCallback((resetBoard: boolean) => {
    if (resetBoard) {
      resetGame(false);
    }

    setCountdown(INITIAL_COUNTDOWN);
    setStatus("countdown");
    setLastReward("Prepárate... comienza en 3");
  }, [resetGame]);

  const queueDirection = useCallback((nextDirection: Direction) => {
    const currentDirection = directionRef.current;

    if (isOpposite(currentDirection, nextDirection)) {
      return;
    }

    directionRef.current = nextDirection;
    setDirection(nextDirection);

    if (statusRef.current === "idle" || statusRef.current === "game-over") {
      return;
    }
  }, []);

  const toggleStatus = useCallback(() => {
    if (statusRef.current === "running") {
      setStatus("paused");
      return;
    }

    if (statusRef.current === "countdown") {
      return;
    }

    if (statusRef.current === "paused") {
      startCountdown(false);
      return;
    }

    startCountdown(true);
  }, [startCountdown]);

  useEffect(() => {
    if (status !== "countdown" || countdown === null) {
      return undefined;
    }

    if (countdown <= 1) {
      setStatus("running");
      setCountdown(null);
      startedAtRef.current = Date.now();
      setLastReward("¡Corre! la partida está activa");
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setCountdown((current) => (current ? current - 1 : null));
      setLastReward(`Prepárate... comienza en ${countdown - 1}`);
    }, 700);

    return () => window.clearTimeout(timer);
  }, [countdown, status]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowUp" || event.key === "w" || event.key === "W") {
        event.preventDefault();
        queueDirection({ x: 0, y: -1 });
      }

      if (event.key === "ArrowDown" || event.key === "s" || event.key === "S") {
        event.preventDefault();
        queueDirection({ x: 0, y: 1 });
      }

      if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") {
        event.preventDefault();
        queueDirection({ x: -1, y: 0 });
      }

      if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") {
        event.preventDefault();
        queueDirection({ x: 1, y: 0 });
      }

      if (event.key === " ") {
        event.preventDefault();
        toggleStatus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [queueDirection, toggleStatus]);

  useEffect(() => {
    if (status !== "running") {
      return undefined;
    }

    const currentDelay = Math.max(85, 220 - score * 7);

    const interval = window.setInterval(() => {
      const currentSnake = snakeRef.current;
      const currentDirection = directionRef.current;
      const currentFood = foodRef.current;
      const head = currentSnake[0];
      const nextHead = { x: head.x + currentDirection.x, y: head.y + currentDirection.y };

      if (
        nextHead.x < 0 ||
        nextHead.y < 0 ||
        nextHead.x >= BOARD_SIZE ||
        nextHead.y >= BOARD_SIZE ||
        currentSnake.some((segment) => isSameCell(segment, nextHead))
      ) {
        endGame();
        return;
      }

      const ateFood = isSameCell(nextHead, currentFood);
      const nextSnake = [nextHead, ...currentSnake];

      if (ateFood) {
        const nextScore = scoreRef.current + 1;
        const nextAppPoints = addAppPoints(CELL_POINTS);
        const nextFood = createFoodPosition(nextSnake);

        scoreRef.current = nextScore;
        bestScoreRef.current = Math.max(bestScoreRef.current, nextScore);

        setScore(nextScore);
        setBestScore(bestScoreRef.current);
        setFood(nextFood);
        setLastReward(`+${CELL_POINTS} pts a la app · total ${formatAppPoints(nextAppPoints)}`);

        foodRef.current = nextFood;
        snakeRef.current = nextSnake;
        setSnake(nextSnake);
        return;
      }

      nextSnake.pop();
      snakeRef.current = nextSnake;
      setSnake(nextSnake);
    }, currentDelay);

    return () => window.clearInterval(interval);
  }, [addAppPoints, endGame, score, status]);

  const handleBoardTouchStart = useCallback((event: TouchEvent<HTMLDivElement>) => {
    const touch = event.changedTouches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleBoardTouchEnd = useCallback((event: TouchEvent<HTMLDivElement>) => {
    const touch = event.changedTouches[0];
    const start = touchStartRef.current;

    if (!start) return;

    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    const threshold = 24;

    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) {
      touchStartRef.current = null;
      return;
    }

    if (Math.abs(dx) > Math.abs(dy)) {
      queueDirection({ x: dx > 0 ? 1 : -1, y: 0 });
    } else {
      queueDirection({ x: 0, y: dy > 0 ? 1 : -1 });
    }

    touchStartRef.current = null;
  }, [queueDirection]);

  const snakeKeys = useMemo(() => new Set(snake.map(cellKey)), [snake]);
  const headKey = snake.length ? cellKey(snake[0]) : "";
  const foodKey = cellKey(food);

  const cells = [];
  for (let y = 0; y < BOARD_SIZE; y += 1) {
    for (let x = 0; x < BOARD_SIZE; x += 1) {
      const key = `${x}-${y}`;
      let cellClassName = "fig-snake-cell";

      if (key === foodKey) {
        cellClassName += " fig-snake-cell--food";
      } else if (key === headKey) {
        cellClassName += " fig-snake-cell--head";
      } else if (snakeKeys.has(key)) {
        cellClassName += " fig-snake-cell--body";
      }

      cells.push(<span key={key} className={cellClassName} aria-hidden="true" />);
    }
  }

  return (
    <div className="fig-snake-shell">
      <section className="fig-snake-hero">
        <div className="fig-snake-hero__copy">
          <span className="fig-snake-kicker">RETOS · MINIJUEGO</span>
          <h1>Snake Tribe</h1>
          <p>Persigue manzanas, esquiva la cola y convierte cada captura en puntos para tu app.</p>

          <div className="fig-snake-hero__stats">
            <div>
              <strong>{score}</strong>
              <span>manzanas</span>
            </div>
            <div>
              <strong>{formatAppPoints(points)}</strong>
              <span>puntos de la app</span>
            </div>
            <div>
              <strong>{bestScore}</strong>
              <span>mejor run</span>
            </div>
          </div>
        </div>

        <div className="fig-snake-hero__art">
          <img src={FIGMA_ASSETS.landing.hero} alt="Mascot" draggable="false" />
          <div className="fig-snake-hero__note">
            <Sparkles size={14} />
            <span>+{CELL_POINTS} pts por manzana</span>
          </div>
        </div>
      </section>

      <div className="fig-snake-layout">
        <section className="fig-snake-board-card">
          <div className="fig-snake-board-head">
            <div>
              <span className="section-label">TABLERO</span>
              <h2>Movimiento rápido, identidad Toka</h2>
            </div>
            <span className={`fig-snake-status fig-snake-status--${status}`}>{status === "game-over" ? "Fin de partida" : status === "paused" ? "Pausado" : status === "running" ? "Jugando" : "Listo"}</span>
          </div>

          <div className="fig-snake-board-stage" onTouchStart={handleBoardTouchStart} onTouchEnd={handleBoardTouchEnd}>
            <div className="fig-snake-board" role="application" aria-label="Tablero del minijuego Snake Tribe">
              {cells}
            </div>

            {status !== "running" ? (
              <div className="fig-snake-board-overlay">
                <div>
                  <span className="section-label">
                    {status === "countdown"
                      ? "COMENZANDO"
                      : status === "paused"
                        ? "PARTIDA PAUSADA"
                        : status === "game-over"
                          ? "FIN DE PARTIDA"
                          : "LISTO PARA JUGAR"}
                  </span>
                  <strong>
                    {status === "countdown"
                      ? `Empieza en ${countdown ?? 1}`
                      : status === "game-over"
                        ? "Vuelve a intentar sin salir del tablero"
                        : "Play y reinicio sin scroll"}
                  </strong>
                </div>
                <div className="fig-snake-board-overlay__actions">
                  <button
                    type="button"
                    className="button button--primary"
                    onClick={toggleStatus}
                    disabled={status === "countdown"}
                  >
                    <Play size={16} />
                    {status === "paused" ? "Reanudar" : "Play"}
                  </button>
                  <button
                    type="button"
                    className="button button--secondary"
                    onClick={() => startCountdown(true)}
                    disabled={status === "countdown"}
                  >
                    <RotateCcw size={16} />
                    Reiniciar
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="fig-snake-summary">
            <div>
              <span>Última recompensa</span>
              <strong>{lastReward}</strong>
            </div>
            <div>
              <span>Estado de la partida</span>
              <strong>{status === "game-over" ? "Perdiste por colisión" : status === "paused" ? "Juego en pausa" : "Activa y corriendo"}</strong>
            </div>
          </div>
        </section>

      </div>

      <div className="fig-snake-controls" aria-label="Controles táctiles">
        <button type="button" onClick={() => queueDirection({ x: 0, y: -1 })} aria-label="Mover hacia arriba"><ArrowUp size={18} /></button>
        <div>
          <button type="button" onClick={() => queueDirection({ x: -1, y: 0 })} aria-label="Mover a la izquierda"><ArrowLeft size={18} /></button>
          <button type="button" onClick={() => toggleStatus()} aria-label="Pausar o reanudar" disabled={status === "countdown"}>{status === "running" ? <Pause size={18} /> : <Play size={18} />}</button>
          <button type="button" onClick={() => queueDirection({ x: 1, y: 0 })} aria-label="Mover a la derecha"><ArrowRight size={18} /></button>
        </div>
        <button type="button" onClick={() => queueDirection({ x: 0, y: 1 })} aria-label="Mover hacia abajo"><ArrowDown size={18} /></button>
      </div>

      <div className="fig-snake-footer-actions">
        <Link href="/retos" className="button button--tertiary">
          Seguir en retos
        </Link>
      </div>
    </div>
  );
}