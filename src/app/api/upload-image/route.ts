import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Upload image request received');
    
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const name = formData.get('name') as string;

    console.log('Image file:', image ? `${image.name} (${image.size} bytes)` : 'No image');
    console.log('Name:', name);

    if (!image) {
      console.log('Error: No image provided');
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      );
    }

    if (!process.env.NEXT_PUBLIC_IMGBB_API_KEY) {
      console.log('Error: ImgBB API key not configured');
      return NextResponse.json(
        { error: 'ImgBB API key not configured' },
        { status: 500 }
      );
    }

    console.log('Converting image to base64...');
    
    // Convert File to base64 for ImgBB
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');

    console.log('Base64 image length:', base64Image.length);

    // Create FormData for ImgBB
    const imgbbFormData = new FormData();
    imgbbFormData.append('image', base64Image);
    if (name) {
      imgbbFormData.append('name', name);
    }

    console.log('Uploading to ImgBB...');

    const imgbbResponse = await fetch(
      `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
      {
        method: 'POST',
        body: imgbbFormData,
      }
    );

    console.log('ImgBB response status:', imgbbResponse.status);

    if (!imgbbResponse.ok) {
      const errorData = await imgbbResponse.json();
      console.log('ImgBB error:', errorData);
      return NextResponse.json(
        { error: errorData.error?.message || 'Failed to upload image' },
        { status: imgbbResponse.status }
      );
    }

    const imgbbData = await imgbbResponse.json();
    console.log('ImgBB success:', imgbbData.data?.url);
    
    return NextResponse.json({
      success: true,
      url: imgbbData.data.url,
      data: imgbbData.data
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: `Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 