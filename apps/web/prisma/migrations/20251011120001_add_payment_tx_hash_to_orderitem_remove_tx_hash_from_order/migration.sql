-- Add payment_tx_hash column to OrderItem table
ALTER TABLE "OrderItem" ADD COLUMN "payment_tx_hash" TEXT;

-- Remove tx_hash column from Order table
ALTER TABLE "Order" DROP COLUMN "tx_hash";
