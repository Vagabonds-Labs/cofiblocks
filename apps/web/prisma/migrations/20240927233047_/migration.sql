/*
  Warnings:

  - You are about to drop the column `farmName` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `region` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `strength` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `physicaaddress` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Product` DROP COLUMN `farmName`,
    DROP COLUMN `region`,
    DROP COLUMN `strength`;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `physicaaddress`,
    ADD COLUMN `physicalAddress` VARCHAR(191) NULL;
