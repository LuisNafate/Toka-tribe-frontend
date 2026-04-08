import type { UserAnswer, TriviaResult, Coupon } from "@/types/trivia";

const QUESTION_TIME = 15;

/**
 * Calcula el puntaje base sumando puntos por respuestas correctas
 * más un bono proporcional al tiempo restante cuando se respondió.
 *
 * @param answers      - Respuestas del usuario
 * @param timePerAnswer - Segundos restantes cuando se envió cada respuesta
 */
export function calculateScore(
  answers: UserAnswer[],
  timePerAnswer: number[]
): number {
  return answers.reduce((total, answer, i) => {
    if (!answer.isCorrect) return total;

    const timeRemaining = timePerAnswer[i] ?? 0;
    const timeBonus = Math.round(
      answer.timeBonusMax * (timeRemaining / QUESTION_TIME)
    );

    return total + answer.pointsBase + timeBonus;
  }, 0);
}

/**
 * Aplica el multiplicador de tier al puntaje base.
 */
export function applyMultiplier(score: number, multiplier: number): number {
  return Math.round(score * multiplier);
}

/**
 * Retorna el cupón simulado según los puntos finales y la división del usuario.
 * Umbrales base: 500 → 5%, 1000 → 10%, 2000 → 15%, 4000 → 20%
 * Bonus por división: Bronce +0%, Plata +2%, Oro +5%
 */
export function getCouponForPoints(
  finalPoints: number,
  division: string
): Coupon | null {
  const divisionBonus: Record<string, number> = {
    bronce: 0,
    plata: 2,
    oro: 5,
  };

  const bonus = divisionBonus[division.toLowerCase()] ?? 0;

  let baseDiscount: number;

  if (finalPoints >= 4000) {
    baseDiscount = 20;
  } else if (finalPoints >= 2000) {
    baseDiscount = 15;
  } else if (finalPoints >= 1000) {
    baseDiscount = 10;
  } else if (finalPoints >= 500) {
    baseDiscount = 5;
  } else {
    return null;
  }

  const totalDiscount = baseDiscount + bonus;
  const minPoints = finalPoints >= 4000 ? 4000
    : finalPoints >= 2000 ? 2000
    : finalPoints >= 1000 ? 1000
    : 500;

  return {
    code: `TOKA-${minPoints}`,
    discount: `${totalDiscount}%`,
    store: "Chedraui",
    minPoints,
  };
}

/**
 * Lee el multiplicador de tier del localStorage.
 * Devuelve 1.0 si no hay tier activo.
 */
export function getStoredMultiplier(): number {
  try {
    const tier = localStorage.getItem("toka_active_tier");
    if (tier === "oro") return 2.0;
    if (tier === "plata") return 1.5;
    if (tier === "bronce") return 1.2;
  } catch {
    // localStorage no disponible (SSR guard)
  }
  return 1.0;
}

/**
 * Lee la división del usuario del localStorage.
 */
export function getStoredDivision(): string {
  try {
    return localStorage.getItem("toka_division") ?? "bronce";
  } catch {
    return "bronce";
  }
}
