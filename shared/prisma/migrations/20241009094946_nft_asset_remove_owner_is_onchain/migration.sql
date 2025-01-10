/*
  Warnings:

  - You are about to drop the column `isOnchain` on the `NFTAsset` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `NFTAsset` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "NFTAsset" DROP CONSTRAINT "NFTAsset_ownerId_fkey";

-- AlterTable
ALTER TABLE "NFTAsset" DROP COLUMN "isOnchain",
DROP COLUMN "ownerId";
