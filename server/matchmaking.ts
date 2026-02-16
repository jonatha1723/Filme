import { getDb, getGameQueue, createMatch, addPlayerToMatch, removeFromGameQueue } from "./db";
import { notifyOwner } from "./_core/notification";

type GameMode = "1v1" | "3v3" | "training";

interface MatchmakingConfig {
  mode: GameMode;
  playersNeeded: number;
  checkInterval: number; // ms
}

const MATCHMAKING_CONFIG: Record<GameMode, MatchmakingConfig> = {
  "1v1": {
    mode: "1v1",
    playersNeeded: 2,
    checkInterval: 5000,
  },
  "3v3": {
    mode: "3v3",
    playersNeeded: 6,
    checkInterval: 10000,
  },
  training: {
    mode: "training",
    playersNeeded: 1,
    checkInterval: 1000,
  },
};

class MatchmakingService {
  private activeMatches: Map<string, NodeJS.Timeout> = new Map();

  public startMatchmaking(mode: GameMode): void {
    const key = `matchmaking:${mode}`;

    // Don't start if already running
    if (this.activeMatches.has(key)) {
      return;
    }

    const config = MATCHMAKING_CONFIG[mode];
    const interval = setInterval(() => {
      this.tryCreateMatch(mode, config);
    }, config.checkInterval);

    this.activeMatches.set(key, interval);
  }

  public stopMatchmaking(mode: GameMode): void {
    const key = `matchmaking:${mode}`;
    const interval = this.activeMatches.get(key);

    if (interval) {
      clearInterval(interval);
      this.activeMatches.delete(key);
    }
  }

  private async tryCreateMatch(mode: GameMode, config: MatchmakingConfig): Promise<void> {
    try {
      const queue = await getGameQueue(mode);

      if (queue.length < config.playersNeeded) {
        return;
      }

      // Create match with required number of players
      const match = await createMatch(mode);
      if (!match) return;

      const playersToMatch = queue.slice(0, config.playersNeeded);

      // Assign players to teams
      let teamA = 0;
      let teamB = 0;

      for (let i = 0; i < playersToMatch.length; i++) {
        const player = playersToMatch[i];
        let team: "team_a" | "team_b" | "solo";

        if (mode === "1v1") {
          team = i === 0 ? "team_a" : "team_b";
        } else if (mode === "3v3") {
          if (teamA < 3) {
            team = "team_a";
            teamA++;
          } else {
            team = "team_b";
            teamB++;
          }
        } else {
          // training
          team = "solo";
        }

        await addPlayerToMatch(match.id, player.userId, team);
        await removeFromGameQueue(player.userId);
      }

      // Notify owner
      await notifyOwner({
        title: "Partida encontrada",
        content: `Partida ${mode} criada com ${config.playersNeeded} jogadores (ID: ${match.id})`,
      });

      console.log(`[Matchmaking] Created ${mode} match #${match.id} with ${config.playersNeeded} players`);
    } catch (error) {
      console.error(`[Matchmaking] Error creating match for ${mode}:`, error);

      await notifyOwner({
        title: "Erro no matchmaking",
        content: `Erro ao criar partida ${mode}: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }
  }
}

// Singleton instance
let matchmakingService: MatchmakingService | null = null;

export function getMatchmakingService(): MatchmakingService {
  if (!matchmakingService) {
    matchmakingService = new MatchmakingService();

    // Start matchmaking for all modes
    const modes: GameMode[] = ["1v1", "3v3", "training"];
    modes.forEach((mode) => {
      matchmakingService!.startMatchmaking(mode);
    });

    console.log("[Matchmaking] Service initialized and running for all modes");
  }

  return matchmakingService;
}

export function stopMatchmakingService(): void {
  if (matchmakingService) {
    const modes: GameMode[] = ["1v1", "3v3", "training"];
    modes.forEach((mode) => {
      matchmakingService!.stopMatchmaking(mode);
    });

    matchmakingService = null;
    console.log("[Matchmaking] Service stopped");
  }
}
