'use client';

import { useState, useEffect, useRef } from 'react';
import { X, RotateCcw, Globe, ExternalLink } from 'lucide-react';

interface WebViewProps {
  isVisible: boolean;
  onClose: () => void;
  initialUrl: string;
  isOpening?: boolean;
}

// Sites that commonly block embedding
const BLOCKED_DOMAINS = [
  'linkedin.com', 'whatsapp.com', 'facebook.com', 'instagram.com',
  'twitter.com', 'x.com', 'youtube.com', 'google.com', 'github.com',
  'stackoverflow.com', 'reddit.com', 'tiktok.com', 'discord.com'
];

export default function WebView({ isVisible, onClose, initialUrl, isOpening = false }: WebViewProps) {
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const normalizedUrl = currentUrl.startsWith('http') ? currentUrl : `https://${currentUrl}`;
  
  const formatDomain = (url: string) => {
    try {
      return new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const domain = formatDomain(currentUrl);
  const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

  const isBlockedDomain = BLOCKED_DOMAINS.some(blocked => domain.includes(blocked));

  // Handle iframe load with timeout
  useEffect(() => {
    if (!isVisible) return;

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
        setError(`${domain} cannot be displayed in embedded view. Try opening in browser.`);
        clearTimeout(loadTimeout);
      }
    };

    // 8 second timeout
    loadTimeout = setTimeout(() => {
      if (!hasLoaded) {
        hasLoaded = true;
        setIsLoading(false);
        setError(`${domain} is taking too long to load. Try opening in browser.`);
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
  }, [isVisible, currentUrl, domain]);

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

  const handleOpenInBrowser = () => {
    window.open(normalizedUrl, '_blank', 'noopener,noreferrer');
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`
        fixed inset-0 w-full h-full flex flex-col
        bg-white/10 backdrop-blur-[100px]
        z-[9999]
        transition-all duration-500 ease-out
        ${isOpening ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
      `}
    >
      {/* URL Bar */}
      <div className="flex items-center gap-3 p-3 border-b bg-white/80">
        <img 
          src={favicon}
          alt=""
          className="w-5 h-5"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.nextElementSibling?.classList.remove('hidden');
          }}
        />
        <Globe className="w-4 h-4 text-gray-400 hidden" />
        
        <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-700">
          {normalizedUrl}
        </div>

        <button
          onClick={handleOpenInBrowser}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          Open in Browser
        </button>

        <button
          onClick={onClose}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        </div>
      )}

      {/* Error Message */}
      {error && !isBlockedDomain && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/50 p-8 text-center">
          <Globe className="w-12 h-12 text-gray-400" />
          <p className="text-gray-600">{error}</p>
          <button
            onClick={handleOpenInBrowser}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Open in Browser Instead
          </button>
        </div>
      )}

      {/* Blocked Domain Message */}
      {isBlockedDomain && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/50 p-8 text-center">
          <Globe className="w-12 h-12 text-gray-400" />
          <p className="text-gray-600">
            {domain} doesn't allow embedding for security reasons.
            <br />
            Please open it in your browser instead.
          </p>
          <button
            onClick={handleOpenInBrowser}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Open in Browser
          </button>
        </div>
      )}

      {/* Website Content */}
      {!isBlockedDomain && (
        <div className="flex-1 relative">
          <iframe
            ref={iframeRef}
            src={normalizedUrl}
            className="w-full h-full absolute inset-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads allow-modals allow-top-navigation allow-presentation"
            referrerPolicy="no-referrer"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      )}
    </div>
  );
} 