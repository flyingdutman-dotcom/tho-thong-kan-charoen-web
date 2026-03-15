CREATE TABLE `portfolio` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100) NOT NULL,
	`beforeImage` varchar(500),
	`afterImage` varchar(500),
	`location` varchar(255),
	`completedDate` timestamp,
	`isPublished` enum('yes','no') NOT NULL DEFAULT 'yes',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `portfolio_id` PRIMARY KEY(`id`)
);
