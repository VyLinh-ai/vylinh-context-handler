/*
  Warnings:

  - A unique constraint covering the columns `[userId,nftAssetId,version]` on the table `NFTBalance` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,nftAssetId]` on the table `NFTBalance` will be added. If there are existing duplicate values, this will fail.
  - The required column `version` was added to the `NFTBalance` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "NFTBalance" ADD COLUMN     "lockAmount" DECIMAL(78,0) NOT NULL DEFAULT 0,
ADD COLUMN     "version" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "NFTBalance_userId_nftAssetId_version_key" ON "NFTBalance"("userId", "nftAssetId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "NFTBalance_userId_nftAssetId_key" ON "NFTBalance"("userId", "nftAssetId");
