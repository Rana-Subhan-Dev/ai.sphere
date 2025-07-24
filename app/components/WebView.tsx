'use client';

import { useState, useEffect, useRef } from 'react';
import { X, ArrowLeft, ArrowRight, RotateCcw, Globe } from 'lucide-react';

interface WebViewProps {
  isVisible: boolean;
  onClose: () => void;
  initialUrl: string;
  isOpening?: boolean;
  onBackForwardChange?: (canGoBack: boolean, canGoForward: boolean) => void;
  onUrlChange?: (url: string) => void;
}

export default function WebView({ isVisible, onClose, initialUrl, isOpening = false, onBackForwardChange, onUrlChange }: WebViewProps) {
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

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

  // Simulate loading when URL changes
  useEffect(() => {
    if (currentUrl && isVisible) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentUrl, isVisible]);

  const handleGoBack = () => {
    // Simulate going back
    setCanGoForward(true);
    console.log('Going back...');
  };

  const handleGoForward = () => {
    // Simulate going forward
    setCanGoBack(true);
    console.log('Going forward...');
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
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
      className={`
        absolute inset-0 w-full h-full flex flex-col
        bg-white/10 backdrop-blur-[100px]
        rounded-lg z-[450] overflow-hidden
        transition-all duration-500 ease-out
        ${isOpening ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
      `}
      style={{ borderRadius: '8px' }}
    >
      {/* Browser Header */}
      

      {/* Webview Content Area */}
      <div 
        className={`
          flex-1 bg-white/5 transition-opacity duration-500 delay-300 relative overflow-hidden
          ${isOpening ? 'opacity-0' : 'opacity-100'}
        `}
      >
        {/* Loading State */}
        {isLoading && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500/30 overflow-hidden">
            <div className="h-full bg-blue-500 animate-pulse" style={{ width: '60%' }} />
          </div>
        )}

        {/* Simulated Webpage Content */}
        <div className="w-full h-full flex items-center justify-center ">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br bg-black/[2.5%] rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <Globe size={40} className="text-black/20" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-800 mb-2">
              {formatDomain(currentUrl)}
            </h1>
            <div className="text-sm text-gray-500">
              URL: {currentUrl}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 