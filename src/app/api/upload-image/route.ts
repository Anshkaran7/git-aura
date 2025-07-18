import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const name = formData.get('name') as string;

    if (!image) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      );
    }

    if (!process.env.IMGBB_API_KEY) {
      return NextResponse.json(
        { error: 'ImgBB API key not configured' },
        { status: 500 }
      );
    }

    // Create FormData for ImgBB
    const imgbbFormData = new FormData();
    imgbbFormData.append('image', image);
    if (name) {
      imgbbFormData.append('name', name);
    }

    const imgbbResponse = await fetch(
      `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
      {
        method: 'POST',
        body: imgbbFormData,
      }
    );

    if (!imgbbResponse.ok) {
      const errorData = await imgbbResponse.json();
      return NextResponse.json(
        { error: errorData.error?.message || 'Failed to upload image' },
        { status: imgbbResponse.status }
      );
    }

    const imgbbData = await imgbbResponse.json();
    
    return NextResponse.json({
      success: true,
      url: imgbbData.data.url,
      data: imgbbData.data
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
} 