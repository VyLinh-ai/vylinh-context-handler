-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "nameSlug" TEXT;

-- AlterTable
ALTER TABLE "SmartContract" ADD COLUMN     "nameSlug" TEXT;

-- CreateIndex
CREATE INDEX "Project_nameSlug_idx" ON "Project"("nameSlug");

-- CreateIndex
CREATE INDEX "SmartContract_nameSlug_idx" ON "SmartContract"("nameSlug");
