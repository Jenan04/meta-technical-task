/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Space` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Space` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Space` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Space" ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Space_slug_key" ON "Space"("slug");
