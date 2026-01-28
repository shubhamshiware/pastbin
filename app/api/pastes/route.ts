import { kv, getNow } from '@/lib/kv';
import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, ttl_seconds, max_views } = body;

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json({ error: 'Content is required and must be a non-empty string' }, { status: 400 });
    }

    if (ttl_seconds !== undefined && (!Number.isInteger(ttl_seconds) || ttl_seconds < 1)) {
      return NextResponse.json({ error: 'ttl_seconds must be an integer >= 1' }, { status: 400 });
    }

    if (max_views !== undefined && (!Number.isInteger(max_views) || max_views < 1)) {
      return NextResponse.json({ error: 'max_views must be an integer >= 1' }, { status: 400 });
    }

    const id = nanoid(10);
    const key = `paste:${id}`;
    const now = await getNow();
    
    const expires_at_ms = ttl_seconds ? now + ttl_seconds * 1000 : null;
    const expires_at = expires_at_ms ? new Date(expires_at_ms).toISOString() : null;
    
    const pasteData: Record<string, string | number> = {
      content,
      remaining_views: max_views ?? -1, // -1 means no limit
    };
    
    if (expires_at) {
      pasteData.expires_at = expires_at;
      pasteData.expires_at_ms = expires_at_ms!;
    }

    await kv.hset(key, pasteData);

    if (ttl_seconds) {
      await kv.expire(key, ttl_seconds);
    }

    const host = request.headers.get('host');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    const url = `${protocol}://${host}/p/${id}`;

    return NextResponse.json({ id, url }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
