-- AlterTable
ALTER TABLE "Content" ADD COLUMN     "uploadId" TEXT;

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_uploadId_fkey" FOREIGN KEY ("uploadId") REFERENCES "Upload"("id") ON DELETE SET NULL ON UPDATE CASCADE;
