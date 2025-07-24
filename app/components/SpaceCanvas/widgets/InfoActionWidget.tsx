import React, { useState, useRef, useEffect } from 'react';
import { NodeProps, NodeResizer } from '@xyflow/react';

export interface InfoActionWidgetData {
  title: string;
  subtitle?: string;
  type: 'info' | 'action';
  category: 
    // Info categories
    | 'chart' | 'list' | 'gallery' | 'balance' | 'portfolio' | 'news' | 'wishlist' | 'transactions'
    // Action categories  
    | 'transfer' | 'invest' | 'apply' | 'create' | 'workflow' | 'summarize' | 'generate' | 'campaign';
  
  // Visual data
  value?: string | number;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  items?: Array<{
    id: string;
    title: string;
    subtitle?: string;
    value?: string | number;
    imageUrl?: string;
    status?: string;
    metadata?: Record<string, any>;
  }>;
  
  // Chart/visualization data
  chartData?: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  
  // Action configuration
  actionConfig?: {
    buttonText?: string;
    fields?: Array<{
      name: string;
      type: 'text' | 'number' | 'select' | 'toggle';
      label: string;
      placeholder?: string;
      options?: string[];
      value?: any;
    }>;
    confirmationRequired?: boolean;
    estimatedTime?: string;
    cost?: string;
  };
  
  // State
  status?: 'idle' | 'loading' | 'success' | 'error' | 'executing';
  lastUpdated?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  
  // Metadata
  source?: string;
  accuracy?: number;
  tags?: string[];
  permissions?: string[];
}

interface InfoActionWidgetProps extends Omit<NodeProps, 'data'> {
  data: InfoActionWidgetData;
}

