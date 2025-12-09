CREATE TABLE `cards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`holderName` varchar(255) NOT NULL,
	`sentBy` varchar(255) NOT NULL,
	`limitReturned` int NOT NULL,
	`commissionRate` int NOT NULL,
	`status` enum('pending','completed','cancelled') DEFAULT 'pending',
	`email` varchar(320),
	`password` varchar(255),
	`fatherName` varchar(255),
	`motherName` varchar(255),
	`category` varchar(100),
	`createdDate` timestamp DEFAULT (now()),
	`documentSentDate` timestamp,
	`limitReturnedDate` timestamp,
	`formSubmissionId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `form_submissions` ADD `sentBy` varchar(255);--> statement-breakpoint
ALTER TABLE `form_submissions` ADD `limitReturned` int;--> statement-breakpoint
ALTER TABLE `form_submissions` ADD `commissionRate` int;--> statement-breakpoint
ALTER TABLE `form_submissions` ADD `documentSentDate` timestamp;--> statement-breakpoint
ALTER TABLE `form_submissions` ADD `limitReturnedDate` timestamp;--> statement-breakpoint
ALTER TABLE `form_submissions` ADD `category` varchar(100);--> statement-breakpoint
ALTER TABLE `form_submissions` ADD `cardId` int;