'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Search, Calendar, Plus, Wifi, Bluetooth, Volume2, Battery } from 'lucide-react';
import { getUserCollectionData, getAuthData } from '../../lib/api';

interface CollectionDataModalProps {
  isVisible: boolean;
  collectionName: string;
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

const CollectionDataModal: React.FC<CollectionDataModalProps> = ({ isVisible, collectionName, onClose }) => {
  const [files, setFiles] = useState<CollectionFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

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
      const data = await getUserCollectionData(authData.user.id, collectionName);
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
  }, [collectionName]);

  useEffect(() => {
    if (isVisible && collectionName) {
      fetchCollectionData();
    }
  }, [isVisible, collectionName, fetchCollectionData]);

  const handleFileClick = (file: CollectionFile) => {
    console.log('Clicked file:', file);
    // Handle file click - could open in WebView or download
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-white z-[900] flex flex-col">
      {/* Top Header */}
      <div className="flex justify-between items-center p-6 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">{collectionName}</h1>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Top Control Bar */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex gap-3 overflow-x-auto">
          <div className="flex-shrink-0 px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2">
            <Plus size={16} />
            <span className="text-sm font-medium">Add</span>
          </div>
          <div className="flex-shrink-0 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg">
            <span className="text-sm font-medium">Descri...</span>
          </div>
          <div className="flex-shrink-0 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg">
            <span className="text-sm font-medium">Intention</span>
          </div>
          <div className="flex-shrink-0 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg">
            <span className="text-sm font-medium">Operati...</span>
          </div>
          <div className="flex-shrink-0 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg">
            <span className="text-sm font-medium">Behavi...</span>
          </div>
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

      {/* Bottom Dynamic Island */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="max-w-md mx-auto bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            {/* Left side */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">N</span>
              </div>
              <Search size={16} className="text-gray-600" />
              <Calendar size={16} className="text-gray-600" />
            </div>

            {/* Center */}
            <div className="flex flex-col items-center">
              <span className="text-sm font-medium text-gray-900">{collectionName}</span>
              <div className="flex gap-1 mt-1">
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              <Wifi size={14} className="text-gray-600" />
              <Bluetooth size={14} className="text-gray-600" />
              <Volume2 size={14} className="text-gray-600" />
              <Battery size={14} className="text-gray-600" />
              <div className="text-xs text-gray-600">
                {currentTime.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </div>
              <div className="text-xs text-gray-600">
                {currentTime.toLocaleDateString('en-GB', { 
                  day: '2-digit', 
                  month: '2-digit', 
                  year: '2-digit' 
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionDataModal;