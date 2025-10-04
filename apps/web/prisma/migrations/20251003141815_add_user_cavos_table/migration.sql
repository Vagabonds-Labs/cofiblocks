-- CreateTable
CREATE TABLE "UserCavos" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "email" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accessToken" TEXT,
    "accessExpiration" TIMESTAMP(3),
    "refreshToken" TEXT,

    CONSTRAINT "UserCavos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserCavos_email_key" ON "UserCavos"("email");

-- CreateIndex
CREATE INDEX "UserCavos_email_idx" ON "UserCavos"("email");

-- CreateIndex
CREATE INDEX "UserCavos_walletAddress_idx" ON "UserCavos"("walletAddress");

-- CreateIndex
CREATE INDEX "UserCavos_network_idx" ON "UserCavos"("network");
