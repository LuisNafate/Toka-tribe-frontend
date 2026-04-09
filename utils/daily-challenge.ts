const DAILY_CHALLENGE_WINDOW_MS = 24 * 60 * 60 * 1000;
const DAILY_CHALLENGE_ANCHOR_KEY = "toka_daily_challenge_anchor";

function readAnchorTimestamp(): number {
  if (typeof window === "undefined") {
    return Date.now();
  }

  try {
    const stored = window.localStorage.getItem(DAILY_CHALLENGE_ANCHOR_KEY);
    const parsed = stored ? Number(stored) : Number.NaN;
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }

    const anchor = Date.now();
    window.localStorage.setItem(DAILY_CHALLENGE_ANCHOR_KEY, String(anchor));
    return anchor;
  } catch {
    return Date.now();
  }
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function getDailyChallengeCountdownLabel(now = Date.now()): string {
  const anchor = readAnchorTimestamp();
  const elapsed = ((now - anchor) % DAILY_CHALLENGE_WINDOW_MS + DAILY_CHALLENGE_WINDOW_MS) % DAILY_CHALLENGE_WINDOW_MS;
  const remaining = DAILY_CHALLENGE_WINDOW_MS - elapsed || DAILY_CHALLENGE_WINDOW_MS;

  return formatCountdown(remaining);
}