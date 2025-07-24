'use client';

import React, { useState, useRef, useCallback } from 'react';
import { X, Upload, FileText, Link as LinkIcon } from 'lucide-react';
import { uploadToCollection, getAuthData } from '../../lib/api';

interface UploadModalProps {
  isVisible: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

type UploadType = 'file' | 'text' | 'url';
type DataType = 'pdf' | 'image' | 'text' | 'url';

export default function UploadModal({ isVisible, onClose, onUploadSuccess }: UploadModalProps) {
  const [uploadType, setUploadType] = useState<UploadType>('file');
  const [textContent, setTextContent] = useState('');
  const [urlContent, setUrlContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collectionName, setCollectionName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = useCallback(() => {
    setUploadType('file');
    setTextContent('');
    setUrlContent('');
    setSelectedFile(null);
    setError(null);
    setCollectionName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleClose = useCallback(() => {
    if (!isUploading) {
      resetForm();
      onClose();
    }
  }, [isUploading, resetForm, onClose]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  }, []);

  const getDataType = (file: File): DataType => {
    const type = file.type.toLowerCase();
    if (type.includes('image')) return 'image';
    if (type.includes('pdf')) return 'pdf';
    return 'text';
  };

  const canUpload = () => {
    if (!collectionName.trim()) return false;
    
    switch (uploadType) {
      case 'file':
        return selectedFile !== null;
      case 'text':
        return textContent.trim().length > 0;
      case 'url':
        return urlContent.trim().length > 0;
      default:
        return false;
    }
  };

  const handleUpload = async () => {
    const authData = getAuthData();
    if (!authData?.user?.id) {
      setError('User not authenticated');
      return;
    }

    if (!collectionName.trim()) {
      setError('Please enter a collection name');
      return;
    }

    if (!canUpload()) {
      setError('Please provide content to upload');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      let result;
      
      switch (uploadType) {
        case 'file':
          if (selectedFile) {
            const dataType = getDataType(selectedFile);
            result = await uploadToCollection(
              authData.user.id,
              collectionName.trim(),
              dataType,
              selectedFile
            );
          }
          break;
        case 'text':
          result = await uploadToCollection(
            authData.user.id,
            collectionName.trim(),
            'text',
            undefined,
            textContent
          );
          break;
        case 'url':
          result = await uploadToCollection(
            authData.user.id,
            collectionName.trim(),
            'url',
            undefined,
            urlContent
          );
          break;
      }

      if (result) {
        console.log('Upload successful:', result);
        onUploadSuccess();
        handleClose();
      } else {
        setError('Upload failed. Please try again.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-black/10">
          <h2 className="text-xl font-light text-black/80">Add to Collection</h2>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-black/40" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Collection Name Input */}
          <div className="mb-6">
            <label className="block text-sm text-black/50 mb-2">
              Collection
            </label>
            <input
              type="text"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              placeholder="Enter collection name"
              className="w-full px-3 py-2 bg-black/5 rounded-lg text-black/70 border-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Upload Type Selector */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setUploadType('file')}
              className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                uploadType === 'file'
                  ? 'border-blue-200 bg-blue-50/50 text-blue-600'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <Upload className="w-6 h-6" />
              <span className="text-sm font-medium">File</span>
            </button>
            
            <button
              onClick={() => setUploadType('text')}
              className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                uploadType === 'text'
                  ? 'border-blue-200 bg-blue-50/50 text-blue-600'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <FileText className="w-6 h-6" />
              <span className="text-sm font-medium">Text</span>
            </button>
            
            <button
              onClick={() => setUploadType('url')}
              className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                uploadType === 'url'
                  ? 'border-blue-200 bg-blue-50/50 text-blue-600'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <LinkIcon className="w-6 h-6" />
              <span className="text-sm font-medium">URL</span>
            </button>
          </div>

          {/* Upload Content */}
          <div className="mb-6">
            {uploadType === 'file' && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.txt,.jpg,.jpeg,.png,.gif,.webp"
                  className="hidden"
                  disabled={isUploading}
                />
                
                {selectedFile ? (
                  <div className="flex items-center gap-3 p-4 bg-black/5 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-black/70 truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-black/40">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedFile(null)}
                      disabled={isUploading}
                      className="text-black/40 hover:text-black/60"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-black/10 rounded-lg p-8 text-center hover:border-black/20 cursor-pointer transition-colors"
                  >
                    <Upload className="w-8 h-8 text-black/30 mx-auto mb-2" />
                    <p className="text-sm text-black/50">Click to select a file</p>
                    <p className="text-xs text-black/30 mt-1">PDF, images, or text files</p>
                  </div>
                )}
              </div>
            )}

            {uploadType === 'text' && (
              <div>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Enter your text content here..."
                  rows={6}
                  disabled={isUploading}
                  className="w-full px-3 py-2 bg-black/5 rounded-lg text-black/70 border-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            )}

            {uploadType === 'url' && (
              <div>
                <input
                  type="url"
                  value={urlContent}
                  onChange={(e) => setUrlContent(e.target.value)}
                  placeholder="https://example.com"
                  disabled={isUploading}
                  className="w-full px-3 py-2 bg-black/5 rounded-lg text-black/70 border-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={isUploading}
              className="flex-1 px-4 py-2 bg-black/5 rounded-lg text-black/70 hover:bg-black/10 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!canUpload() || isUploading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 