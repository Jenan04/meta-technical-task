import { prisma } from "@/lib/prisma";
// import { s3, S3_BUCKET_NAME } from "@/lib/s3";
// import { PutObjectCommand } from "@aws-sdk/client-s3";
// import { v4 as uuidv4 } from "uuid";
import cloudinary from "@/lib/cloudinary";
import { SpaceService } from "./spaceService";
import { CloudinaryError } from "@/types"
export const UploadService = {

  async verifySpace (userId: string, spaceId: string) {
    return SpaceService.getSpace(spaceId, userId);   
  },
  async createUploadIntent(userId: string, spaceId?: string, type?: "IMAGE" | "FILE" | "NOTE") {
    if (spaceId) await this.verifySpace(userId, spaceId);
    return await prisma.upload.create({
      data: { 
        userId, 
        spaceId, 
        type, 
        status: "PENDING" 
      },
    });
    // return upload;
  },
  async markUploadAsFailed(uploadId: string) {
    return await prisma.upload.update({
      where: { id: uploadId },
      data: { status: "FAILED" },
    });
  },

  // 3. الربط النهائي (التحويل من PENDING إلى COMPLETED)
  async finalizeUpload(uploadId: string, url: string, size: number, visibility: "PRIVATE" | "PUBLIC") {
    // نستخدم transaction لضمان أن التحديث وإنشاء المحتوى يتمان معاً
    return await prisma.$transaction(async (tx) => {
      const upload = await tx.upload.update({
        where: { id: uploadId },
        data: {
          status: "COMPLETED",
          fileUrl: url,
          size: Math.round(size),
        },
      });

      return await tx.content.create({
        data: {
          type: upload.type!,
          url: upload.fileUrl,
          size: upload.size,
          spaceId: upload.spaceId!,
          uploadId: upload.id,
          visibility,
        },
      });
    });
  },

  // 4. استرجاع الملفات المعلقة (هذا ما يجعل السيرفر "واعياً" بالنت المفصول)
  async getPendingUploads(userId: string) {
    return await prisma.upload.findMany({
      where: {
        userId,
        status: "PENDING",
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // آخر 24 ساعة فقط
        },
      },
    });
  },



async uploadFile(uploadId: string, userId: string, spaceId: string, fileBuffer: Buffer, fileName: string, type: "IMAGE" | "FILE") {
  try {
    // تحويل الـ Buffer لسلسلة نصية Base64
    const base64Data = fileBuffer.toString('base64');
    const fileUri = `data:${type === "IMAGE" ? "image/png" : "application/octet-stream"};base64,${base64Data}`;

    const result = await cloudinary.uploader.upload(fileUri, {
      public_id: `upload_${uploadId}`,
      folder: `user_${userId}/space_${spaceId}`,
      resource_type: type === "IMAGE" ? "image" : "raw",
      // إضافة timeout لضمان عدم التعليق
      timeout: 60000 
    });

    return result.secure_url;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error 
        ? error.message 
        : (error as CloudinaryError).message || "Failed to upload to Cloudinary";
    console.error("Cloudinary Upload Error:", errorMessage);
    throw new Error(errorMessage );
  }
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
  async addDirectContent(args: {
    userId: string;
    spaceId: string;
    type: "IMAGE" | "FILE" | "NOTE";
    url?: string;
    size?: number;
    text?: string;
    visibility: "PRIVATE" | "PUBLIC";
  }) {
    const { userId, spaceId, type, url, size, text, visibility } = args;

    // 1. إنشاء سجل الرفع كـ COMPLETED فوراً
    const upload = await prisma.upload.create({
      data: {
        userId,
        spaceId,
        type,
        status: "COMPLETED",
        fileUrl: url || "",
        size: size || 0,
      },
    });

    // 2. إنشاء المحتوى المرتبط
    return await prisma.content.create({
      data: {
        type: upload.type!,
        text: type === "NOTE" ? text : null,
        url: upload.fileUrl,
        size: upload.size,
        visibility,
        spaceId,
        uploadId: upload.id,
      },
    });
  },
};
