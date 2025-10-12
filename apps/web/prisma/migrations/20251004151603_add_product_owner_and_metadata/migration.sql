-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "owner" TEXT,
ADD COLUMN     "initial_stock" INTEGER,
ADD COLUMN     "creation_tx_hash" TEXT;

-- CreateIndex
CREATE INDEX "Product_owner_idx" ON "Product"("owner");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_owner_fkey" FOREIGN KEY ("owner") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
