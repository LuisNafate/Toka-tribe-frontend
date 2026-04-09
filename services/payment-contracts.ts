import type { ApiRecord, PaymentHistoryDto, PaymentHistoryItemDto } from "@/types/api";

export type PaymentSnapshot = {
  history: PaymentHistoryItemDto[];
  historyCount: number;
  documentedBalance: number | null;
};

function toRecord(value: unknown): ApiRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as ApiRecord;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, ""));
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function toHistoryList(payload: unknown): PaymentHistoryItemDto[] {
  if (Array.isArray(payload)) {
    return payload.filter((item): item is PaymentHistoryItemDto => !!item && typeof item === "object" && !Array.isArray(item));
  }

  const record = toRecord(payload) as PaymentHistoryDto | null;
  if (!record) return [];

  const candidates = [record.items, record.history, record.entries, record.transactions, record.payments];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter((item): item is PaymentHistoryItemDto => !!item && typeof item === "object" && !Array.isArray(item));
    }
  }

  return [];
}

function readDocumentedBalance(payload: unknown): number | null {
  const record = toRecord(payload) as PaymentHistoryDto | null;
  if (!record) return null;

  const summary = toRecord(record.summary);
  if (!summary) return null;

  return toNumber(summary.balance) ?? toNumber(summary.totalBalance) ?? toNumber(summary.walletBalance) ?? null;
}

export function extractPaymentSnapshot(payload: unknown): PaymentSnapshot {
  const history = toHistoryList(payload);

  return {
    history,
    historyCount: history.length,
    documentedBalance: readDocumentedBalance(payload),
  };
}