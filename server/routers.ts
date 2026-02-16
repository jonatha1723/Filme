import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getOrCreatePlayerStats, updatePlayerStats, addToGameQueue, removeFromGameQueue, getGameQueue, createMatch, updateMatchStatus, addPlayerToMatch, updateMatchPlayerStats, getUserReplays, getGlobalRankings } from "./db";
import { notifyOwner } from "./_core/notification";
import { getMatchmakingService } from "./matchmaking";
import { ReplayRecorder } from "./replay";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Game Routers
  game: router({
    // Get player stats
    getStats: protectedProcedure.query(async ({ ctx }) => {
      return await getOrCreatePlayerStats(ctx.user.id);
    }),

    // Get global rankings
    getRankings: publicProcedure
      .input(z.object({ limit: z.number().default(100) }))
      .query(async ({ input }) => {
        return await getGlobalRankings(input.limit);
      }),

    // Join game queue or training
    joinQueue: protectedProcedure
      .input(z.object({ mode: z.enum(["1v1", "3v3", "training"]) }))
      .mutation(async ({ ctx, input }) => {
        // For training mode, create instant match (automatic entry)
        if (input.mode === "training") {
          const match = await createMatch("training");
          if (!match) {
            throw new Error("Failed to create training match");
          }

          await addPlayerToMatch(match.id, ctx.user.id, "solo");
          
          await notifyOwner({
            title: "Jogador entrou no Treinamento",
            content: `${ctx.user.name} entrou no modo Treinamento (Match ID: ${match.id})`,
          });

          return { success: true, matchId: match.id, instant: true };
        }

        // For multiplayer modes, add to queue
        await removeFromGameQueue(ctx.user.id);
        await addToGameQueue(ctx.user.id, input.mode);
        
        await notifyOwner({
          title: "Jogador entrou na fila",
          content: `${ctx.user.name} entrou na fila para ${input.mode}`,
        });

        return { success: true, instant: false };
      }),

    // Leave game queue
    leaveQueue: protectedProcedure.mutation(async ({ ctx }) => {
      await removeFromGameQueue(ctx.user.id);
      return { success: true };
    }),

    // Get queue status
    getQueueStatus: protectedProcedure
      .input(z.object({ mode: z.enum(["1v1", "3v3", "training"]) }))
      .query(async ({ input }) => {
        const queue = await getGameQueue(input.mode);
        return {
          mode: input.mode,
          playersWaiting: queue.length,
          estimatedWaitTime: queue.length > 0 ? Math.ceil(queue.length / (input.mode === "1v1" ? 2 : 6)) * 10 : 0,
        };
      }),

    // Get user replays
    getReplays: protectedProcedure.query(async ({ ctx }) => {
      return await getUserReplays(ctx.user.id);
    }),
  }),

  // Match Routers
  match: router({
    // Create match
    create: protectedProcedure
      .input(z.object({ mode: z.enum(["1v1", "3v3", "training"]) }))
      .mutation(async ({ input }) => {
        const match = await createMatch(input.mode);
        
        await notifyOwner({
          title: "Partida criada",
          content: `Nova partida ${input.mode} criada (ID: ${match?.id})`,
        });

        return { success: true, matchId: match?.id };
      }),

    // Start match
    start: protectedProcedure
      .input(z.object({ matchId: z.number() }))
      .mutation(async ({ input }) => {
        await updateMatchStatus(input.matchId, "in_progress");
        
        await notifyOwner({
          title: "Partida iniciada",
          content: `Partida ${input.matchId} foi iniciada`,
        });

        return { success: true };
      }),

    // End match
    end: protectedProcedure
      .input(z.object({
        matchId: z.number(),
        winnerId: z.number().optional(),
        winningTeam: z.enum(["team_a", "team_b"]).optional(),
      }))
      .mutation(async ({ input }) => {
        await updateMatchStatus(input.matchId, "finished", input.winnerId, input.winningTeam);
        
        await notifyOwner({
          title: "Partida finalizada",
          content: `Partida ${input.matchId} foi finalizada`,
        });

        return { success: true };
      }),

    // Update player match stats
    updatePlayerStats: protectedProcedure
      .input(z.object({
        matchId: z.number(),
        userId: z.number(),
        kills: z.number(),
        deaths: z.number(),
        assists: z.number(),
        damage: z.number(),
        survived: z.boolean(),
      }))
      .mutation(async ({ input }) => {
        await updateMatchPlayerStats(input.matchId, input.userId, {
          kills: input.kills,
          deaths: input.deaths,
          assists: input.assists,
          damage: input.damage,
          survived: input.survived,
        });

        return { success: true };
      }),
  }),

  // Replay Routers
  replay: router({
    // Get user replays
    getUserReplays: protectedProcedure.query(async ({ ctx }) => {
      return await getUserReplays(ctx.user.id);
    }),
  }),
});

// Initialize matchmaking service on startup
getMatchmakingService();

export type AppRouter = typeof appRouter;
