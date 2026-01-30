/*
  Warnings:

  - You are about to drop the column `data` on the `Content` table. All the data in the column will be lost.
  - Changed the type of `type` on the `Content` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('IMAGE', 'FILE', 'NOTE');

-- AlterTable
ALTER TABLE "Content" DROP COLUMN "data",
ADD COLUMN     "text" TEXT,
ADD COLUMN     "url" TEXT,
DROP COLUMN "type",
ADD COLUMN     "type" "ContentType" NOT NULL,
ALTER COLUMN "size" DROP NOT NULL;
