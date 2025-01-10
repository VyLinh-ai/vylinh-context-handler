-- AlterTable
ALTER TABLE "SmartContract" ALTER COLUMN "deployedAt" DROP NOT NULL,
ALTER COLUMN "deployedAt" DROP DEFAULT;
