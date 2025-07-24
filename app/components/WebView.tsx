'use client';

import { useState, useEffect, useRef } from 'react';
import { X, ArrowLeft, ArrowRight, RotateCcw, Globe, ExternalLink } from 'lucide-react';

interface WebViewProps {
  isVisible: boolean;
  onClose: () => void;
  initialUrl: string;
  isOpening?: boolean;
}

export default function WebView({ isVisible, onClose, initialUrl, isOpening = false }: WebViewProps) {
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);

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

  // Handle iframe load events
  useEffect(() => {
    const handleIframeLoad = () => {
      setIsLoading(false);
      setError(null);
    };

    const handleIframeError = () => {
      setIsLoading(false);
      setError('This website cannot be displayed in the app. Click "Open in Browser" to view it.');
    };

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', handleIframeLoad);
      iframe.addEventListener('error', handleIframeError);
    }

    return () => {
      if (iframe) {
        iframe.removeEventListener('load', handleIframeLoad);
        iframe.removeEventListener('error', handleIframeError);
      }
    };
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const formatDomain = (url: string) => {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-white"
    >
      {/* Browser Header */}
      <div className="h-12 border-b border-gray-200 flex items-center px-4 gap-4">
        <div className="flex items-center gap-2">
          <img 
            src={`https://www.google.com/s2/favicons?domain=${currentUrl}&sz=32`}
            alt=""
            className="w-6 h-6"
          />
          <span className="text-sm font-medium text-gray-900">
            {formatDomain(currentUrl)}
          </span>
        </div>
        
        <div className="flex-1 flex items-center">
          <div className="max-w-2xl w-full bg-gray-50 rounded-lg px-4 py-1.5 text-sm text-gray-600 truncate">
            {currentUrl}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Refresh"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => window.open(currentUrl, '_blank')}
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

      {/* Webview Content Area */}
      <div className="w-full h-[calc(100%-3rem)]">
        {isLoading && (
          <div className="absolute top-12 left-0 right-0 h-1 bg-blue-500/30 overflow-hidden">
            <div className="h-full bg-blue-500 animate-pulse" style={{ width: '60%' }} />
          </div>
        )}

        {error ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 bg-gray-50 rounded-2xl mb-6 flex items-center justify-center">
              <Globe className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.open(currentUrl, '_blank')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Open in Browser
            </button>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={currentUrl}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads allow-modals"
            loading="eager"
          />
        )}
      </div>
    </div>
  );
} 