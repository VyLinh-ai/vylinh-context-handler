/*
  Warnings:

  - You are about to drop the column `chainID` on the `SmartContract` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `SmartContract` table. All the data in the column will be lost.
  - Made the column `deployedAt` on table `SmartContract` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "SmartContract" DROP COLUMN "chainID",
DROP COLUMN "createdAt",
ALTER COLUMN "deployedAt" SET NOT NULL,
ALTER COLUMN "deployedAt" SET DEFAULT CURRENT_TIMESTAMP;
