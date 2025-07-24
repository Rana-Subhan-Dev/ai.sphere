import React, { useState, useRef, useEffect } from 'react';
import { NodeProps, NodeResizer } from '@xyflow/react';
import { useWebView } from '../../../context/WebViewContext';

export interface AppWidgetData {
  name: string;
  description?: string;
  icon?: string;
  iconUrl?: string;
  category: 'productivity' | 'design' | 'development' | 'communication' | 'analytics' | 'finance' | 'social' | 'entertainment' | 'utility' | 'custom';
  url?: string;
  isInstalled?: boolean;
  isRunning?: boolean;
  version?: string;
  developer?: string;
  rating?: number;
  tags?: string[];
  lastUsed?: string;
  size?: 'small' | 'medium' | 'large';
}

interface AppWidgetProps extends Omit<NodeProps, 'data'> {
  data: AppWidgetData;
  selected?: boolean;
}

const AppWidget: React.FC<AppWidgetProps> = ({ data, selected }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [editData, setEditData] = useState({
    name: data?.name || '',
    description: data?.description || '',
    developer: data?.developer || '',
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const { openWebView } = useWebView();
  const showBg = isHovering || selected;

  // Ensure data has required fields
  const safeData: AppWidgetData = {
    category: data?.category || 'custom',
    name: data?.name || 'Untitled App',
    size: data?.size || 'medium',
    isInstalled: data?.isInstalled ?? true,
    isRunning: data?.isRunning ?? false,
    description: data?.description,
    icon: data?.icon,
    iconUrl: data?.iconUrl,
    url: data?.url,
    version: data?.version,
    developer: data?.developer,
    rating: data?.rating,
    tags: data?.tags,
    lastUsed: data?.lastUsed,
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    // Update the data object
    Object.assign(data, editData);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setIsEditing(false);
      Object.assign(data, editData);
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditData({
        name: data?.name || '',
        description: data?.description || '',
        developer: data?.developer || '',
      });
    }
  };

  const handleLaunch = () => {
    if (safeData.url) {
      // Open in WebView instead of new tab
      openWebView(safeData.url);
    } else {
      // Mock launch behavior for apps without URLs
      console.log(`Launching ${safeData.name}...`);
      // Could trigger a modal or overlay here
    }
  };

  const getCategoryIcon = () => {
    const icons: Record<AppWidgetData['category'], string> = {
      productivity: '⚡',
      design: '🎨',
      development: '💻',
      communication: '💬',
      analytics: '📊',
      finance: '💰',
      social: '👥',
      entertainment: '🎬',
      utility: '🔧',
      custom: '📱',
    };
    return icons[safeData.category] || icons.custom;
  };

  const getCategoryColor = () => {
    const colors: Record<AppWidgetData['category'], string> = {
      productivity: '#f59e0b',
      design: '#ec4899',
      development: '#3b82f6',
      communication: '#10b981',
      analytics: '#8b5cf6',
      finance: '#059669',
      social: '#ef4444',
      entertainment: '#f97316',
      utility: '#6b7280',
      custom: '#6366f1',
    };
    return colors[safeData.category] || colors.custom;
  };

  const getDefaultIcon = () => {
    // If no custom icon, use category icon
    return safeData.icon || getCategoryIcon();
  };

  const getStatusColor = () => {
    if (safeData.isRunning) return '#10b981'; // Green for running
    if (safeData.isInstalled) return '#3b82f6'; // Blue for installed
    return '#9ca3af'; // Gray for not installed
  };

  const getStatusText = () => {
    if (safeData.isRunning) return 'Running';
    if (safeData.isInstalled) return 'Installed';
    return 'Available';
  };

  const getSizeStyle = () => {
    switch (safeData.size) {
      case 'small':
        return { width: '80px', height: '80px', minWidth: '80px', minHeight: '80px' };
      case 'large':
        return { width: '160px', height: '160px', minWidth: '160px', minHeight: '160px' };
      case 'medium':
      default:
        return { width: '120px', height: '120px', minWidth: '120px', minHeight: '120px' };
    }
  };

  const renderRating = () => {
    if (!safeData.rating) return null;
    
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginTop: '2px' }}>
        {Array.from({ length: 5 }, (_, i) => (
          <span 
            key={i} 
            style={{ 
              color: i < Math.floor(safeData.rating!) ? '#fbbf24' : '#e5e7eb',
              fontSize: '8px'
            }}
          >
            ★
          </span>
        ))}
        <span style={{ 
          fontSize: '8px', 
          color: '#9ca3af',
          marginLeft: '2px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}>
          {safeData.rating.toFixed(1)}
        </span>
      </div>
    );
  };

  const sizeStyle = getSizeStyle();

  return (
    <div
      className="inline-flex flex-col justify-start items-center gap-0"
      style={{
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
      }}
      onDoubleClick={handleDoubleClick}
      onClick={!isEditing ? handleLaunch : undefined}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* <NodeResizer
        color={getCategoryColor()}
        isVisible={Boolean(selected)}
        minWidth={100}
        minHeight={100}
        maxWidth={200}
        maxHeight={200}
      /> */}

      {/* Main app container */}
      <div className="w-20 h-20 p-4 bg-[#ddd]/25 rounded-[18px] backdrop-blur-xl inline-flex justify-center items-center gap-2.5">
        {/* App icon container */}
        <div 
          className="w-11 h-11 inline-flex justify-center items-center"
          style={{
            // border: selected ? `2px solid ${getCategoryColor()}` : 'none',
          }}
        >
          {safeData.iconUrl ? (
            <img
              src={safeData.iconUrl}
              alt={safeData.name}
              className="w-10 h-10 object-cover"
              onError={(e) => {
                // Fallback to emoji icon
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            className="text-4xl"
            style={{
              display: safeData.iconUrl ? 'none' : 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {getDefaultIcon()}
          </div>
        </div>

        {/* Status indicator */}
        {/* {safeData.isRunning && (
          <div
            className="w-2 h-2 bg-green-500 rounded-full"
            style={{
              animation: 'pulse 2s infinite',
            }}
          />
        )} */}
      </div>

      {/* App name */}
      <div 
        style={{
          marginTop: 8,
          fontSize: 12,
          color: 'rgba(0, 0, 0, 0.4)',
          textAlign: 'center',
          maxWidth: 120,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          padding: showBg ? '2px 6px' : 0,
          background: showBg ? 'rgba(0,0,0,0.07)' : 'transparent',
          borderRadius: showBg ? 6 : 0,
          transition: 'background 0.2s, padding 0.2s',
          fontWeight: 400,
          backdropFilter: showBg ? 'blur(12px)' : undefined,
          WebkitBackdropFilter: showBg ? 'blur(12px)' : undefined,
          fontFamily: 'Neue Montreal, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editData.name}
            onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="App Name"
            className="text-center text-black/40 text-xs font-normal bg-transparent outline-none border-none"
            style={{
              fontFamily: 'Neue Montreal, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              minWidth: '60px',
            }}
          />
        ) : (
          <div 
            className="text-center text-black/40 text-xs font-normal"
            style={{
              fontFamily: 'Neue Montreal, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            {safeData.name}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default AppWidget; 