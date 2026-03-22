CREATE TABLE `daily_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dlNumber` varchar(50) NOT NULL,
	`projectName` varchar(255) NOT NULL,
	`logDate` date NOT NULL,
	`workersCount` int NOT NULL,
	`equipmentUsed` text,
	`workDone` text,
	`obstacles` text,
	`weatherCondition` varchar(100),
	`safetyIncidents` text,
	`supervisor` varchar(255) NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `daily_logs_id` PRIMARY KEY(`id`),
	CONSTRAINT `daily_logs_dlNumber_unique` UNIQUE(`dlNumber`)
);
--> statement-breakpoint
CREATE TABLE `delivery_orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`doNumber` varchar(50) NOT NULL,
	`quoteId` int,
	`customerName` varchar(255) NOT NULL,
	`workDate` date NOT NULL,
	`workDescription` text NOT NULL,
	`workQuality` varchar(100),
	`customerSignature` varchar(500),
	`signedDate` date,
	`status` enum('draft','pending-signature','signed','rejected') NOT NULL DEFAULT 'draft',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `delivery_orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `delivery_orders_doNumber_unique` UNIQUE(`doNumber`)
);
--> statement-breakpoint
CREATE TABLE `field_service_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fsrNumber` varchar(50) NOT NULL,
	`joId` int,
	`technician` varchar(255) NOT NULL,
	`workDate` date NOT NULL,
	`startTime` varchar(10),
	`endTime` varchar(10),
	`pipeLength` decimal(8,2),
	`wasteQuantity` varchar(255),
	`beforePhotoUrl` varchar(500),
	`afterPhotoUrl` varchar(500),
	`workCompleted` boolean NOT NULL DEFAULT false,
	`issues` text,
	`customerSignature` varchar(500),
	`status` enum('draft','pending-approval','approved','rejected') NOT NULL DEFAULT 'draft',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `field_service_reports_id` PRIMARY KEY(`id`),
	CONSTRAINT `field_service_reports_fsrNumber_unique` UNIQUE(`fsrNumber`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoiceNumber` varchar(50) NOT NULL,
	`doId` int,
	`customerName` varchar(255) NOT NULL,
	`customerTaxId` varchar(50),
	`customerAddress` text,
	`invoiceDate` date NOT NULL,
	`dueDate` date,
	`laborCost` decimal(12,2) NOT NULL,
	`materialCost` decimal(12,2) NOT NULL DEFAULT '0',
	`taxRate` decimal(5,2) NOT NULL DEFAULT '7',
	`taxAmount` decimal(12,2) NOT NULL,
	`totalAmount` decimal(12,2) NOT NULL,
	`paymentStatus` enum('unpaid','partial','paid') NOT NULL DEFAULT 'unpaid',
	`paymentMethod` varchar(100),
	`paidAmount` decimal(12,2) NOT NULL DEFAULT '0',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_invoiceNumber_unique` UNIQUE(`invoiceNumber`)
);
--> statement-breakpoint
CREATE TABLE `job_orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`joNumber` varchar(50) NOT NULL,
	`customerName` varchar(255) NOT NULL,
	`customerPhone` varchar(20) NOT NULL,
	`serviceType` varchar(100) NOT NULL,
	`workLocation` text NOT NULL,
	`problemDescription` text NOT NULL,
	`scheduledDate` date NOT NULL,
	`scheduledTime` varchar(10),
	`estimatedDuration` varchar(50),
	`assignedTo` varchar(255),
	`status` enum('draft','scheduled','in-progress','completed','cancelled') NOT NULL DEFAULT 'draft',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `job_orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `job_orders_joNumber_unique` UNIQUE(`joNumber`)
);
--> statement-breakpoint
CREATE TABLE `purchase_orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`poNumber` varchar(50) NOT NULL,
	`prId` int,
	`supplierName` varchar(255) NOT NULL,
	`supplierContact` varchar(255),
	`itemDescription` text NOT NULL,
	`quantity` int NOT NULL,
	`unitPrice` decimal(12,2) NOT NULL,
	`totalAmount` decimal(12,2) NOT NULL,
	`deliveryDate` date,
	`status` enum('draft','sent','confirmed','delivered','cancelled') NOT NULL DEFAULT 'draft',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `purchase_orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `purchase_orders_poNumber_unique` UNIQUE(`poNumber`)
);
--> statement-breakpoint
CREATE TABLE `purchase_requisitions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`prNumber` varchar(50) NOT NULL,
	`requestedBy` varchar(255) NOT NULL,
	`itemDescription` text NOT NULL,
	`estimatedCost` decimal(12,2) NOT NULL,
	`purpose` text NOT NULL,
	`status` enum('draft','pending','approved','rejected') NOT NULL DEFAULT 'draft',
	`approvedBy` varchar(255),
	`approvedAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `purchase_requisitions_id` PRIMARY KEY(`id`),
	CONSTRAINT `purchase_requisitions_prNumber_unique` UNIQUE(`prNumber`)
);
--> statement-breakpoint
CREATE TABLE `quotations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quoteNumber` varchar(50) NOT NULL,
	`customerName` varchar(255) NOT NULL,
	`customerPhone` varchar(20) NOT NULL,
	`customerEmail` varchar(320),
	`serviceType` varchar(100) NOT NULL,
	`workLocation` text NOT NULL,
	`scopeOfWork` text NOT NULL,
	`laborCost` decimal(12,2) NOT NULL,
	`materialCost` decimal(12,2) NOT NULL DEFAULT '0',
	`totalAmount` decimal(12,2) NOT NULL,
	`validUntil` date,
	`status` enum('draft','sent','accepted','rejected','expired') NOT NULL DEFAULT 'draft',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quotations_id` PRIMARY KEY(`id`),
	CONSTRAINT `quotations_quoteNumber_unique` UNIQUE(`quoteNumber`)
);
--> statement-breakpoint
CREATE TABLE `stock_requisitions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`srNumber` varchar(50) NOT NULL,
	`requestedBy` varchar(255) NOT NULL,
	`projectName` varchar(255) NOT NULL,
	`itemDescription` text NOT NULL,
	`quantity` int NOT NULL,
	`status` enum('draft','approved','issued','returned') NOT NULL DEFAULT 'draft',
	`approvedBy` varchar(255),
	`approvedAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stock_requisitions_id` PRIMARY KEY(`id`),
	CONSTRAINT `stock_requisitions_srNumber_unique` UNIQUE(`srNumber`)
);
