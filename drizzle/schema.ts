import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, bigint, float, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  nickname: varchar("nickname", { length: 32 }).unique(),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Player Statistics
export const playerStats = mysqlTable("playerStats", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  totalKills: int("totalKills").default(0).notNull(),
  totalDeaths: int("totalDeaths").default(0).notNull(),
  totalWins: int("totalWins").default(0).notNull(),
  totalLosses: int("totalLosses").default(0).notNull(),
  totalAssists: int("totalAssists").default(0).notNull(),
  totalMatches: int("totalMatches").default(0).notNull(),
  kdRatio: float("kdRatio").default(0).notNull(),
  winRate: float("winRate").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PlayerStats = typeof playerStats.$inferSelect;
export type InsertPlayerStats = typeof playerStats.$inferInsert;

// Matches
export const matches = mysqlTable("matches", {
  id: int("id").autoincrement().primaryKey(),
  mode: mysqlEnum("mode", ["1v1", "3v3", "training"]).notNull(),
  status: mysqlEnum("status", ["waiting", "in_progress", "finished"]).default("waiting").notNull(),
  duration: int("duration").default(0).notNull(), // in seconds
  winnerId: int("winnerId").references(() => users.id),
  winningTeam: mysqlEnum("winningTeam", ["team_a", "team_b"]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  finishedAt: timestamp("finishedAt"),
});

export type Match = typeof matches.$inferSelect;
export type InsertMatch = typeof matches.$inferInsert;

// Match Players (join table for players in a match)
export const matchPlayers = mysqlTable("matchPlayers", {
  id: int("id").autoincrement().primaryKey(),
  matchId: int("matchId").notNull().references(() => matches.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  team: mysqlEnum("team", ["team_a", "team_b", "solo"]).notNull(),
  kills: int("kills").default(0).notNull(),
  deaths: int("deaths").default(0).notNull(),
  assists: int("assists").default(0).notNull(),
  damage: int("damage").default(0).notNull(),
  survived: boolean("survived").default(false).notNull(),
});

export type MatchPlayer = typeof matchPlayers.$inferSelect;
export type InsertMatchPlayer = typeof matchPlayers.$inferInsert;

// Replays
export const replays = mysqlTable("replays", {
  id: int("id").autoincrement().primaryKey(),
  matchId: int("matchId").notNull().references(() => matches.id, { onDelete: "cascade" }),
  uploadedById: int("uploadedById").notNull().references(() => users.id, { onDelete: "cascade" }),
  s3Key: varchar("s3Key", { length: 512 }).notNull(),
  s3Url: text("s3Url").notNull(),
  fileSize: bigint("fileSize", { mode: "number" }).notNull(),
  duration: int("duration").notNull(), // in seconds
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Replay = typeof replays.$inferSelect;
export type InsertReplay = typeof replays.$inferInsert;

// Game Queue (for matchmaking)
export const gameQueue = mysqlTable("gameQueue", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  mode: mysqlEnum("mode", ["1v1", "3v3", "training"]).notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});

export type GameQueue = typeof gameQueue.$inferSelect;
export type InsertGameQueue = typeof gameQueue.$inferInsert;