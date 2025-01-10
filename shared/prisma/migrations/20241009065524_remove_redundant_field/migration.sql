/*
  Warnings:

  - You are about to drop the column `apiKey` on the `Project` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Project_apiKey_key";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "apiKey";
