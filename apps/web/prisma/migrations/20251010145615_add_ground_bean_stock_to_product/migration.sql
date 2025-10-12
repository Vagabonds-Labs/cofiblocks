-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "ground_stock" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "bean_stock" INTEGER NOT NULL DEFAULT 0;
