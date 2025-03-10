-- AlterTable
ALTER TABLE `Product` 
ADD COLUMN `stock` INTEGER NOT NULL DEFAULT 0,
ADD COLUMN `hidden` BOOLEAN NULL DEFAULT false;

-- CreateExtension
-- This migration marks the existing stock and hidden fields in the Product table
-- These fields were previously added via db:push
-- This migration is for documentation purposes only and won't modify the database
SELECT 1; 