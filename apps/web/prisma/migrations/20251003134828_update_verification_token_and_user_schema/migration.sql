-- DropTable (constraints will be dropped automatically)
DROP TABLE "Account";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "walletAddress" DROP NOT NULL;

-- AlterTable
-- Step 1: Add new columns as optional first
ALTER TABLE "VerificationToken" ADD COLUMN "id" TEXT;
ALTER TABLE "VerificationToken" ADD COLUMN "type" TEXT;
ALTER TABLE "VerificationToken" ADD COLUMN "email" TEXT;

-- Step 2: Populate the new columns with default values for existing rows
UPDATE "VerificationToken" SET 
  "id" = gen_random_uuid()::text,
  "type" = 'email',
  "email" = "identifier"
WHERE "id" IS NULL;

-- Step 3: Make the new columns required
ALTER TABLE "VerificationToken" ALTER COLUMN "id" SET NOT NULL;
ALTER TABLE "VerificationToken" ALTER COLUMN "type" SET NOT NULL;
ALTER TABLE "VerificationToken" ALTER COLUMN "email" SET NOT NULL;

-- Step 4: Add primary key constraint
ALTER TABLE "VerificationToken" ADD CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("id");

-- Step 5: Drop the old identifier column
ALTER TABLE "VerificationToken" DROP COLUMN "identifier";

-- DropIndex (if it exists)
DROP INDEX IF EXISTS "VerificationToken_identifier_token_key";

-- CreateIndex
CREATE INDEX "VerificationToken_email_idx" ON "VerificationToken"("email");

-- CreateIndex
CREATE INDEX "VerificationToken_type_idx" ON "VerificationToken"("type");
