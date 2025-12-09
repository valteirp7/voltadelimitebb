CREATE TABLE `commission_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`formSubmissionId` int NOT NULL,
	`cardId` int,
	`commissionAmount` int NOT NULL,
	`commissionRate` int NOT NULL,
	`status` enum('pending','approved','withdrawn','cancelled') NOT NULL DEFAULT 'pending',
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `commission_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wallet` (
	`id` int AUTO_INCREMENT NOT NULL,
	`totalBalance` int NOT NULL DEFAULT 0,
	`totalCommissions` int NOT NULL DEFAULT 0,
	`withdrawnAmount` int NOT NULL DEFAULT 0,
	`pendingAmount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wallet_id` PRIMARY KEY(`id`)
);
