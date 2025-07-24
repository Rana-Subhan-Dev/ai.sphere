import React, { useState, useRef, useEffect } from 'react';
import { NodeProps, NodeResizer } from '@xyflow/react';
import { useWebView } from '../../../context/WebViewContext';

export interface ObjectWidgetData {
  type: 'product' | 'listing' | 'paper' | 'video' | 'store' | 'person' | 'event' | 'custom';
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  price?: string;
  rating?: number;
  metadata?: Record<string, any>;
  url?: string;
  tags?: string[];
  status?: 'available' | 'unavailable' | 'pending' | 'active' | 'inactive';
}

interface ObjectWidgetProps extends Omit<NodeProps, 'data'> {
  data: ObjectWidgetData;
}

const ObjectWidget: React.FC<ObjectWidgetProps> = ({ data, selected }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: data?.title || '',
    subtitle: data?.subtitle || '',
    price: data?.price || '',
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const { openWebView } = useWebView();

  // Ensure data has required fields
  const safeData = {
    ...data,
    type: data.type || 'custom' as const,
    title: data.title || 'Untitled Object',
    status: data.status || 'active' as const,
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
        title: data?.title || '',
        subtitle: data?.subtitle || '',
        price: data?.price || '',
      });
    }
  };

  const handleVisit = () => {
    if (safeData.url) {
      openWebView(safeData.url);
    }
  };

  const getTypeIcon = () => {
    const icons = {
      product: '📦',
      listing: '🏠',
      paper: '📄',
      video: '🎥',
      store: '🏪',
      person: '👤',
      event: '📅',
      custom: '📋',
    };
    return icons[safeData.type] || icons.custom;
  };

  const getTypeColor = () => {
    const colors = {
      product: '#3b82f6',
      listing: '#10b981',
      paper: '#8b5cf6',
      video: '#ef4444',
      store: '#f59e0b',
      person: '#06b6d4',
      event: '#84cc16',
      custom: '#6b7280',
    };
    return colors[safeData.type] || colors.custom;
  };

  const getStatusColor = () => {
    switch (safeData.status) {
      case 'available':
      case 'active': return '#10b981';
      case 'unavailable':
      case 'inactive': return '#6b7280';
      case 'pending': return '#f59e0b';
      default: return '#d1d5db';
    }
  };

  const renderRating = () => {
    if (!safeData.rating) return null;
    
    const stars = Array.from({ length: 5 }, (_, i) => (
      <span 
        key={i} 
        style={{ 
          color: i < Math.floor(safeData.rating!) ? '#fbbf24' : '#e5e7eb',
          fontSize: '12px'
        }}
      >
        ★
      </span>
    ));
    
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {stars}
        <span style={{ 
          fontSize: '12px', 
          color: '#6b7280',
          marginLeft: '4px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}>
          {safeData.rating.toFixed(1)}
        </span>
      </div>
    );
  };

  const renderMetadata = () => {
    if (!safeData.metadata) return null;
    
    return Object.entries(safeData.metadata).slice(0, 2).map(([key, value]) => (
      <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ 
          fontSize: '11px', 
          color: '#9ca3af',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          textTransform: 'capitalize',
        }}>
          {key}:
        </span>
        <span style={{ 
          fontSize: '11px', 
          color: '#6b7280',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontWeight: '500',
        }}>
          {String(value)}
        </span>
      </div>
    ));
  };

  const renderTags = () => {
    if (!safeData.tags || safeData.tags.length === 0) return null;
    
    return (
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '8px' }}>
        {safeData.tags.slice(0, 3).map((tag, index) => (
          <span
            key={index}
            style={{
              fontSize: '10px',
              padding: '2px 6px',
              backgroundColor: `${getTypeColor()}15`,
              color: getTypeColor(),
              borderRadius: '4px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontWeight: '500',
            }}
          >
            {tag}
          </span>
        ))}
        {safeData.tags.length > 3 && (
          <span style={{ 
            fontSize: '10px', 
            color: '#9ca3af',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}>
            +{safeData.tags.length - 3}
          </span>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        minWidth: '260px',
        minHeight: '180px',
        backgroundColor: '#ffffff',
        border: selected ? `2px solid ${getTypeColor()}` : '2px solid #e5e7eb',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      onDoubleClick={handleDoubleClick}
    >
      <NodeResizer
        color={getTypeColor()}
        isVisible={selected}
        minWidth={260}
        minHeight={180}
        maxWidth={350}
        maxHeight={280}
      />

      {/* Status & Type Indicators */}
      <div style={{ 
        position: 'absolute', 
        top: '8px', 
        right: '8px',
        display: 'flex',
        gap: '6px',
        alignItems: 'center',
      }}>
        {safeData.status && (
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: getStatusColor(),
              opacity: 0.8,
            }}
          />
        )}
        <div
          style={{
            fontSize: '14px',
            opacity: 0.7,
          }}
        >
          {getTypeIcon()}
        </div>
      </div>

      <div style={{ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Image Section */}
        {safeData.image && (
          <div style={{ marginBottom: '12px' }}>
            <img
              src={safeData.image}
              alt={safeData.title}
              style={{
                width: '100%',
                height: '80px',
                objectFit: 'cover',
                borderRadius: '8px',
                backgroundColor: '#f3f4f6',
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Title and Subtitle */}
        <div style={{ marginBottom: '8px', flex: 1 }}>
          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <input
                ref={inputRef}
                type="text"
                value={editData.title}
                onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                placeholder="Object title"
                style={{
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  padding: '6px 8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  outline: 'none',
                }}
              />
              <input
                type="text"
                value={editData.subtitle}
                onChange={(e) => setEditData(prev => ({ ...prev, subtitle: e.target.value }))}
                onKeyDown={handleKeyDown}
                placeholder="Subtitle (optional)"
                style={{
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  padding: '6px 8px',
                  fontSize: '13px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  outline: 'none',
                }}
              />
              {(safeData.type === 'product' || safeData.type === 'listing') && (
                <input
                  type="text"
                  value={editData.price}
                  onChange={(e) => setEditData(prev => ({ ...prev, price: e.target.value }))}
                  onKeyDown={handleKeyDown}
                  placeholder="Price (optional)"
                  style={{
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    padding: '6px 8px',
                    fontSize: '13px',
                    fontFamily: 'SF Mono, Monaco, monospace',
                    outline: 'none',
                  }}
                />
              )}
            </div>
          ) : (
            <>
              <h3
                style={{
                  margin: 0,
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#1f2937',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginBottom: '2px',
                }}
              >
                {safeData.title || 'Untitled Object'}
              </h3>
              
              {safeData.subtitle && (
                <p
                  style={{
                    margin: 0,
                    fontSize: '13px',
                    color: '#6b7280',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {safeData.subtitle}
                </p>
              )}

              {/* Price and Rating Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                {safeData.price && (
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: getTypeColor(),
                      fontFamily: 'SF Mono, Monaco, monospace',
                    }}
                  >
                    {safeData.price}
                  </span>
                )}
                {renderRating()}
              </div>

              {/* Description */}
              {safeData.description && (
                <p
                  style={{
                    margin: '8px 0 0 0',
                    fontSize: '12px',
                    color: '#9ca3af',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    lineHeight: '1.4',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {safeData.description}
                </p>
              )}
            </>
          )}
        </div>

        {/* Metadata */}
        {!isEditing && safeData.metadata && (
          <div style={{ 
            marginBottom: '8px',
            padding: '8px',
            backgroundColor: '#f9fafb',
            borderRadius: '6px',
            fontSize: '11px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}>
            {renderMetadata()}
          </div>
        )}

        {/* Tags */}
        {!isEditing && renderTags()}

        {/* Action Button */}
        {!isEditing && safeData.url && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleVisit();
            }}
            style={{
              marginTop: '8px',
              alignSelf: 'flex-start',
              padding: '6px 12px',
              backgroundColor: getTypeColor(),
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '500',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            View Details
          </button>
        )}
      </div>
    </div>
  );
};

export default ObjectWidget; 