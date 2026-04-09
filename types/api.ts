export type ApiRecord = Record<string, unknown>;

export type UserIdentityDto = ApiRecord & {
  id?: string;
  userId?: string;
  username?: string;
  displayName?: string;
  name?: string;
  nickname?: string;
  avatarUrl?: string;
  avatar?: string;
  tribeId?: string;
  tribeName?: string;
  tribe?: {
    tribeName?: string;
    activeTier?: string;
    activeMultiplier?: number;
    memberRole?: string;
  } | null;
  currentDivision?: string;
  leagueMembership?: string;
  currentStreak?: number;
  totalPoints?: number;
};

export type ChallengeDto = ApiRecord & {
  id?: string;
  challengeId?: string;
  title?: string;
  name?: string;
  description?: string;
  gameType?: string;
  points?: number;
  rewardPoints?: number;
  endsAt?: string;
  closeAt?: string;
  countdown?: string;
};

export type RewardDto = ApiRecord & {
  id?: string;
  rewardId?: string;
  title?: string;
  name?: string;
  description?: string;
  status?: string;
  claimable?: boolean;
  available?: boolean;
};

export type RewardClaimDto = ApiRecord & {
  id?: string;
  rewardId?: string;
  createdAt?: string;
};

export type PaymentHistoryItemDto = ApiRecord & {
  id?: string;
  paymentId?: string;
  amount?: number | string;
  status?: string;
  createdAt?: string;
};

export type PaymentHistoryDto = ApiRecord & {
  items?: PaymentHistoryItemDto[];
  history?: PaymentHistoryItemDto[];
  entries?: PaymentHistoryItemDto[];
  transactions?: PaymentHistoryItemDto[];
  payments?: PaymentHistoryItemDto[];
  summary?: ApiRecord;
  balance?: number | string;
  walletBalance?: number | string;
  totalBalance?: number | string;
};

export type GameSessionDto = ApiRecord & {
  id?: string;
  sessionId?: string;
  challengeId?: string;
  gameType?: string;
  score?: number | string;
  durationMs?: number | string;
  createdAt?: string;
  metadata?: ApiRecord;
};

export type GameSessionCreateRequest = {
  challengeId: string;
  score: number;
  durationMs?: number;
  metadata?: ApiRecord;
};

export type LeaderboardEntryDto = ApiRecord & {
  rank?: number | string;
  position?: number | string;
  name?: string;
  tribeName?: string;
  teamName?: string;
  points?: number | string;
  score?: number | string;
  totalPoints?: number | string;
  isMine?: boolean;
  me?: boolean;
};

export type TribeDto = ApiRecord & {
  id?: string;
  _id?: string;
  tribeId?: string;
  name?: string;
  tribeName?: string;
  slug?: string;
  description?: string;
  badgeUrl?: string;
  avatarUrl?: string;
  division?: string;
  tier?: string;
  seasonPoints?: number | string;
  pointsWeek?: number | string;
  totalPoints?: number | string;
  memberCount?: number | string;
  maxMembers?: number | string;
  leaderId?: string;
  status?: string;
};

export type TribeMemberDto = ApiRecord & {
  userId?: string;
  _id?: string;
  username?: string;
  name?: string;
  displayName?: string;
  avatarUrl?: string;
  avatar?: string;
  role?: string;
  pointsContributed?: number | string;
  points?: number | string;
  tier?: string;
  activeTier?: string;
  activeMultiplier?: number | string;
  joinedAt?: string;
};

export type SeasonDto = ApiRecord & {
  id?: string;
  seasonId?: string;
  name?: string;
  title?: string;
  status?: string;
  endsAt?: string;
  description?: string;
};