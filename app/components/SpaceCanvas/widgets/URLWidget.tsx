import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Globe } from 'lucide-react';

interface URLWidgetProps {
  data: {
    fileName: string;
    fileURL: string;
    createdAt: string;
  };
}

const URLWidget: React.FC<URLWidgetProps> = ({ data }) => {
  const url = data.fileURL;
  const hostname = new URL(url).hostname;

  return (
    <div className="w-[400px] bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="w-full h-[300px] relative">
        <iframe
          src={url}
          className="w-full h-full"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads allow-modals"
          loading="eager"
          referrerPolicy="no-referrer"
        />
      </div>
      
      <div className="p-3 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
            <img 
              src={`https://www.google.com/s2/favicons?domain=${url}&sz=32`}
              alt="Website Icon"
              className="w-4 h-4"
            />
          </div>
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {hostname}
          </h3>
        </div>
        <div className="mt-1 text-xs text-gray-500">
          Added on {data.createdAt}
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
};

export default URLWidget; 