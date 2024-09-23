/*
  Warnings:

  - Added the required column `farmName` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `region` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `strength` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Product` ADD COLUMN `farmName` VARCHAR(191) NOT NULL,
    ADD COLUMN `region` VARCHAR(191) NOT NULL,
    ADD COLUMN `strength` VARCHAR(191) NOT NULL;
