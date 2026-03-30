ALTER TABLE `delivery_orders` MODIFY COLUMN `quoteId` int DEFAULT null;--> statement-breakpoint
ALTER TABLE `field_service_reports` MODIFY COLUMN `joId` int DEFAULT null;--> statement-breakpoint
ALTER TABLE `invoices` MODIFY COLUMN `doId` int DEFAULT null;--> statement-breakpoint
ALTER TABLE `purchase_orders` MODIFY COLUMN `prId` int DEFAULT null;