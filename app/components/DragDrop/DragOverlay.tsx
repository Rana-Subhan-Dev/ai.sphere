import React from 'react';
import { File, Link, Image, Video, Music, FileText } from 'lucide-react';
import { useDragDrop } from './DragDropProvider';

const getFileIcon = (fileName: string, type: 'file' | 'url') => {
  if (type === 'url') {
    return <Link size={24} className="text-blue-500" />;
  }

  const extension = fileName.split('.').pop()?.toLowerCase();
  
  // If filename is generic, show generic file icon
  if (fileName === 'File' || !extension) {
    return <File size={24} className="text-gray-500" />;
  }
  
  switch (extension) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
    case 'svg':
      return <Image size={24} className="text-green-500" />;
    case 'mp4':
    case 'mov':
    case 'avi':
    case 'mkv':
    case 'webm':
      return <Video size={24} className="text-purple-500" />;
    case 'mp3':
    case 'wav':
    case 'flac':
    case 'aac':
      return <Music size={24} className="text-orange-500" />;
    case 'pdf':
    case 'doc':
    case 'docx':
    case 'txt':
    case 'md':
      return <FileText size={24} className="text-red-500" />;
    default:
      return <File size={24} className="text-gray-500" />;
  }
};

const DragOverlay: React.FC = () => {
  const { isDragging, dragItem } = useDragDrop();

  if (!isDragging || !dragItem) {
    return null;
  }

  // Get display text for the file type
  const getDisplayText = () => {
    if (dragItem.type === 'url') {
      return 'URL';
    }
    
    if (dragItem.name === 'File') {
      return 'FILE';
    }
    
    const extension = dragItem.name.split('.').pop()?.toUpperCase();
    return extension || 'FILE';
  };

  return (
    <div
      className="fixed pointer-events-none z-[1000] transition-transform duration-100 ease-out"
      style={{
        left: dragItem.position.x - 32,
        top: dragItem.position.y - 32,
        transform: 'scale(1.1)',
      }}
    >
      {/* Shadow/backdrop */}
      {/* <div className="absolute inset-0 bg-black/10 rounded-2xl blur-sm scale-110" /> */}
      
      {/* Main drag item */}
      <div 
        className="relative p-1 w-[50px] h-[70px] bg-white/90 rounded-sm backdrop-blur-md flex flex-col items-center justify-end"
        style={{
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05), 0 2px 8px rgba(0, 0, 0, 0.03)',
        }}
      >
        {/* File icon */}
        {/* <div className="mb-1">
          {getFileIcon(dragItem.name, dragItem.type)}
        </div> */}
        
        {/* File extension or type indicator */}
        <div className="text-[8px] font-medium text-black/40 truncate max-w-12 text-center">
          {getDisplayText()}
        </div>
      </div>

      {/* Pulsing ring animation */}
      {/* <div 
        className="absolute inset-0 rounded-2xl border-2 border-blue-400/40 animate-pulse"
        style={{
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }}
      /> */}
    </div>
  );
};

export default DragOverlay; 