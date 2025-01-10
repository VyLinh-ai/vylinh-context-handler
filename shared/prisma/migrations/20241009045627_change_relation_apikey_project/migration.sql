/*
  Warnings:

  - You are about to drop the column `projectID` on the `APIKey` table. All the data in the column will be lost.
  - Added the required column `apiKeyID` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "APIKey" DROP CONSTRAINT "APIKey_projectID_fkey";

-- AlterTable
ALTER TABLE "APIKey" DROP COLUMN "projectID";

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "apiKeyID" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_apiKeyID_fkey" FOREIGN KEY ("apiKeyID") REFERENCES "APIKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
