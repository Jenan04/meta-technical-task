import { NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3, S3_BUCKET_NAME } from '@/lib/s3';
import { nanoid } from 'nanoid';
import { UploadService } from '@/services/uploadService';

export const POST = async (req: Request) => {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const userId = formData.get('userId') as string;
  const spaceId = formData.get('spaceId') as string;

  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });
  if (!userId || !spaceId) return NextResponse.json({ error: 'Missing userId or spaceId' }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const key = `${userId}/${spaceId}/${nanoid()}-${file.name}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    })
  );

  const upload = await UploadService.createUploadIntent(userId, spaceId, "FILE");

  await UploadService.confirmUpload(upload.id, `https://${S3_BUCKET_NAME}.s3.amazonaws.com/${key}`, buffer.length);

  const content = await UploadService.createContentFromUpload(upload.id, spaceId, "PUBLIC");

  return NextResponse.json({
    url: `https://${S3_BUCKET_NAME}.s3.amazonaws.com/${key}`,
    size: buffer.length,
    fileName: file.name,
    content,
  });
}
