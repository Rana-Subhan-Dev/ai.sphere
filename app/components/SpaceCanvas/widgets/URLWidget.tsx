import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { useWebView } from '../../../context/WebViewContext';

interface URLWidgetData {
  url: string;
  title?: string;
  favicon?: string;
  description?: string;
  status?: 'loading' | 'loaded' | 'error';
  lastVisited?: Date;
  preview?: string;
  category?: 'search' | 'social' | 'productivity' | 'entertainment' | 'development' | 'other';
  viewMode?: 'default' | 'preview';
}

interface URLWidgetProps {
  data: URLWidgetData;
  selected?: boolean;
}

const URLWidget: React.FC<URLWidgetProps> = ({ data, selected }) => {
  const { openWebView } = useWebView();
  const viewMode = data.viewMode || 'default';
  const [isHovering, setIsHovering] = useState(false);
  const showBg = isHovering || selected;

  const formatDomain = (url: string) => {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  if (viewMode === 'default') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {selected && (
            <div
              style={{
                position: 'absolute',
                top: -6,
                left: -6,
                width: 80 + 12,
                height: 64 + 12,
                background: 'rgba(0,0,0,0.035)',
                // backdropFilter: 'blur(8px)',
                // WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(0,0,0,0.03)',
                borderRadius: 5,
                zIndex: 0,
              }}
            />
          )}
          <div
            style={{
              width: 80,
              height: 64,
              backgroundColor: '#fff',
              borderRadius: 2,
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              zIndex: 1,
            }}
            onClick={() => {
              if (data.url) {
                const urlToOpen = data.url.startsWith('http') ? data.url : `https://${data.url}`;
                openWebView(urlToOpen);
              }
            }}
          >
            {data.favicon ? (
              <img
                src={data.favicon}
                alt="favicon"
                style={{ width: 24, height: 24, borderRadius: 6, background: '#f3f4f6', objectFit: 'contain' }}
                onError={e => (e.currentTarget.style.display = 'none')}
              />
            ) : (
              <Globe size={24} color="#9ca3af" strokeWidth={1.5} />
            )}
          </div>
        </div>
        {(data.title || data.url) && (
          <div
            style={{
              marginTop: 8,
              fontSize: 12,
              color: 'rgba(0, 0, 0, 0.4)',
              textAlign: 'center',
              maxWidth: 80,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              padding: '2px 6px',
              borderRadius: 6,
              background: showBg ? 'rgba(0,0,0,0.07)' : 'transparent',
              transition: 'background 0.2s',
              fontWeight: 400,
              backdropFilter: showBg ? 'blur(12px)' : undefined,
              WebkitBackdropFilter: showBg ? 'blur(12px)' : undefined,
            }}
          >
            {data.title || formatDomain(data.url)}
          </div>
        )}
      </div>
    );
  }

  // --- PREVIEW MODE: Full preview (existing logic) ---
  // (Keep your current preview logic here, but for now, it's not used)

  return null;
};

export default URLWidget; 