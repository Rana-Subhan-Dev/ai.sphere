import React, { useState } from 'react';
import { NodeProps } from '@xyflow/react';
import { Users, Globe, Layers } from 'lucide-react';

export interface SphereWidgetData {
  name: string;
  type: 'collaboration' | 'workspace' | 'environment' | 'custom';
  thumbnail?: string;
  agentCount?: number;
  appCount?: number;
  description?: string;
  lastActivity?: string;
  isActive?: boolean;
}

interface SphereWidgetProps extends Omit<NodeProps, 'data'> {
  data: SphereWidgetData;
  selected?: boolean;
}

const SphereWidget: React.FC<SphereWidgetProps> = ({ data, selected }) => {
  const [isHovering, setIsHovering] = useState(false);
  const showBg = isHovering || selected;

  // Ensure data has required fields
  const safeData = {
    ...data,
    name: data.name || 'Untitled Sphere',
    type: data.type || 'workspace' as const,
    agentCount: data.agentCount || 0,
    appCount: data.appCount || 0,
    isActive: data.isActive !== undefined ? data.isActive : false,
  };

  const handleClick = () => {
    console.log(`Opening sphere: ${safeData.name}...`);
  };

  const renderSpherePreview = () => {
    if (safeData.thumbnail) {
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
          backgroundColor: 'rgba(221, 221, 221, 0.1)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '0 2px 50px rgba(0,0,0,0.075)',          
          borderRadius: '50%',
        }}>
          <img
            src={safeData.thumbnail}
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
        backgroundColor: 'rgba(221, 221, 221, 0.1)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: '0 2px 50px rgba(0,0,0,0.075)',        
        borderRadius: '50%',   
        position: 'absolute',
        top: 0,
        left: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          position: 'relative',
          width: '40px',
          height: '40px',
        }}>
          {/* Top circle */}
          <div style={{
            position: 'absolute',
            top: '0px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '10px',
            height: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            borderRadius: '50%',
          }} />
          {/* Top right circle */}
          <div style={{
            position: 'absolute',
            top: '7px',
            right: '0px',
            width: '10px',
            height: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            borderRadius: '50%',
          }} />
          {/* Bottom right circle */}
          <div style={{
            position: 'absolute',
            bottom: '7px',
            right: '0px',
            width: '10px',
            height: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            borderRadius: '50%',
          }} />
          {/* Bottom circle */}
          <div style={{
            position: 'absolute',
            bottom: '0px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '10px',
            height: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            borderRadius: '50%',
          }} />
          {/* Bottom left circle */}
          <div style={{
            position: 'absolute',
            bottom: '7px',
            left: '0px',
            width: '10px',
            height: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            borderRadius: '50%',
          }} />
          {/* Top left circle */}
          <div style={{
            position: 'absolute',
            top: '7px',
            left: '0px',
            width: '10px',
            height: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            borderRadius: '50%',
          }} />
        </div>
      </div>
    );
  };

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div
        style={{
          width: '80px',
          height: '80px',
          border: 'none',
          borderRadius: '50%',
          backgroundColor: 'transparent',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
          position: 'relative',
          // overflow: 'hidden',
        }}
        onClick={handleClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {renderSpherePreview()}
      </div>
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
        }}
      >
        {safeData.name}
      </div>
    </div>
  );
};

export default SphereWidget; 