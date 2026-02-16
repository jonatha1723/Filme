import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, playerStats, InsertPlayerStats, gameQueue, matches, matchPlayers, InsertMatchPlayer, replays } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Player Statistics
export async function getOrCreatePlayerStats(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const existing = await db.select().from(playerStats).where(eq(playerStats.userId, userId)).limit(1);
  if (existing.length > 0) return existing[0];

  const newStats: InsertPlayerStats = {
    userId,
    totalKills: 0,
    totalDeaths: 0,
    totalWins: 0,
    totalLosses: 0,
    totalAssists: 0,
    totalMatches: 0,
    kdRatio: 0,
    winRate: 0,
  };

  await db.insert(playerStats).values(newStats);
  return (await db.select().from(playerStats).where(eq(playerStats.userId, userId)).limit(1))[0];
}

export async function updatePlayerStats(userId: number, updates: Partial<InsertPlayerStats>) {
  const db = await getDb();
  if (!db) return null;

  // Calculate KD ratio and win rate
  const stats = await db.select().from(playerStats).where(eq(playerStats.userId, userId)).limit(1);
  if (stats.length === 0) return null;

  const current = stats[0];
  const newKills = updates.totalKills ?? current.totalKills;
  const newDeaths = updates.totalDeaths ?? current.totalDeaths;
  const newWins = updates.totalWins ?? current.totalWins;
  const newMatches = updates.totalMatches ?? current.totalMatches;

  const kdRatio = newDeaths > 0 ? newKills / newDeaths : newKills;
  const winRate = newMatches > 0 ? (newWins / newMatches) * 100 : 0;

  await db.update(playerStats)
    .set({
      ...updates,
      kdRatio,
      winRate,
      updatedAt: new Date(),
    })
    .where(eq(playerStats.userId, userId));

  return (await db.select().from(playerStats).where(eq(playerStats.userId, userId)).limit(1))[0];
}

// Game Queue
export async function addToGameQueue(userId: number, mode: "1v1" | "3v3" | "training") {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(gameQueue).values({
    userId,
    mode,
  });

  return result;
}

export async function removeFromGameQueue(userId: number) {
  const db = await getDb();
  if (!db) return null;

  await db.delete(gameQueue).where(eq(gameQueue.userId, userId));
}

export async function getGameQueue(mode: "1v1" | "3v3" | "training") {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(gameQueue).where(eq(gameQueue.mode, mode));
}

// Matches
export async function createMatch(mode: "1v1" | "3v3" | "training") {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(matches).values({
    mode,
    status: "waiting",
  });

  const matchId = (result as any).insertId;
  return (await db.select().from(matches).where(eq(matches.id, matchId)).limit(1))[0];
}

export async function updateMatchStatus(matchId: number, status: "waiting" | "in_progress" | "finished", winnerId?: number, winningTeam?: "team_a" | "team_b") {
  const db = await getDb();
  if (!db) return null;

  const updates: any = { status };
  if (winnerId) updates.winnerId = winnerId;
  if (winningTeam) updates.winningTeam = winningTeam;
  if (status === "finished") updates.finishedAt = new Date();

  await db.update(matches).set(updates).where(eq(matches.id, matchId));
}

export async function addPlayerToMatch(matchId: number, userId: number, team: "team_a" | "team_b" | "solo") {
  const db = await getDb();
  if (!db) return null;

  return db.insert(matchPlayers).values({
    matchId,
    userId,
    team,
  });
}

export async function updateMatchPlayerStats(matchId: number, userId: number, stats: Partial<InsertMatchPlayer>) {
  const db = await getDb();
  if (!db) return null;

  await db.update(matchPlayers)
    .set(stats)
    .where(eq(matchPlayers.matchId, matchId) && eq(matchPlayers.userId, userId));
}

// Replays
export async function createReplay(matchId: number, uploadedById: number, s3Key: string, s3Url: string, fileSize: number, duration: number) {
  const db = await getDb();
  if (!db) return null;

  return db.insert(replays).values({
    matchId,
    uploadedById,
    s3Key,
    s3Url,
    fileSize,
    duration,
  });
}

export async function getUserReplays(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(replays).where(eq(replays.uploadedById, userId));
}

// Rankings
export async function getGlobalRankings(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];

  return db.select({
    user: users,
    stats: playerStats,
  }).from(playerStats)
    .innerJoin(users, eq(playerStats.userId, users.id))
    .orderBy((t) => t.stats.kdRatio)
    .limit(limit);
}
