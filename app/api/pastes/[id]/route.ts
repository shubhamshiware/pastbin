import { fetchAndDecrementPaste } from '@/lib/kv';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await fetchAndDecrementPaste(id);

    if (!result) {
      return NextResponse.json({ error: 'Paste not found or expired' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
