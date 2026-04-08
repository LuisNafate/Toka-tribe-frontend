"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Zap } from "lucide-react";
import { useTrivia } from "@/hooks/useTrivia";

const LABELS = ["A", "B", "C", "D"];
const TIMER_R = 24;
const TIMER_C = 2 * Math.PI * TIMER_R; // ≈ 150.8

export default function TriviaGamePage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const {
    question,
    questionIdx,
    totalQuestions,
    timeLeft,
    selectedAnswerId,
    phase,
    currentScore,
    selectAnswer,
  } = useTrivia();

  useEffect(() => {
    if (phase === "finished") {
      router.push(`/retos/trivia/${params.id}/resultado`);
    }
  }, [phase, router, params.id]);

  // Loading state while questions shuffle on client
  if (phase === "loading" || !question) {
    return (
      <main className="fig-trivia-layout fig-trivia-layout--loading">
        <div className="fig-trivia-spinner" />
      </main>
    );
  }

  const pct = Math.round(((questionIdx + 1) / totalQuestions) * 100);
  const timerOffset = TIMER_C * (1 - timeLeft / 15);
  const timerUrgent = timeLeft <= 5;

  const correctAnswerText = question.options.find(
    (o) => o.answerId === question.correctAnswerId
  )?.text ?? "";

  function optionClass(answerId: string): string {
    const base = "fig-trivia-option";
    if (phase === "playing") return base;
    if (answerId === question.correctAnswerId) return `${base} fig-trivia-option--correct`;
    if (answerId === selectedAnswerId) return `${base} fig-trivia-option--incorrect`;
    return base;
  }

  function labelClass(answerId: string): string {
    const base = "fig-trivia-option-label";
    if (phase === "playing") return base;
    if (answerId === question.correctAnswerId) return `${base} fig-trivia-option-label--correct`;
    if (answerId === selectedAnswerId) return `${base} fig-trivia-option-label--incorrect`;
    return base;
  }

  return (
    <main className="fig-trivia-layout">

      {/* ── Top bar ── */}
      <header className="fig-trivia-topbar">
        <Link href="/retos" className="fig-trivia-close" aria-label="Salir">
          <X size={16} strokeWidth={2.5} />
        </Link>
        <span className="fig-trivia-title">TOKA TRIVIA</span>
        <div className="fig-trivia-score-pill">
          <span>SCORE</span>
          <strong>{currentScore.toLocaleString()} pts</strong>
        </div>
      </header>

      {/* ── Progress + Timer ── */}
      <div className="fig-trivia-meta">
        <div className="fig-trivia-meta-left">
          <div className="fig-trivia-progress-labels">
            <span>Question {questionIdx + 1} of {totalQuestions}</span>
            <span className="fig-trivia-pct">{pct}%</span>
          </div>
          <div className="fig-trivia-bar">
            <div className="fig-trivia-bar-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="fig-trivia-timer-wrap">
          <svg className="fig-trivia-timer-ring" viewBox="0 0 60 60" aria-hidden="true">
            <circle className="fig-trivia-timer-bg" cx="30" cy="30" r={TIMER_R} />
            <circle
              className={`fig-trivia-timer-arc${timerUrgent ? " fig-trivia-timer-arc--urgent" : ""}`}
              cx="30"
              cy="30"
              r={TIMER_R}
              strokeDasharray={TIMER_C}
              strokeDashoffset={timerOffset}
            />
          </svg>
          <span
            className={`fig-trivia-timer-num${timerUrgent ? " fig-trivia-timer-num--urgent" : ""}`}
            aria-live="polite"
          >
            {timeLeft}
          </span>
        </div>
      </div>

      {/* ── Question card ── */}
      <section className="fig-trivia-question-card">
        <div className="fig-trivia-card-top">
          <span className="fig-trivia-megaphone" aria-hidden="true">📢</span>
          <span className="fig-trivia-pts-badge">
            <Zap size={11} fill="currentColor" />
            +{question.pointsBase} PTS
          </span>
        </div>
        <span className="fig-trivia-category">{question.category.toUpperCase()}</span>
        <p className="fig-trivia-question-text">{question.text}</p>
      </section>

      {/* ── Options ── */}
      <div className="fig-trivia-options" role="list">
        {question.options.map((option, i) => (
          <button
            key={option.answerId}
            type="button"
            role="listitem"
            className={optionClass(option.answerId)}
            onClick={() => selectAnswer(option.answerId)}
            disabled={phase !== "playing"}
          >
            <span className={labelClass(option.answerId)}>
              {phase !== "playing" && option.answerId === question.correctAnswerId
                ? "✓"
                : phase !== "playing" && option.answerId === selectedAnswerId
                ? "✗"
                : LABELS[i]}
            </span>
            <span className="fig-trivia-option-text">{option.text}</span>
          </button>
        ))}
      </div>

      {/* ── Feedback hint ── */}
      {phase === "feedback" && (
        <div className="fig-trivia-hint">
          <p>
            {selectedAnswerId === question.correctAnswerId
              ? `"¡Correcto! +${question.pointsBase} pts sumados a tu score."`
              : `"La respuesta correcta era: ${correctAnswerText}"`}
          </p>
          <img src="/images/ajolote_3.png" alt="" draggable="false" />
        </div>
      )}

    </main>
  );
}