const InfoActionWidget: React.FC<InfoActionWidgetProps> = ({ data, selected }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showActionForm, setShowActionForm] = useState(false);
  const [editData, setEditData] = useState({
    title: data?.title || '',
    subtitle: data?.subtitle || '',
  });
  const [actionData, setActionData] = useState<Record<string, any>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  // Ensure data has required fields
  const safeData = {
    ...data,
    type: data.type || 'info' as const,
    category: data.category || 'list' as const,
    title: data.title || 'New Widget',
    status: data.status || 'idle' as const,
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    if (safeData.type === 'action' && !showActionForm) {
      setShowActionForm(true);
    } else {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
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
      setShowActionForm(false);
      setEditData({
        title: data?.title || '',
        subtitle: data?.subtitle || '',
      });
    }
  };

  const handleAction = async () => {
    if (safeData.type === 'action') {
      console.log(`Executing action: ${safeData.title}`, actionData);
      // Set loading state
      if (data) {
        data.status = 'executing';
      }
      
      // Simulate action execution
      setTimeout(() => {
        if (data) {
          data.status = 'success';
          data.lastUpdated = new Date().toISOString();
        }
        setShowActionForm(false);
        setActionData({});
      }, 2000);
    } else {
      // Info widget - refresh data
      console.log(`Refreshing data for: ${safeData.title}`);
      if (data) {
        data.status = 'loading';
        data.lastUpdated = new Date().toISOString();
      }
    }
  };

  const getCategoryIcon = () => {
    const icons = {
      // Info icons
      chart: '📊',
      list: '📋',
      gallery: '🖼️',
      balance: '💰',
      portfolio: '📈',
      news: '📰',
      wishlist: '❤️',
      transactions: '💳',
      // Action icons
      transfer: '💸',
      invest: '📊',
      apply: '📄',
      create: '✨',
      workflow: '⚡',
      summarize: '📝',
      generate: '🎨',
      campaign: '📢',
    };
    return icons[safeData.category] || '📋';
  };

  const getCategoryColor = () => {
    const colors = {
      // Info colors
      chart: '#3b82f6',
      list: '#6b7280',
      gallery: '#ec4899',
      balance: '#10b981',
      portfolio: '#8b5cf6',
      news: '#f59e0b',
      wishlist: '#ef4444',
      transactions: '#06b6d4',
      // Action colors
      transfer: '#10b981',
      invest: '#8b5cf6',
      apply: '#3b82f6',
      create: '#f59e0b',
      workflow: '#6366f1',
      summarize: '#06b6d4',
      generate: '#ec4899',
      campaign: '#ef4444',
    };
    return colors[safeData.category] || '#6b7280';
  };

  const getStatusIcon = () => {
    const icons = {
      idle: '',
      loading: '⏳',
      success: '✅',
      error: '❌',
      executing: '🔄',
    };
    return icons[safeData.status] || '';
  };

  const getStatusColor = () => {
    const colors = {
      idle: '#9ca3af',
      loading: '#f59e0b',
      success: '#10b981',
      error: '#ef4444',
      executing: '#3b82f6',
    };
    return colors[safeData.status] || '#9ca3af';
  };

  const formatValue = (value?: string | number) => {
    if (typeof value === 'number') {
      if (safeData.category === 'balance' || safeData.category === 'portfolio') {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }).format(value);
      }
      return value.toLocaleString();
    }
    return value || '';
  };

  const formatChange = (change?: number) => {
    if (change === undefined) return null;
    const prefix = change > 0 ? '+' : '';
    const color = change > 0 ? '#10b981' : change < 0 ? '#ef4444' : '#9ca3af';
    return (
      <span style={{ color, fontSize: '12px', fontWeight: '500' }}>
        {prefix}{change}%
      </span>
    );
  };

  const renderInfoContent = () => {
    if (safeData.category === 'chart' && safeData.chartData) {
      return (
        <div style={{ marginTop: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {safeData.chartData.slice(0, 4).map((item, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: item.color || getCategoryColor(),
                    }}
                  />
                  <span style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}>
                    {item.label}
                  </span>
                </div>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#1f2937',
                  fontFamily: 'SF Mono, Monaco, monospace',
                }}>
                  {formatValue(item.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (safeData.category === 'gallery' && safeData.items) {
      return (
        <div style={{ marginTop: '12px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '4px',
          }}>
            {safeData.items.slice(0, 6).map((item, index) => (
              <div
                key={index}
                style={{
                  aspectRatio: '1',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  backgroundColor: '#f3f4f6',
                  backgroundImage: item.imageUrl ? `url(${item.imageUrl})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                }}
              >
                {!item.imageUrl && '🖼️'}
              </div>
            ))}
          </div>
          {safeData.items.length > 6 && (
            <div style={{
              textAlign: 'center',
              marginTop: '8px',
              fontSize: '11px',
              color: '#9ca3af',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}>
              +{safeData.items.length - 6} more
            </div>
          )}
        </div>
      );
    }

    if (safeData.items) {
      return (
        <div style={{ marginTop: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {safeData.items.slice(0, 4).map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 8px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '6px',
                }}
              >
                <div>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#1f2937',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}>
                    {item.title}
                  </div>
                  {item.subtitle && (
                    <div style={{
                      fontSize: '10px',
                      color: '#9ca3af',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    }}>
                      {item.subtitle}
                    </div>
                  )}
                </div>
                {item.value && (
                  <div style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#6b7280',
                    fontFamily: 'SF Mono, Monaco, monospace',
                  }}>
                    {formatValue(item.value)}
                  </div>
                )}
              </div>
            ))}
            {safeData.items.length > 4 && (
              <div style={{
                textAlign: 'center',
                fontSize: '11px',
                color: '#9ca3af',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}>
                +{safeData.items.length - 4} more items
              </div>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  const renderActionForm = () => {
    if (!showActionForm || !safeData.actionConfig) return null;

    return (
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '16px',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '14px',
            fontWeight: '600',
            color: '#1f2937',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}>
            {safeData.title}
          </h3>
          <button
            onClick={() => setShowActionForm(false)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '14px',
              color: '#9ca3af',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {safeData.actionConfig.fields?.map((field, index) => (
            <div key={index}>
              <label style={{
                fontSize: '11px',
                fontWeight: '500',
                color: '#6b7280',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                display: 'block',
                marginBottom: '4px',
              }}>
                {field.label}
              </label>
              {field.type === 'select' ? (
                <select
                  value={actionData[field.name] || ''}
                  onChange={(e) => setActionData(prev => ({ ...prev, [field.name]: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    fontSize: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}
                >
                  <option value="">{field.placeholder || 'Select...'}</option>
                  {field.options?.map((option, optIndex) => (
                    <option key={optIndex} value={option}>{option}</option>
                  ))}
                </select>
              ) : field.type === 'toggle' ? (
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={actionData[field.name] || false}
                    onChange={(e) => setActionData(prev => ({ ...prev, [field.name]: e.target.checked }))}
                  />
                  <span style={{
                    fontSize: '11px',
                    color: '#6b7280',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}>
                    {field.placeholder}
                  </span>
                </label>
              ) : (
                <input
                  type={field.type}
                  value={actionData[field.name] || ''}
                  onChange={(e) => setActionData(prev => ({ ...prev, [field.name]: e.target.value }))}
                  placeholder={field.placeholder}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    fontSize: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {(safeData.actionConfig.estimatedTime || safeData.actionConfig.cost) && (
          <div style={{
            fontSize: '10px',
            color: '#9ca3af',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            display: 'flex',
            gap: '12px',
          }}>
            {safeData.actionConfig.estimatedTime && (
              <span>⏱️ {safeData.actionConfig.estimatedTime}</span>
            )}
            {safeData.actionConfig.cost && (
              <span>💰 {safeData.actionConfig.cost}</span>
            )}
          </div>
        )}

        <button
          onClick={handleAction}
          disabled={safeData.status === 'executing'}
          style={{
            padding: '8px 16px',
            backgroundColor: getCategoryColor(),
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '600',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            cursor: safeData.status === 'executing' ? 'not-allowed' : 'pointer',
            opacity: safeData.status === 'executing' ? 0.6 : 1,
          }}
        >
          {safeData.status === 'executing' ? 'Executing...' : (safeData.actionConfig.buttonText || 'Execute')}
        </button>
      </div>
    );
  };

  return (
    <div
      style={{
        width: '260px',
        minWidth: '260px',
        backgroundColor: '#ffffff',
        border: 'none',
        borderRadius: '20px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
        padding: '16px',
        minHeight: '200px',
      }}
      onDoubleClick={handleDoubleClick}
      onClick={!isEditing && !showActionForm ? handleAction : undefined}
    >
      {/* <NodeResizer
        color={getCategoryColor()}
        isVisible={selected}
        minWidth={220}
        minHeight={180}
        maxWidth={400}
        maxHeight={500}
      /> */}

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '12px',
      }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{
            fontSize: '16px',
            color: getCategoryColor(),
          }}>
            {getCategoryIcon()}
          </div>
          <div style={{
            fontSize: '10px',
            color: getCategoryColor(),
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}>
            {safeData.type} • {safeData.category}
          </div>
        </div>
        
        {getStatusIcon() && (
          <div style={{
            fontSize: '12px',
            color: getStatusColor(),
          }}>
            {getStatusIcon()}
          </div>
        )}
      </div>

      {/* Title */}
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editData.title}
          onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={{
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            padding: '6px 8px',
            fontSize: '16px',
            fontWeight: '600',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            outline: 'none',
            width: '100%',
            marginBottom: '8px',
          }}
        />
      ) : (
        <div
          style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#1f2937',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            lineHeight: '1.3',
            marginBottom: '8px',
          }}
        >
          {safeData.title}
        </div>
      )}

      {/* Subtitle and Value */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
      }}>
        {safeData.subtitle && (
          <div
            style={{
              fontSize: '12px',
              color: '#6b7280',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            {safeData.subtitle}
          </div>
        )}
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {safeData.value && (
            <div style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#1f2937',
              fontFamily: 'SF Mono, Monaco, monospace',
            }}>
              {formatValue(safeData.value)}
            </div>
          )}
          {formatChange(safeData.change)}
        </div>
      </div>

      {/* Content */}
      {!showActionForm && renderInfoContent()}

      {/* Action Form Overlay */}
      {renderActionForm()}

      {/* Footer */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '16px',
        right: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        {safeData.lastUpdated && (
          <div style={{
            fontSize: '9px',
            color: '#9ca3af',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}>
            {new Date(safeData.lastUpdated).toLocaleTimeString()}
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {safeData.autoRefresh && (
            <div style={{ fontSize: '8px', color: '#9ca3af' }}>🔄</div>
          )}
          {safeData.source && (
            <div style={{
              fontSize: '8px',
              color: '#9ca3af',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}>
              {safeData.source}
            </div>
          )}
        </div>
      </div>

      {/* Hover effect overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.03)',
          opacity: 0,
          transition: 'opacity 0.2s ease',
          borderRadius: 'inherit',
          pointerEvents: 'none',
        }}
        onMouseEnter={(e) => {
          if (!isEditing && !showActionForm) e.currentTarget.style.opacity = '1';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0';
        }}
      />
    </div>
  );
};

export default InfoActionWidget; 