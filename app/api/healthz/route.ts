import { kv } from '@/lib/kv';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const ping = await kv.ping();
    if (ping === 'PONG') {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ ok: false, error: 'Redis ping failed' }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 });
  }
}
