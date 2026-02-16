CREATE TABLE `gameQueue` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`mode` enum('1v1','3v3','training') NOT NULL,
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gameQueue_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `matchPlayers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`matchId` int NOT NULL,
	`userId` int NOT NULL,
	`team` enum('team_a','team_b','solo') NOT NULL,
	`kills` int NOT NULL DEFAULT 0,
	`deaths` int NOT NULL DEFAULT 0,
	`assists` int NOT NULL DEFAULT 0,
	`damage` int NOT NULL DEFAULT 0,
	`survived` boolean NOT NULL DEFAULT false,
	CONSTRAINT `matchPlayers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `matches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mode` enum('1v1','3v3','training') NOT NULL,
	`status` enum('waiting','in_progress','finished') NOT NULL DEFAULT 'waiting',
	`duration` int NOT NULL DEFAULT 0,
	`winnerId` int,
	`winningTeam` enum('team_a','team_b'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`finishedAt` timestamp,
	CONSTRAINT `matches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `playerStats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`totalKills` int NOT NULL DEFAULT 0,
	`totalDeaths` int NOT NULL DEFAULT 0,
	`totalWins` int NOT NULL DEFAULT 0,
	`totalLosses` int NOT NULL DEFAULT 0,
	`totalAssists` int NOT NULL DEFAULT 0,
	`totalMatches` int NOT NULL DEFAULT 0,
	`kdRatio` float NOT NULL DEFAULT 0,
	`winRate` float NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `playerStats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `replays` (
	`id` int AUTO_INCREMENT NOT NULL,
	`matchId` int NOT NULL,
	`uploadedById` int NOT NULL,
	`s3Key` varchar(512) NOT NULL,
	`s3Url` text NOT NULL,
	`fileSize` bigint NOT NULL,
	`duration` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `replays_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `nickname` varchar(32);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_nickname_unique` UNIQUE(`nickname`);--> statement-breakpoint
ALTER TABLE `gameQueue` ADD CONSTRAINT `gameQueue_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `matchPlayers` ADD CONSTRAINT `matchPlayers_matchId_matches_id_fk` FOREIGN KEY (`matchId`) REFERENCES `matches`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `matchPlayers` ADD CONSTRAINT `matchPlayers_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `matches` ADD CONSTRAINT `matches_winnerId_users_id_fk` FOREIGN KEY (`winnerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `playerStats` ADD CONSTRAINT `playerStats_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `replays` ADD CONSTRAINT `replays_matchId_matches_id_fk` FOREIGN KEY (`matchId`) REFERENCES `matches`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `replays` ADD CONSTRAINT `replays_uploadedById_users_id_fk` FOREIGN KEY (`uploadedById`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;