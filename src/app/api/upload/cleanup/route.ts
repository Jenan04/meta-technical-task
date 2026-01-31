import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function POST(req: Request) {
  try {
    const { publicId, resourceType } = await req.json();

    if (!publicId) {
      return NextResponse.json({ error: "Missing publicId" }, { status: 400 });
    }
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType || 'image',
      invalidate: true 
    });

    console.log(`Cleanup Success for ID: ${publicId}`, result);

    return NextResponse.json({ 
      success: true, 
      result: result.result 
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Cleanup Route Error:", errorMessage);
    return NextResponse.json(
      { error: "Failed to cleanup file", details: errorMessage }, 
      { status: 500 }
    );
  }
}