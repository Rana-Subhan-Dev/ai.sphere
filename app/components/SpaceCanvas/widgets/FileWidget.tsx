import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { FileIcon, ImageIcon, FileTextIcon, FileType2Icon, Download } from 'lucide-react';

interface FileWidgetProps {
  data: {
    fileName: string;
    fileType: string;
    fileSize: string;
    fileURL: string;
    createdAt: string;
    contentType: string;
    content?: string;
  };
}

const FileWidget: React.FC<FileWidgetProps> = ({ data }) => {
  const handleDownload = () => {
    if (data.fileURL) {
      const link = document.createElement('a');
      link.href = data.fileURL;
      link.download = data.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const renderContent = () => {
    switch (data.fileType) {
      case 'image':
        return (
          <div 
            className="w-full h-48 relative group cursor-pointer" 
            onClick={handleDownload}
          >
            <img 
              src={data.fileURL} 
              alt={data.fileName}
              className="w-full h-full object-cover rounded-t-lg"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors">
              <Download className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        );
      
      case 'pdf':
        return (
          <div 
            className="w-full h-48 flex flex-col items-center justify-center bg-gray-50 rounded-t-lg cursor-pointer hover:bg-gray-100 transition-colors relative group" 
            onClick={handleDownload}
          >
            <FileType2Icon className="w-12 h-12 text-red-500" />
            <p className="mt-2 text-sm text-gray-600">Download PDF</p>
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/5 transition-colors">
              <Download className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        );
      
      case 'text':
        return (
          <div className="w-full h-48 bg-gray-50 rounded-t-lg p-4 overflow-auto">
            <pre className="text-xs font-mono text-gray-600 whitespace-pre-wrap break-words">
              {data.fileURL || 'No content available'}
            </pre>
          </div>
        );
      
      default:
        return (
          <div className="w-full h-48 flex flex-col items-center justify-center bg-gray-50 rounded-t-lg">
            <FileIcon className="w-12 h-12 text-gray-500" />
            <p className="mt-2 text-sm text-gray-600">Unknown file type</p>
          </div>
        );
    }
  };

  return (
    <div className="w-[200px] bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      {renderContent()}
      
      <div className="p-3 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 truncate" title={data.fileName}>
          {data.fileName}
        </h3>
        <div className="mt-1 flex items-center text-xs text-gray-500 space-x-2">
          <span>{data.fileSize}</span>
          <span>•</span>
          <span>{data.createdAt}</span>
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
};

export default FileWidget; 