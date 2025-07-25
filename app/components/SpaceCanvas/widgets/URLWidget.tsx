import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Globe, ExternalLink, X } from 'lucide-react';

interface URLWidgetProps {
  data: {
    fileName: string;
    fileURL: string;
    createdAt: string;
  };
}

const URLWidget: React.FC<URLWidgetProps> = ({ data }) => {
  const [showPreview, setShowPreview] = useState(false);
  
  const url = data.fileURL;
  const hostname = new URL(url).hostname.replace('www.', '');
  const favicon = `https://www.google.com/s2/favicons?domain=${url}&sz=32`;

  const handleClick = () => {
    setShowPreview(true);
  };

  const handleClose = () => {
    setShowPreview(false);
  };

  const handleOpenInBrowser = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {/* URL Card */}
      <div 
        className="w-[200px] bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
        onClick={handleClick}
      >
        <Handle type="target" position={Position.Top} className="w-2 h-2" />
        
        <div className="p-3">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <img 
                src={favicon}
                alt=""
                className="w-4 h-4"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <Globe className="w-3 h-3 text-gray-400 hidden" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-semibold text-gray-900 truncate">
                {hostname}
              </h3>
            </div>
            <ExternalLink className="w-3 h-3 text-gray-400 flex-shrink-0" />
          </div>

          <div className="mb-2">
            <p className="text-xs text-gray-500 truncate">
              {url}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Website</span>
            <span>{data.createdAt}</span>
          </div>
        </div>
        
        <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
      </div>

      {/* Website Preview Modal - EXACTLY like screenshot */}
      {showPreview && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 z-[9998]"
            onClick={handleClose}
          />

          {/* Preview Window */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] bg-white rounded-lg shadow-xl overflow-hidden z-[9999]">
            {/* URL Bar */}
            <div className="flex items-center gap-2 p-2 border-b">
              <img 
                src={favicon}
                alt=""
                className="w-5 h-5"
              />
              <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-700">
                {url}
              </div>
              <button
                onClick={handleOpenInBrowser}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                Open in Browser
              </button>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Website Preview */}
            <div className="h-[400px]">
              <iframe
                src={url}
                className="w-full h-full"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads allow-modals allow-top-navigation"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default URLWidget; 