/*
  Warnings:

  - You are about to drop the column `userId` on the `Project` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[apiKey]` on the table `APIKey` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "userId";

-- CreateIndex
CREATE UNIQUE INDEX "APIKey_apiKey_key" ON "APIKey"("apiKey");
