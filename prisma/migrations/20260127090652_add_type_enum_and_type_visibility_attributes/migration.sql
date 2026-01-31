-- CreateEnum
CREATE TYPE "Type" AS ENUM ('PRIVATE', 'PUBLIC');

-- AlterTable
ALTER TABLE "Content" ADD COLUMN     "visibility" "Type" NOT NULL DEFAULT 'PUBLIC';

-- AlterTable
ALTER TABLE "Space" ADD COLUMN     "type" "Type" NOT NULL DEFAULT 'PUBLIC';
