import { NextRequest, NextResponse } from 'next/server';

const IPOLOWO_API_URL = 'https://api.connectnigeria.com/api/v2/ipolowo/banners';

/**
 * Proxy endpoint for ConnectNigeria Ipolowo ads API.
 * Avoids CORS issues by making the request server-side.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sizes = searchParams.get('sizes');

  if (!sizes) {
    return NextResponse.json({ error: 'Missing sizes parameter' }, { status: 400 });
  }

  try {
    const url = `${IPOLOWO_API_URL}?sizes=${encodeURIComponent(sizes)}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // Add timeout
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      console.error('[Ads API] ConnectNigeria API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch ads from ConnectNigeria' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data.data || data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error('[Ads API] Error fetching banners:', error);
    
    // Return empty response instead of error to prevent breaking the page
    return NextResponse.json({}, {
      headers: {
        'Cache-Control': 'public, s-maxage=60', // Cache failures for 1 minute
      },
    });
  }
}
