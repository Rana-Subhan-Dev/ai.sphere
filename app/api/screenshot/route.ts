import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const targetUrl = searchParams.get('url');
  const serviceIndex = parseInt(searchParams.get('service') || '0');

  if (!targetUrl) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    // Validate URL
    const url = new URL(targetUrl);
    
    // Define working screenshot services
    const services = [
      // Method 1: Using free screenshot.guru
      async () => {
        const screenshotUrl = `https://image.thum.io/get/width/1200/crop/800/png/${encodeURIComponent(targetUrl)}`;
        return { screenshot: screenshotUrl };
      },

      // Method 2: Using htmlcsstoimage (free tier)
      async () => {
        const response = await fetch('https://hcti.io/v1/image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: targetUrl,
            viewport_width: 1200,
            viewport_height: 800,
            format: 'png'
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          return { screenshot: data.url };
        }
        throw new Error('HCTI service failed');
      },

      // Method 3: Using screenshot-api.net
      async () => {
        const screenshotUrl = `https://api.screenshotlayer.com/api/capture?access_key=YOUR_ACCESS_KEY&url=${encodeURIComponent(targetUrl)}&viewport=1200x800&format=PNG`;
        return { screenshot: screenshotUrl };
      },

      // Method 4: Simple fallback using Google's cache
      async () => {
        const screenshotUrl = `https://mini.s-shot.ru/1200x800/PNG/1200/Z100/?${encodeURIComponent(targetUrl)}`;
        return { screenshot: screenshotUrl };
      },

      // Method 5: Using WebShrinker (another free service)
      async () => {
        const screenshotUrl = `https://api.websitescreenshots.com/v1/screenshot?url=${encodeURIComponent(targetUrl)}&width=1200&height=800&format=png`;
        return { screenshot: screenshotUrl };
      }
    ];

    // Try the requested service or all services
    if (serviceIndex >= 0 && serviceIndex < services.length) {
      try {
        const result = await services[serviceIndex]();
        return NextResponse.json(result);
      } catch (err) {
        console.error(`Service ${serviceIndex} failed:`, err);
      }
    }

    // If specific service failed or no service specified, try all
    for (let i = 0; i < services.length; i++) {
      try {
        const result = await services[i]();
        return NextResponse.json(result);
      } catch (err) {
        console.error(`Service ${i} failed:`, err);
        continue;
      }
    }

    // If all services fail, return a placeholder
    return NextResponse.json({
      screenshot: `data:image/svg+xml;base64,${Buffer.from(`
        <svg width="1200" height="800" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#f3f4f6"/>
          <text x="50%" y="40%" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#6b7280">
            📸 Website Preview Unavailable
          </text>
          <text x="50%" y="50%" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#9ca3af">
            ${url.hostname}
          </text>
          <text x="50%" y="60%" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#d1d5db">
            Click "Open in Browser" to view this website
          </text>
        </svg>
      `).toString('base64')}`
    });

  } catch (error) {
    console.error('Screenshot API error:', error);
    
    return NextResponse.json({
      error: 'Failed to generate screenshot',
      screenshot: `data:image/svg+xml;base64,${Buffer.from(`
        <svg width="1200" height="800" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#fee2e2"/>
          <text x="50%" y="40%" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#dc2626">
            ❌ Screenshot Failed
          </text>
          <text x="50%" y="50%" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#7f1d1d">
            Unable to capture website
          </text>
          <text x="50%" y="60%" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#991b1b">
            Please open in browser instead
          </text>
        </svg>
      `).toString('base64')}`
    }, { status: 200 });
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 