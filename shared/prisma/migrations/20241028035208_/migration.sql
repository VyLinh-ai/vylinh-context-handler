-- CreateEnum
CREATE TYPE "PLATFORM" AS ENUM ('TG', 'WEB', 'WIN', 'MAC');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "isEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "platform" "PLATFORM"[] DEFAULT ARRAY[]::"PLATFORM"[];
