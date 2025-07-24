import React, { useState } from 'react';
import { NodeProps } from '@xyflow/react';
import { Layout } from 'lucide-react';

export interface SpaceWidgetData {
  name: string;
  type: 'canvas' | 'board' | 'workspace' | 'custom';
  preview?: string;
  widgetCount?: number;
  lastModified?: string;
  isShared?: boolean;
  widgets?: Array<{
    type: 'file' | 'url' | 'agent' | 'sphere' | 'note' | 'task';
    position: { x: number; y: number };
  }>;
}

interface SpaceWidgetProps extends Omit<NodeProps, 'data'> {
  data: SpaceWidgetData;
  selected?: boolean;
}

const SpaceWidget: React.FC<SpaceWidgetProps> = ({ data, selected }) => {
  const [isHovering, setIsHovering] = useState(false);
  const showBg = isHovering || selected;

  // Ensure data has required fields
  const safeData = {
    ...data,
    name: data.name || 'Untitled Space',
    type: data.type || 'canvas' as const,
    widgetCount: data.widgetCount || 0,
    isShared: data.isShared !== undefined ? data.isShared : false,
    widgets: data.widgets || [],
  };

  const handleClick = () => {
    console.log(`Opening space: ${safeData.name}...`);
  };

  const renderSpacePreview = () => {
    if (safeData.preview) {
      return (
        <div style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(221, 221, 221, 0.25)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          // boxShadow: '0 2px 50px rgba(0,0,0,0.075)', 
          borderRadius: '15%',      
        }}>
          <img
            src={safeData.preview}
            alt={safeData.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
      );
    }
    return (
      <div style={{
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(221, 221, 221, 0.25)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        // boxShadow: '0 2px 50px rgba(0,0,0,0.075)',
        borderRadius: '15%',      
        position: 'absolute',
        top: 0,
        left: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}>
        <Layout size={48} color="rgba(0, 0, 0, 0.15)" strokeWidth={1.5} />
      </div>
    );
  };

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div
        style={{
          width: '100%',
          height: '100%',
          minWidth: '110px',
          minHeight: '80px',
          border: 'none',
          borderRadius: '15%',
          backgroundColor: 'transparent',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
        }}
        onClick={handleClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {renderSpacePreview()}
      </div>
      <div
        style={{
          marginTop: 8,
          fontSize: 12,
          color: 'rgba(0, 0, 0, 0.4)',
          textAlign: 'center',
          maxWidth: 180,
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
        }}
      >
        {safeData.name}
      </div>
    </div>
  );
};

export default SpaceWidget; 