"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Medal } from "lucide-react";
import type { TriviaResult } from "@/types/trivia";

const RESULT_KEY = "toka_trivia_result";

function getTierLabel(multiplier: number): string {
  if (multiplier >= 2.0) return "Tier Oro";
  if (multiplier >= 1.5) return "Tier Plata";
  if (multiplier >= 1.2) return "Tier Bronce";
  return "Sin Tier";
}

function getHeroMessage(accuracy: number): string {
  if (accuracy >= 80) return "¡Bien jugado!";
  if (accuracy >= 50) return "No está mal...";
  return "Fue difícil...";
}

export default function TriviaResultadoPage({
  params,
}: {
  params: { id: string };
}) {
  const [result, setResult] = useState<TriviaResult | null>(null);
  const [posted, setPosted] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RESULT_KEY);
      if (raw) setResult(JSON.parse(raw) as TriviaResult);
    } catch {}
  }, []);

  useEffect(() => {
    if (!result || posted) return;
    setPosted(true);
    fetch("/api/game-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameType: "trivia",
        sessionId: params.id,
        score: result.finalScore,
        correctCount: result.correctCount,
        totalQuestions: result.totalQuestions,
      }),
    }).catch(() => {});
  }, [result, posted, params.id]);

  if (!result) {
    return (
      <main className="fig-trivia-result fig-trivia-result--empty">
        <p>Sin resultados. ¡Juega una partida primero!</p>
        <Link href="/retos" className="fig-trivia-result-btn fig-trivia-result-btn--primary">
          Ir a Retos
        </Link>
      </main>
    );
  }

  const { baseScore, finalScore, multiplier, correctCount, totalQuestions, coupon } = result;
  const accuracy = Math.round((correctCount / totalQuestions) * 100);
  const tierLabel = getTierLabel(multiplier);
  const heroMessage = getHeroMessage(accuracy);
  const streakLost = accuracy < 50;

  return (
    <main className="fig-trivia-result">

      {/* ── Hero card ── */}
      <section className="fig-trivia-result-hero-card">
        <div className="fig-trivia-result-hero-text">
          <span className="fig-trivia-result-hero-subtitle">AXO SQUAD · TOKA TRIVIA</span>
          <h1>{heroMessage}</h1>
          <p className="fig-trivia-result-hero-pts">
            <strong>{finalScore.toLocaleString()}</strong>
            <span> pts</span>
          </p>
        </div>
        <img
          src="/images/ajolote_2.png"
          alt=""
          draggable="false"
          className="fig-trivia-result-hero-mascot"
        />
      </section>

      {/* ── Score breakdown ── */}
      <section className="fig-trivia-result-breakdown">
        <div className="fig-trivia-result-breakdown-top">
          <span>Puntos ganados</span>
          <span className="fig-trivia-tier-pill">
            <Medal size={11} />
            {tierLabel}
          </span>
        </div>

        <p className="fig-trivia-result-pts-big">+{finalScore.toLocaleString()} pts</p>

        <hr className="fig-trivia-divider" />

        <div className="fig-trivia-breakdown-row">
          <span>Base score</span>
          <strong>{baseScore.toLocaleString()} pts</strong>
        </div>
        <div className="fig-trivia-breakdown-row">
          <span>Multiplicador</span>
          <strong className="fig-trivia-multiplier-val">×{multiplier.toFixed(1)} Tier</strong>
        </div>

        <hr className="fig-trivia-divider" />

        <div className="fig-trivia-breakdown-row fig-trivia-breakdown-row--total">
          <span>Total Final</span>
          <strong>{finalScore.toLocaleString()} pts al Tribe</strong>
        </div>
      </section>

      {/* ── Racha ── */}
      {streakLost ? (
        <section className="fig-trivia-racha fig-trivia-racha--lost">
          <span className="fig-trivia-racha-icon">💔</span>
          <div>
            <p className="fig-trivia-racha-title">Racha perdida</p>
            <p className="fig-trivia-racha-sub">
              Jugaste tarde · Tu racha terminó
            </p>
          </div>
        </section>
      ) : (
        <section className="fig-trivia-racha fig-trivia-racha--ok">
          <span className="fig-trivia-racha-icon">🔥</span>
          <div>
            <p className="fig-trivia-racha-title">¡Racha activa!</p>
            <p className="fig-trivia-racha-sub">
              {correctCount}/{totalQuestions} correctas · {accuracy}%
            </p>
          </div>
        </section>
      )}

      {/* ── Cupón ── */}
      {coupon ? (
        <section className="fig-trivia-coupon">
          <div className="fig-trivia-coupon-inner">
            <span className="fig-trivia-coupon-emoji">🎟</span>
            <div>
              <p className="fig-trivia-coupon-label">¡Cupón desbloqueado!</p>
              <p className="fig-trivia-coupon-discount">
                {coupon.discount} en {coupon.store}
              </p>
              <p className="fig-trivia-coupon-code">{coupon.code}</p>
            </div>
          </div>
        </section>
      ) : null}

      {/* ── Actions ── */}
      <div className="fig-trivia-result-actions">
        <Link href="/dashboard" className="fig-trivia-result-btn fig-trivia-result-btn--primary">
          Volver al inicio
        </Link>
        <Link href="/leaderboard" className="fig-trivia-result-btn fig-trivia-result-btn--ghost">
          Ver leaderboard
        </Link>
      </div>

    </main>
  );
}
