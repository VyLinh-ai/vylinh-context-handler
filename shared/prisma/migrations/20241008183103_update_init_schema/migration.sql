/*
  Warnings:

  - You are about to drop the column `mediaUrl` on the `NFTAsset` table. All the data in the column will be lost.
  - You are about to drop the column `metadataUrl` on the `NFTAsset` table. All the data in the column will be lost.
  - You are about to drop the column `projectId` on the `SmartContract` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[apiKey]` on the table `Project` will be added. If there are existing duplicate values, this will fail.
  - The required column `apiKey` was added to the `Project` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `contractAddress` to the `SmartContract` table without a default value. This is not possible if the table is not empty.
  - Added the required column `networkID` to the `SmartContract` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "KEY_ROLE" AS ENUM ('MASTER', 'GD');

-- AlterEnum
ALTER TYPE "TX_STATUS" ADD VALUE 'PENDING';

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_userId_fkey";

-- DropForeignKey
ALTER TABLE "SmartContract" DROP CONSTRAINT "SmartContract_projectId_fkey";

-- AlterTable
ALTER TABLE "NFTAsset" DROP COLUMN "mediaUrl",
DROP COLUMN "metadataUrl",
ADD COLUMN     "isOnchain" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "apiKey" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SmartContract" DROP COLUMN "projectId",
ADD COLUMN     "contractAddress" VARCHAR(42) NOT NULL,
ADD COLUMN     "networkID" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "TXOnchainHistory" (
    "id" TEXT NOT NULL,
    "type" "ContractType" NOT NULL,
    "amount" DECIMAL(78,0) NOT NULL DEFAULT 1,
    "from" VARCHAR(42) NOT NULL,
    "to" VARCHAR(42) NOT NULL,
    "status" "TX_STATUS" NOT NULL,
    "txHash" TEXT NOT NULL,

    CONSTRAINT "TXOnchainHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "APIKey" (
    "id" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "projectID" TEXT NOT NULL,
    "isBlackListed" BOOLEAN NOT NULL,
    "roles" "KEY_ROLE" NOT NULL,

    CONSTRAINT "APIKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaStorage" (
    "id" TEXT NOT NULL,
    "S3Url" TEXT NOT NULL,
    "IPFSUrl" TEXT NOT NULL,
    "AssetId" TEXT NOT NULL,

    CONSTRAINT "MediaStorage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Metadata" (
    "id" TEXT NOT NULL,
    "metadata" JSONB,
    "IPFSUrl" TEXT,
    "AssetId" TEXT NOT NULL,

    CONSTRAINT "Metadata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MediaStorage_AssetId_key" ON "MediaStorage"("AssetId");

-- CreateIndex
CREATE UNIQUE INDEX "Metadata_AssetId_key" ON "Metadata"("AssetId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_apiKey_key" ON "Project"("apiKey");

-- AddForeignKey
ALTER TABLE "APIKey" ADD CONSTRAINT "APIKey_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaStorage" ADD CONSTRAINT "MediaStorage_AssetId_fkey" FOREIGN KEY ("AssetId") REFERENCES "NFTAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Metadata" ADD CONSTRAINT "Metadata_AssetId_fkey" FOREIGN KEY ("AssetId") REFERENCES "NFTAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmartContract" ADD CONSTRAINT "SmartContract_networkID_fkey" FOREIGN KEY ("networkID") REFERENCES "Network"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
