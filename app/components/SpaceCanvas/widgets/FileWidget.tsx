import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { FileIcon, ImageIcon, FileTextIcon, FileType2Icon } from 'lucide-react';

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
  const handleClick = () => {
    if (data.fileURL && data.fileType !== 'text') {
      const link = document.createElement('a');
      link.href = data.fileURL;
      link.download = data.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getDisplayName = () => {
    // Show shorter names for better display
    const name = data.fileName.length > 15 
      ? data.fileName.substring(0, 12) + '...' 
      : data.fileName;
    return name;
  };

  const renderPreview = () => {
    if (data.fileType === 'image' && data.fileURL) {
      return (
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center shadow-md">
          <img 
            src={data.fileURL} 
            alt={data.fileName}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }
    
    if (data.fileType === 'text' && data.fileURL) {
      return (
        <div className="w-16 h-16 rounded-xl bg-green-50 border-2 border-green-200 flex items-center justify-center p-2 shadow-md">
          <div className="text-xs text-green-700 text-center leading-tight overflow-hidden">
            {data.fileURL?.substring(0, 50) || 'Text file'}
          </div>
        </div>
      );
    }
    
    // Default icon view for PDFs and other files
    const iconColor = {
      'pdf': 'bg-red-50 border-red-200',
      'text': 'bg-green-50 border-green-200',
      'image': 'bg-blue-50 border-blue-200'
    }[data.fileType] || 'bg-gray-50 border-gray-200';
    
    const icon = {
      'pdf': <FileType2Icon className="w-8 h-8 text-red-500" />,
      'text': <FileTextIcon className="w-8 h-8 text-green-500" />,
      'image': <ImageIcon className="w-8 h-8 text-blue-500" />
    }[data.fileType] || <FileIcon className="w-8 h-8 text-gray-500" />;
    
    return (
      <div className={`w-16 h-16 rounded-xl ${iconColor} border-2 flex items-center justify-center shadow-md`}>
        {icon}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center space-y-2 p-2 group">
      <Handle type="target" position={Position.Top} className="w-2 h-2 opacity-0" />
      
      {/* App Icon Style Preview */}
      <div 
        className="cursor-pointer transform transition-all duration-200 group-hover:scale-105"
        onClick={handleClick}
      >
        {renderPreview()}
      </div>
      
      {/* File Name */}
      <div className="text-center">
        <div className="text-xs font-medium text-gray-700 leading-tight">
          {getDisplayName()}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          {data.fileType.toUpperCase()}
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 opacity-0" />
    </div>
  );
};

export default FileWidget; 