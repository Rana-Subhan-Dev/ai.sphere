'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Plus, Search, Calendar, Wifi, Bluetooth, Volume2, Battery, ChevronDown, Copy, Share2, FileText, BarChart3, Tag, Folder, Link, Download, Edit3, Trash2 } from 'lucide-react';
import { getUserCollectionData, getAuthData } from '../../lib/api';
import ItemInfoViewAdvanced from './ItemInfoViewAdvanced';

interface SphereWindowProps {
  isVisible: boolean;
  sphereName: string;
  onClose: () => void;
}

interface CollectionFile {
  file_id: string;
  fileName: string;
  fileType: string;
  fileURL: string;
  file_size: number;
  content_type: string;
  created_at: string;
}

// App Icon Component
const AppIcon: React.FC<{ file: CollectionFile; onClick: () => void }> = ({ file, onClick }) => {
  const getAppIcon = () => {
    switch (file.fileType) {
      case 'pdf':
        return (
          <div className="w-16 h-16 bg-red-50 border-2 border-red-200 rounded-xl flex items-center justify-center">
            <div className="text-red-600 font-bold text-lg">PDF</div>
          </div>
        );
      case 'text':
        return (
          <div className="w-16 h-16 bg-blue-50 border-2 border-blue-200 rounded-xl flex items-center justify-center">
            <div className="text-blue-600 font-bold text-lg">TXT</div>
          </div>
        );
      case 'image':
        return (
          <div className="w-16 h-16 bg-green-50 border-2 border-green-200 rounded-xl flex items-center justify-center">
            <div className="text-green-600 font-bold text-lg">IMG</div>
          </div>
        );
      case 'url':
        return (
          <div className="w-16 h-16 bg-purple-50 border-2 border-purple-200 rounded-xl flex items-center justify-center">
            <div className="text-purple-600 font-bold text-lg">URL</div>
          </div>
        );
      default:
        return (
          <div className="w-16 h-16 bg-gray-50 border-2 border-gray-200 rounded-xl flex items-center justify-center">
            <div className="text-gray-600 font-bold text-lg">FILE</div>
          </div>
        );
    }
  };

  const truncateFileName = (name: string) => {
    if (name.length > 15) {
      return name.substring(0, 12) + '...';
    }
    return name;
  };

  return (
    <div 
      className="flex flex-col items-center gap-3 cursor-pointer hover:scale-105 transition-transform duration-200"
      onClick={onClick}
    >
      {getAppIcon()}
      <div className="text-center">
        <div className="text-sm font-medium text-gray-900 leading-tight">
          {truncateFileName(file.fileName)}
        </div>
      </div>
    </div>
  );
};

