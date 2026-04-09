import { TokaApi, type GameSessionCreateRequest } from "@/services/toka-api.service";

type RecordLike = Record<string, unknown>;

function toRecord(value: unknown): RecordLike | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as RecordLike;
}

function toText(value: unknown): string | null {
  if (typeof value === "string" && value.trim() !== "") return value.trim();
  return null;
}

function extractChallengeItems(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  const record = toRecord(payload);
  if (Array.isArray(record?.items)) return record.items as unknown[];
  if (Array.isArray(record?.challenges)) return record.challenges as unknown[];
  return [];
}

export async function resolveActiveChallengeId(keywords: string[]): Promise<string | null> {
  const response = await TokaApi.challengesActive();
  const normalizedKeywords = keywords.map((keyword) => keyword.trim().toLowerCase()).filter(Boolean);
  const items = extractChallengeItems(response.data);

  for (const item of items) {
    const rec = toRecord(item);
    if (!rec) continue;

    const id = toText(rec.id) ?? toText(rec.challengeId);
    const title = toText(rec.title) ?? toText(rec.name) ?? "";
    const description = toText(rec.description) ?? "";
    const haystack = `${title} ${description}`.toLowerCase();

    if (id && normalizedKeywords.some((keyword) => haystack.includes(keyword))) {
      return id;
    }
  }

  return null;
}

export function buildGameSessionRequest(input: GameSessionCreateRequest): GameSessionCreateRequest {
  return {
    challengeId: input.challengeId,
    score: input.score,
    durationMs: input.durationMs,
    metadata: input.metadata,
  };
}