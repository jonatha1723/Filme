/**
 * Sistema de Patentes/Ranking para Modo Ranked 1v1
 * 5 Patentes: Bronze, Prata, Ouro, Platina, Diamante
 */

export type Rank = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface RankInfo {
  rank: Rank;
  minElo: number;
  maxElo: number;
  displayName: string;
  color: string;
  icon: string;
}

export const RANK_TIERS: Record<Rank, RankInfo> = {
  bronze: {
    rank: 'bronze',
    minElo: 0,
    maxElo: 1000,
    displayName: 'Bronze',
    color: '#CD7F32',
    icon: '🥉',
  },
  silver: {
    rank: 'silver',
    minElo: 1000,
    maxElo: 2000,
    displayName: 'Prata',
    color: '#C0C0C0',
    icon: '🥈',
  },
  gold: {
    rank: 'gold',
    minElo: 2000,
    maxElo: 3000,
    displayName: 'Ouro',
    color: '#FFD700',
    icon: '🥇',
  },
  platinum: {
    rank: 'platinum',
    minElo: 3000,
    maxElo: 4000,
    displayName: 'Platina',
    color: '#E5E4E2',
    icon: '💎',
  },
  diamond: {
    rank: 'diamond',
    minElo: 4000,
    maxElo: 99999,
    displayName: 'Diamante',
    color: '#B9F2FF',
    icon: '👑',
  },
};

export interface PlayerRanking {
  userId: string;
  username: string;
  currentElo: number;
  currentRank: Rank;
  wins: number;
  losses: number;
  winRate: number;
  totalMatches: number;
  lastUpdated: number;
}

/**
 * Get rank based on ELO
 */
export function getRankByElo(elo: number): Rank {
  if (elo < 1000) return 'bronze';
  if (elo < 2000) return 'silver';
  if (elo < 3000) return 'gold';
  if (elo < 4000) return 'platinum';
  return 'diamond';
}

/**
 * Calculate ELO change based on match result
 * Standard K-factor: 32 for most players, 48 for new players, 16 for high-rated players
 */
export function calculateEloChange(
  playerElo: number,
  opponentElo: number,
  playerWon: boolean,
  kFactor: number = 32
): number {
  const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
  const actualScore = playerWon ? 1 : 0;
  const eloChange = kFactor * (actualScore - expectedScore);

  return Math.round(eloChange);
}

/**
 * Update player ranking after a match
 */
export function updatePlayerRanking(
  player: PlayerRanking,
  opponentElo: number,
  playerWon: boolean
): PlayerRanking {
  const kFactor = player.totalMatches < 30 ? 48 : 32;
  const eloChange = calculateEloChange(player.currentElo, opponentElo, playerWon, kFactor);

  const newElo = Math.max(0, player.currentElo + eloChange);
  const newRank = getRankByElo(newElo);

  return {
    ...player,
    currentElo: newElo,
    currentRank: newRank,
    wins: playerWon ? player.wins + 1 : player.wins,
    losses: playerWon ? player.losses : player.losses + 1,
    totalMatches: player.totalMatches + 1,
    winRate: ((playerWon ? player.wins + 1 : player.wins) / (player.totalMatches + 1)) * 100,
    lastUpdated: Date.now(),
  };
}

/**
 * Get rank progress (percentage to next rank)
 */
export function getRankProgress(elo: number): { current: number; next: number; percentage: number } {
  const rank = getRankByElo(elo);
  const rankInfo = RANK_TIERS[rank];
  const nextRank = rank === 'diamond' ? rank : getRankByElo(rankInfo.maxElo + 1);
  const nextRankInfo = RANK_TIERS[nextRank];

  const current = elo - rankInfo.minElo;
  const next = nextRankInfo.minElo - rankInfo.minElo;
  const percentage = (current / next) * 100;

  return {
    current,
    next,
    percentage: Math.min(100, percentage),
  };
}

/**
 * Format ELO for display
 */
export function formatElo(elo: number): string {
  return elo.toLocaleString('pt-BR');
}

/**
 * Get rank color for UI
 */
export function getRankColor(rank: Rank): string {
  return RANK_TIERS[rank].color;
}

/**
 * Get rank icon for UI
 */
export function getRankIcon(rank: Rank): string {
  return RANK_TIERS[rank].icon;
}
