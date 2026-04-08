"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, Zap, Users, Tag } from "lucide-react";
import type { TriviaResult } from "@/types/trivia";

const RESULT_KEY = "toka_trivia_result";

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
    } catch {
      // ignore
    }
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
  const tribeContribution = Math.round(finalScore * 0.3);

  const heroMessage =
    accuracy >= 80 ? "¡Excelente partida!" : accuracy >= 50 ? "¡Buen intento!" : "Sigue practicando";

  return (
    <main className="fig-trivia-result">
      <section className="fig-trivia-result-hero">
        <img src="/images/ajolote_2.png" alt="Mascot" className="fig-trivia-result-mascot" draggable="false" />
        <h1>{heroMessage}</h1>
        <p className="fig-trivia-result-accuracy">
          {correctCount}/{totalQuestions} correctas · {accuracy}%
        </p>
      </section>

      <section className="fig-trivia-result-card">
        <div className="fig-trivia-result-row">
          <span><Zap size={15} />Puntaje base</span>
          <strong>{baseScore} pts</strong>
        </div>
        <div className="fig-trivia-result-row">
          <span><Trophy size={15} />Multiplicador tier</span>
          <strong className="fig-trivia-result-multiplier">×{multiplier.toFixed(1)}</strong>
        </div>
        <div className="fig-trivia-result-row fig-trivia-result-row--total">
          <span>Puntaje final</span>
          <strong>{finalScore} pts</strong>
        </div>
      </section>

      <section className="fig-trivia-result-card">
        <div className="fig-trivia-result-row">
          <span><Users size={15} />Aportación a tu Tribe</span>
          <strong>+{tribeContribution} pts</strong>
        </div>
      </section>

      {coupon ? (
        <section className="fig-trivia-coupon">
          <div className="fig-trivia-coupon-inner">
            <Tag size={18} />
            <div>
              <p className="fig-trivia-coupon-label">¡Cupón desbloqueado!</p>
              <p className="fig-trivia-coupon-discount">{coupon.discount} en {coupon.store}</p>
              <p className="fig-trivia-coupon-code">{coupon.code}</p>
            </div>
          </div>
        </section>
      ) : (
        <section className="fig-trivia-coupon fig-trivia-coupon--locked">
          <p>Alcanza 500 pts para desbloquear tu primer cupón</p>
        </section>
      )}

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