export default function SphereWindow({ isVisible, sphereName, onClose }: SphereWindowProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [files, setFiles] = useState<CollectionFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedFile, setSelectedFile] = useState<CollectionFile | null>(null);
  const [itemInfoVisible, setItemInfoVisible] = useState(false);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch collection data
  const fetchCollectionData = useCallback(async () => {
    const authData = getAuthData();
    if (!authData?.user?.id) {
      setError('User not authenticated');
      setIsLoading(false);
      return;
    }

    try {
      const data = await getUserCollectionData(authData.user.id, sphereName);
      if (data) {
        setFiles(data.files);
      } else {
        setFiles([]);
      }
    } catch (error) {
      console.error('Error fetching collection data:', error);
      setError('Failed to load collection data');
    } finally {
      setIsLoading(false);
    }
  }, [sphereName]);

  useEffect(() => {
    if (isVisible && sphereName) {
      fetchCollectionData();
    }
  }, [isVisible, sphereName, fetchCollectionData]);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
    }
  }, [isVisible]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleFileClick = (file: CollectionFile) => {
    setSelectedFile(file);
    setItemInfoVisible(true);
  };

  const handleItemInfoClose = () => {
    setItemInfoVisible(false);
    setSelectedFile(null);
  };

  const handleItemAction = (action: string) => {
    if (!selectedFile) return;
    
    switch (action) {
      case 'download':
        if (selectedFile.fileURL && selectedFile.fileURL !== 'None') {
          window.open(selectedFile.fileURL, '_blank');
        }
        break;
      case 'share':
        // Handle share action
        console.log('Share file:', selectedFile.fileName);
        break;
      case 'delete':
        // Handle delete action
        console.log('Delete file:', selectedFile.fileName);
        break;
      case 'edit':
        // Handle edit action
        console.log('Edit file:', selectedFile.fileName);
        break;
      default:
        console.log('Action:', action, 'for file:', selectedFile.fileName);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (!isVisible && !isAnimating) {
    return null;
  }

  return (
    <>
      <div className="absolute inset-0 z-[580] flex items-end justify-center pointer-events-none rounded-lg overflow-hidden">
        {/* Backdrop - subtle overlay */}
        <div 
          className={`
            absolute inset-0 transition-opacity duration-300 ease-out
            ${isAnimating && isVisible ? 'opacity-100' : 'opacity-0'}
          `}
          style={{
            background: 'rgba(0, 0, 0, 0.02)',
          }}
          onClick={handleClose}
        />

        {/* Sheet Container - Full width and height */}
        <div 
          className={`
            absolute inset-0
            transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]
            pointer-events-auto
            ${isAnimating && isVisible 
              ? 'translate-y-0' 
              : 'translate-y-full'
            }
          `}
        >
          {/* Main Sheet - Full size with white background */}
          <div className="w-full h-full flex flex-col relative overflow-hidden bg-white">
            {/* Top Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-semibold text-gray-900">{sphereName}</h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 p-1.5 bg-black/[3.5%] rounded-[10px] backdrop-blur-xl flex justify-center items-center gap-1.5">
                  <Copy size={18} className="text-black/40" />
                </div>
                <div className="w-7 h-7 p-1.5 bg-black/[3.5%] rounded-[10px] backdrop-blur-xl flex justify-center items-center gap-1.5">
                  <Share2 size={16} className="text-black/40" />
                </div>
                <button
                  onClick={handleClose}
                  className="w-7 h-7 p-1.5 bg-black/[3.5%] rounded-[10px] backdrop-blur-xl flex justify-center items-center gap-1.5 cursor-pointer"
                >
                  <X size={18} className="text-black/30" />
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-6 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-red-600 mb-2">Error loading data</div>
                    <div className="text-sm text-gray-500">{error}</div>
                  </div>
                </div>
              ) : files.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-gray-500 mb-2">No files in this collection</div>
                    <div className="text-sm text-gray-400">Add some files to get started</div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-5 gap-8 max-w-4xl mx-auto">
                  {files.map((file) => (
                    <AppIcon
                      key={file.file_id}
                      file={file}
                      onClick={() => handleFileClick(file)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ItemInfoViewAdvanced Modal */}
      {itemInfoVisible && selectedFile && (
        <div className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center">
          <div className="w-full h-full bg-white">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">File Details</h2>
              <button
                onClick={handleItemInfoClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ItemInfoViewAdvanced
                itemType="element"
                title={selectedFile.fileName}
                onClose={handleItemInfoClose}
                onAction={handleItemAction}
                className="h-full"
                // Override the mock data with real file data
                customData={{
                  preview: `${selectedFile.fileType.toUpperCase()} File`,
                  sections: [
                    {
                      id: 'key-info',
                      title: 'Key Information',
                      infoRows: [
                        { label: 'Type', value: `${selectedFile.fileType.toUpperCase()} File`, icon: <FileText size={14} /> },
                        { label: 'Size', value: formatFileSize(selectedFile.file_size), icon: <BarChart3 size={14} /> },
                        { label: 'Format', value: selectedFile.content_type, icon: <FileText size={14} /> },
                        { label: 'Created', value: formatDate(selectedFile.created_at), icon: <Calendar size={14} /> }
                      ]
                    },
                    {
                      id: 'metadata',
                      title: 'Metadata',
                      infoRows: [
                        { label: 'File ID', value: selectedFile.file_id, icon: <Tag size={14} /> },
                        { label: 'Collection', value: sphereName, icon: <Folder size={14} /> },
                        { label: 'URL', value: selectedFile.fileURL !== 'None' ? selectedFile.fileURL : 'No URL', icon: <Link size={14} />, isLink: selectedFile.fileURL !== 'None' }
                      ]
                    }
                  ],
                  actions: [
                    { label: 'Download', icon: <Download size={16} />, action: 'download', variant: 'primary' },
                    { label: 'Share', icon: <Share2 size={16} />, action: 'share', variant: 'secondary' },
                    { label: 'Edit', icon: <Edit3 size={16} />, action: 'edit', variant: 'secondary' },
                    { label: 'Delete', icon: <Trash2 size={16} />, action: 'delete', variant: 'danger' }
                  ]
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
} 