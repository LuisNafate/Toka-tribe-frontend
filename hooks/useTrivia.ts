"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { questions as allQuestions } from "@/data/questions";
import {
  calculateScore,
  applyMultiplier,
  getCouponForPoints,
  getStoredMultiplier,
  getStoredDivision,
} from "@/utils/trivia";
import type { UserAnswer, TriviaResult } from "@/types/trivia";

export type GamePhase = "loading" | "playing" | "feedback" | "finished";

const QUESTION_TIME = 15;
const FEEDBACK_DELAY = 1500;
const RESULT_KEY = "toka_trivia_result";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function useTrivia() {
  // Start with empty array to avoid SSR/client hydration mismatch.
  // Shuffle happens in useEffect (client-only).
  const [questions, setQuestions] = useState(allQuestions);
  const [phase, setPhase] = useState<GamePhase>("loading");

  const [questionIdx, setQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);

  const answersRef = useRef<UserAnswer[]>([]);
  const timePerAnswerRef = useRef<number[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Shuffle on mount (client only) ──────────────────────────────
  useEffect(() => {
    setQuestions(shuffle(allQuestions));
    setPhase("playing");
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // ── Timer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "playing") {
      clearTimer();
      return;
    }

    setTimeLeft(QUESTION_TIME);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [phase, questionIdx, clearTimer]);

  // ── Auto-answer on timeout ───────────────────────────────────────
  useEffect(() => {
    if (timeLeft === 0 && phase === "playing") {
      recordAnswer("__timeout__", 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, phase]);

  // ── Core answer logic ────────────────────────────────────────────
  function recordAnswer(answerId: string, timeRemaining: number) {
    const question = questions[questionIdx];
    const isCorrect = answerId === question.correctAnswerId;

    const answer: UserAnswer = {
      questionId: question.questionId,
      selectedAnswerId: answerId,
      timeSpent: QUESTION_TIME - timeRemaining,
      isCorrect,
      pointsBase: question.pointsBase,
      timeBonusMax: question.timeBonusMax,
    };

    answersRef.current = [...answersRef.current, answer];
    timePerAnswerRef.current = [...timePerAnswerRef.current, timeRemaining];

    setAnswers(answersRef.current);
    setSelectedAnswerId(answerId);
    setPhase("feedback");

    const isLast = questionIdx === questions.length - 1;

    setTimeout(() => {
      if (isLast) {
        saveResult(answersRef.current, timePerAnswerRef.current);
        setPhase("finished");
      } else {
        setQuestionIdx((i) => i + 1);
        setSelectedAnswerId(null);
        setPhase("playing");
      }
    }, FEEDBACK_DELAY);
  }

  function selectAnswer(answerId: string) {
    if (phase !== "playing") return;
    clearTimer();
    recordAnswer(answerId, timeLeft);
  }

  function saveResult(finalAnswers: UserAnswer[], timings: number[]) {
    const multiplier = getStoredMultiplier();
    const division = getStoredDivision();

    const baseScore = calculateScore(finalAnswers, timings);
    const finalScore = applyMultiplier(baseScore, multiplier);
    const coupon = getCouponForPoints(finalScore, division);

    const result: TriviaResult = {
      answers: finalAnswers,
      baseScore,
      finalScore,
      multiplier,
      correctCount: finalAnswers.filter((a) => a.isCorrect).length,
      totalQuestions: questions.length,
      coupon,
    };

    try {
      localStorage.setItem(RESULT_KEY, JSON.stringify(result));
    } catch {
      // ignore quota errors
    }
  }

  function getResult(): TriviaResult | null {
    try {
      const raw = localStorage.getItem(RESULT_KEY);
      return raw ? (JSON.parse(raw) as TriviaResult) : null;
    } catch {
      return null;
    }
  }

  const currentScore = answers.reduce(
    (sum, a) => (a.isCorrect ? sum + a.pointsBase : sum),
    0
  );

  return {
    question: questions[questionIdx],
    questionIdx,
    totalQuestions: questions.length,
    timeLeft,
    selectedAnswerId,
    phase,
    answers,
    currentScore,
    selectAnswer,
    getResult,
  };
}
