import { NextResponse } from 'next/server';
import { generateMetrics } from '@/lib/server/metrics-generator';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const payload = generateMetrics();
    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  } catch {
    return NextResponse.json(
      {
        message: 'メトリクスの生成に失敗しました。'
      },
      { status: 500 }
    );
  }
}
