import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { scanReceiptWithGemini } from '@/lib/receipt-scanner';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
];

const MAX_FILE_SIZE_BYTES = 12 * 1024 * 1024; // 12 MB

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'Please upload a valid receipt or invoice file.' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: 'File size exceeds maximum 12MB limit.' }, { status: 400 });
    }

    let mimeType = file.type || 'application/pdf';
    // Normalize generic octet-stream by filename extension
    if (mimeType === 'application/octet-stream' && 'name' in file) {
      const fileName = (file as File).name.toLowerCase();
      if (fileName.endsWith('.pdf')) mimeType = 'application/pdf';
      else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) mimeType = 'image/jpeg';
      else if (fileName.endsWith('.png')) mimeType = 'image/png';
      else if (fileName.endsWith('.webp')) mimeType = 'image/webp';
    }

    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { error: `Unsupported file format (${mimeType}). Please upload a PDF, PNG, JPG, or WEBP file.` },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');

    const result = await scanReceiptWithGemini(base64Data, mimeType);

    if (!result) {
      return NextResponse.json({ error: 'Failed to extract data from this receipt.' }, { status: 422 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('[Scan Receipt API Error]', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to scan receipt. Please verify GEMINI_API_KEY is configured.' },
      { status: 500 }
    );
  }
}
