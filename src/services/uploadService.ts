import { prisma } from "@/lib/prisma";
import { s3, S3_BUCKET_NAME } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { SpaceService } from "./spaceService";

export const UploadService = {

  async verifySpace (userId: string, spaceId: string) {
    return SpaceService.getSpace(spaceId, userId);   
  },
  async createUploadIntent(userId: string, spaceId?: string, type?: "IMAGE" | "FILE" | "NOTE") {
    if (spaceId) await this.verifySpace(userId, spaceId);
    const upload = await prisma.upload.create({
      data: { userId, spaceId, type, status: "PENDING" },
    });
    return upload;
  },

  async uploadFile(uploadId: string, userId: string, spaceId: string, fileBuffer: Buffer, fileName: string, type: "IMAGE" | "FILE") {
    const s3Key = `${userId}/${spaceId}/${uploadId}-${fileName}`;
    await s3.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: s3Key,
        Body: fileBuffer,
        ContentType: type === "IMAGE" ? "image/png" : "application/octet-stream",
      })
    );

    return `https://${S3_BUCKET_NAME}.s3.amazonaws.com/${s3Key}`;
  },

  async confirmUpload(uploadId: string, url: string, size: number) {
    return prisma.upload.update({
      where: { id: uploadId },
      data: { status: "COMPLETED", fileUrl: url, size },
    });
  },

  async createContentFromUpload(uploadId: string, spaceId: string, visibility: "PRIVATE" | "PUBLIC" = "PUBLIC", text?: string) {
    const upload = await prisma.upload.findUnique({ where: { id: uploadId } });
    if (!upload) throw new Error("Upload not found");
    if (upload.status !== "COMPLETED") throw new Error("Upload not completed yet");

    return prisma.content.create({
      data: {
        type: upload.type!,
        text: upload.type === "NOTE" ? text : null,
        url: upload.fileUrl,
        size: upload.size,
        visibility,
        spaceId,
        uploadId,
      },
    });
  },

  async getSpaceContents(spaceId: string) {
    return prisma.content.findMany({ where: { spaceId } });
  },
  async addContent(userId: string, spaceId: string, type: "IMAGE" | "FILE" | "NOTE", text?: string, fileName?: string, fileBuffer?: Buffer, visibility: "PRIVATE" | "PUBLIC" = "PRIVATE") {
    const upload = await this.createUploadIntent(userId, spaceId, type);

    let url: string | undefined;
    let size = 0;

    if (type === "IMAGE" || type === "FILE") {
      if (!fileBuffer || !fileName) throw new Error("fileBuffer and fileName required");
      size = fileBuffer.length;
      url = await this.uploadFile(upload.id, userId, spaceId, fileBuffer, fileName, type);
      await this.confirmUpload(upload.id, url, size);
    } else if (type === "NOTE") {
      size = text?.length ?? 0;
      await this.confirmUpload(upload.id, "", size);
    }

    return this.createContentFromUpload(upload.id, spaceId, visibility, text);
  },
  
  async deleteContent(id: string) {
    try {
      return await prisma.content.delete({
        where: { id },
      });
    } catch (error) {
      throw new Error("Failed to delete content");
    }
  },
};
