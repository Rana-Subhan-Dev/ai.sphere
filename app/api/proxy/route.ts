import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    // Validate URL
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    
    // Fetch the content
    const response = await fetch(urlObj.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: `HTTP ${response.status}: ${response.statusText}` }, { status: response.status });
    }

    const contentType = response.headers.get('content-type');
    
    // If it's HTML, we can serve it
    if (contentType && contentType.includes('text/html')) {
      const html = await response.text();
      
      // Modify the HTML to work in an iframe
      const modifiedHtml = html
        .replace(/<head>/i, '<head><base target="_blank">')
        .replace(/<script[^>]*>/gi, '<!-- <script> -->')
        .replace(/<\/script>/gi, '<!-- </script> -->');
      
      return new NextResponse(modifiedHtml, {
        headers: {
          'Content-Type': 'text/html',
          'X-Frame-Options': 'SAMEORIGIN',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    // For other content types, return as-is
    const content = await response.arrayBuffer();
    
    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType || 'application/octet-stream',
        'X-Frame-Options': 'SAMEORIGIN',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Failed to fetch URL' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
} 