import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://uonfrjjuhnrjewxzmuqc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvbmZyamp1aG5yamV3eHptdXFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MDU4NzUsImV4cCI6MjA4NjA4MTg3NX0.OXVl1AXeM1-mYION0Y3_oRWVyLvY6CJsR4Sz9p7Ghqo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// In-Memory World State
export interface PlayerState {
  id: string;
  userId: string;
  username: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  health: number;
  kills: number;
  deaths: number;
  weapon: string;
  team: 'team_a' | 'team_b' | 'solo';
  isAlive: boolean;
  lastUpdate: number;
}

export interface GameState {
  matchId: string;
  mode: '5v5' | '1v1_ranked';
  status: 'waiting' | 'in_progress' | 'finished';
  players: Map<string, PlayerState>;
  startTime: number;
  endTime?: number;
  teamAKills: number;
  teamBKills: number;
  winner?: string;
}

// Global game state stored in memory
export const worldState = new Map<string, GameState>();

// Subscribe to real-time updates
export function subscribeToGameUpdates(matchId: string, callback: (state: GameState) => void) {
  const channel = supabase
    .channel(`game:${matchId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'game_events',
        filter: `match_id=eq.${matchId}`,
      },
      (payload) => {
        const gameState = worldState.get(matchId);
        if (gameState) {
          callback(gameState);
        }
      }
    )
    .subscribe();

  return channel;
}

// Broadcast player position update
export async function broadcastPlayerPosition(
  matchId: string,
  playerId: string,
  position: { x: number; y: number; z: number },
  rotation: { x: number; y: number; z: number }
) {
  const gameState = worldState.get(matchId);
  if (gameState && gameState.players.has(playerId)) {
    const player = gameState.players.get(playerId)!;
    player.position = position;
    player.rotation = rotation;
    player.lastUpdate = Date.now();

    // Broadcast via Supabase
    await supabase.from('game_events').insert({
      match_id: matchId,
      event_type: 'player_move',
      player_id: playerId,
      data: { position, rotation },
      created_at: new Date(),
    });
  }
}

// Broadcast player shot
export async function broadcastPlayerShot(
  matchId: string,
  playerId: string,
  targetId: string | null,
  damage: number
) {
  await supabase.from('game_events').insert({
    match_id: matchId,
    event_type: 'player_shot',
    player_id: playerId,
    data: { targetId, damage },
    created_at: new Date(),
  });

  // Update kills/deaths in memory
  const gameState = worldState.get(matchId);
  if (gameState && targetId) {
    const target = gameState.players.get(targetId);
    if (target && target.health <= damage) {
      const shooter = gameState.players.get(playerId);
      if (shooter) {
        shooter.kills++;
        target.deaths++;
        target.isAlive = false;

        // Update team kills
        if (shooter.team === 'team_a') {
          gameState.teamAKills++;
        } else if (shooter.team === 'team_b') {
          gameState.teamBKills++;
        }
      }
    }
  }
}

// Get current game state
export function getGameState(matchId: string): GameState | undefined {
  return worldState.get(matchId);
}

// Create new game state
export function createGameState(
  matchId: string,
  mode: '5v5' | '1v1_ranked',
  players: PlayerState[]
): GameState {
  const gameState: GameState = {
    matchId,
    mode,
    status: 'waiting',
    players: new Map(players.map((p) => [p.id, p])),
    startTime: Date.now(),
    teamAKills: 0,
    teamBKills: 0,
  };

  worldState.set(matchId, gameState);
  return gameState;
}

// Clean up game state
export function deleteGameState(matchId: string) {
  worldState.delete(matchId);
}
