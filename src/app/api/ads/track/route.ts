import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy endpoint for tracking ad impressions and clicks.
 * Avoids CORS issues by making the request server-side.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, type } = body;

    if (!url || !type) {
      return NextResponse.json({ error: 'Missing url or type' }, { status: 400 });
    }

    // Fire the tracking pixel/beacon
    await fetch(url, {
      method: 'GET',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    }).catch((error) => {
      // Log but don't fail - tracking is non-critical
      console.error(`[Ads API] ${type} tracking failed:`, error);
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Ads API] Error tracking:', error);
    // Return success anyway - tracking failures shouldn't break the page
    return NextResponse.json({ success: true });
  }
}
