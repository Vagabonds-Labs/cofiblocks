/*
  Warnings:

  - Added the required column `tokenId` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Product` ADD COLUMN `tokenId` INTEGER NOT NULL;
