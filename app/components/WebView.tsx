'use client';

import { useState, useEffect, useRef } from 'react';
import { X, RotateCcw, Globe, ExternalLink, ImageIcon } from 'lucide-react';

interface WebViewProps {
  isVisible: boolean;
  onClose: () => void;
  initialUrl: string;
  isOpening?: boolean;
}

// Sites that block embedding - just redirect these
const REDIRECT_DOMAINS = [
  'linkedin.com', 'whatsapp.com', 'facebook.com', 'instagram.com',
  'twitter.com', 'x.com', 'youtube.com', 'google.com', 'github.com',
  'stackoverflow.com', 'reddit.com', 'tiktok.com', 'discord.com'
];

export default function WebView({ isVisible, onClose, initialUrl, isOpening = false }: WebViewProps) {
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showScreenshot, setShowScreenshot] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const shouldRedirect = (url: string) => {
    try {
      const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
      return REDIRECT_DOMAINS.some(blocked => domain.includes(blocked));
    } catch {
      return false;
    }
  };

  const formatDomain = (url: string) => {
    try {
      return new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const normalizedUrl = currentUrl.startsWith('http') ? currentUrl : `https://${currentUrl}`;

  // Auto-redirect blocked domains
  useEffect(() => {
    if (isVisible && shouldRedirect(currentUrl)) {
      console.log('Blocked domain detected, opening in browser');
      window.open(normalizedUrl, '_blank', 'noopener,noreferrer');
      onClose();
    }
  }, [isVisible, currentUrl, normalizedUrl, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isVisible) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible, onClose]);

  // Handle iframe load with timeout
  useEffect(() => {
    if (!isVisible || showScreenshot) return;

    const iframe = iframeRef.current;
    if (!iframe) return;

    let loadTimeout: NodeJS.Timeout;
    let hasLoaded = false;

    const handleLoad = () => {
      if (!hasLoaded) {
        hasLoaded = true;
        setIsLoading(false);
        setError(null);
        clearTimeout(loadTimeout);
      }
    };

    const handleError = () => {
      if (!hasLoaded) {
        hasLoaded = true;
        setIsLoading(false);
        setError(`${formatDomain(currentUrl)} cannot be displayed in embedded view. This is common for security reasons.`);
        clearTimeout(loadTimeout);
      }
    };

    // 8 second timeout
    loadTimeout = setTimeout(() => {
      if (!hasLoaded) {
        hasLoaded = true;
        setIsLoading(false);
        setError(`${formatDomain(currentUrl)} is taking too long to load. Try opening in browser.`);
      }
    }, 8000);

    setIsLoading(true);
    iframe.addEventListener('load', handleLoad);
    iframe.addEventListener('error', handleError);

    return () => {
      clearTimeout(loadTimeout);
      if (iframe) {
        iframe.removeEventListener('load', handleLoad);
        iframe.removeEventListener('error', handleError);
      }
    };
  }, [isVisible, currentUrl, showScreenshot]);

  const handleRefresh = () => {
    setIsLoading(true);
    setError(null);
    setShowScreenshot(false);
    
    if (iframeRef.current) {
      const refreshUrl = `${normalizedUrl}${normalizedUrl.includes('?') ? '&' : '?'}refresh=${Date.now()}`;
      iframeRef.current.src = refreshUrl;
    }
  };

  const handleOpenInBrowser = () => {
    window.open(normalizedUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShowScreenshot = () => {
    setShowScreenshot(true);
    setError(null);
  };

  // Generate screenshot URL using a working free service
  const screenshotUrl = `https://image.thum.io/get/width/1200/crop/800/png/noanimate/${encodeURIComponent(normalizedUrl)}`;

  if (!isVisible) return null;

  return (
    <div 
      className={`
        fixed inset-0 z-[100] bg-white
        transition-all duration-500 ease-out
        ${isOpening ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
      `}
    >
      {/* Browser Header */}
      <div className="h-12 border-b border-gray-200 flex items-center px-4 gap-4">
        <div className="flex items-center gap-2">
          <img 
            src={`https://www.google.com/s2/favicons?domain=${formatDomain(currentUrl)}&sz=32`}
            alt=""
            className="w-6 h-6"
            onError={(e) => e.currentTarget.style.display = 'none'}
          />
          <span className="text-sm font-medium text-gray-900">
            {formatDomain(currentUrl)}
          </span>
          {showScreenshot && (
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
              Screenshot
            </span>
          )}
        </div>
        
        <div className="flex-1 flex items-center">
          <div className="max-w-2xl w-full bg-gray-50 rounded-lg px-4 py-1.5 text-sm text-gray-600 truncate">
            {normalizedUrl}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!showScreenshot && (
            <button
              onClick={handleShowScreenshot}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="View as screenshot"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
          )}
          
          <button
            onClick={handleRefresh}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Refresh"
            disabled={isLoading}
          >
            <RotateCcw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={handleOpenInBrowser}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Open in browser"
          >
            <ExternalLink className="w-5 h-5" />
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="w-full h-[calc(100%-3rem)] relative">
        {isLoading && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500/30 overflow-hidden z-10">
            <div className="h-full bg-blue-500 animate-pulse" style={{ width: '60%' }} />
          </div>
        )}

        {error ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 bg-gray-50 rounded-2xl mb-6 flex items-center justify-center">
              <Globe className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Cannot Display Website</h3>
            <p className="text-gray-600 mb-6 max-w-md">{error}</p>
            <div className="flex gap-3">
              <button
                onClick={handleOpenInBrowser}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Open in Browser
              </button>
              <button
                onClick={handleShowScreenshot}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                View Screenshot
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              Sites like LinkedIn, WhatsApp, etc. block embedding for security
            </p>
          </div>
        ) : showScreenshot ? (
          <div className="w-full h-full overflow-auto bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-full max-h-full">
              <img
                src={screenshotUrl}
                alt={`Screenshot of ${formatDomain(currentUrl)}`}
                className="max-w-full max-h-full object-contain shadow-lg rounded-lg"
                onError={() => setError('Failed to load website screenshot')}
                onLoad={() => setIsLoading(false)}
              />
              <div className="text-center mt-4 text-sm text-gray-500">
                📷 Website Screenshot • Not interactive • Click "Open in Browser" to interact
              </div>
            </div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={normalizedUrl}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads allow-modals"
            loading="eager"
            allow="camera; microphone; geolocation; fullscreen"
          />
        )}
      </div>
    </div>
  );
} 