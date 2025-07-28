import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Globe, ExternalLink } from 'lucide-react';
import { useWebView } from '../../../context/WebViewContext';

interface URLWidgetProps {
  data: {
    fileName: string;
    fileURL: string;
    createdAt: string;
  };
}

const URLWidget: React.FC<URLWidgetProps> = ({ data }) => {
  const { openWebView } = useWebView();
  
  const url = data.fileURL;
  const hostname = new URL(url).hostname.replace('www.', '');
  const favicon = `https://www.google.com/s2/favicons?domain=${url}&sz=32`;

  const handleClick = () => {
    openWebView(url);
  };

  const getDisplayName = () => {
    // Show hostname instead of filename for URLs
    const name = hostname.length > 15 
      ? hostname.substring(0, 12) + '...' 
      : hostname;
    return name;
  };

  return (
    <div className="flex flex-col items-center space-y-2 p-2 group">
      <Handle type="target" position={Position.Top} className="w-2 h-2 opacity-0" />
      
      {/* App Icon Style Preview */}
      <div 
        className="cursor-pointer transform transition-all duration-200 group-hover:scale-105"
        onClick={handleClick}
      >
        <div className="w-16 h-16 rounded-xl bg-blue-50 border-2 border-blue-200 flex items-center justify-center shadow-md relative">
          {/* Favicon or Globe icon */}
          <img 
            src={favicon}
            alt=""
            className="w-8 h-8 rounded"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <Globe className="w-8 h-8 text-blue-500 hidden" />
          
          {/* Small external link indicator */}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full border border-gray-200 flex items-center justify-center">
            <ExternalLink className="w-2 h-2 text-gray-400" />
          </div>
        </div>
      </div>
      
      {/* Website Name */}
      <div className="text-center">
        <div className="text-xs font-medium text-gray-700 leading-tight">
          {getDisplayName()}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          WEBSITE
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 opacity-0" />
    </div>
  );
};

export default URLWidget; 