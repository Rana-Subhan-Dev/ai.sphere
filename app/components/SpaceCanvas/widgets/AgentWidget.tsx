import React, { useState } from 'react';
import { NodeProps } from '@xyflow/react';
import { User } from 'lucide-react';

export interface AgentWidgetData {
  name: string;
  type: 'assistant' | 'specialist' | 'custom';
  avatar?: string;
  status: 'active' | 'idle' | 'offline';
  description?: string;
  capabilities?: string[];
  lastActive?: string;
  model?: string;
}

interface AgentWidgetProps extends Omit<NodeProps, 'data'> {
  data: AgentWidgetData;
  selected?: boolean;
}

const AgentWidget: React.FC<AgentWidgetProps> = ({ data, selected }) => {
  const [isHovering, setIsHovering] = useState(false);
  const showBg = isHovering || selected;

  // Ensure data has required fields
  const safeData = {
    ...data,
    name: data.name || 'Untitled Agent',
    type: data.type || 'assistant' as const,
    status: data.status || 'offline' as const,
  };

  const handleClick = () => {
    console.log(`Opening agent: ${safeData.name}...`);
  };

  const renderAgentPreview = () => {
    if (safeData.avatar) {
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
        }}>
          <img
            src={safeData.avatar}
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
        borderRadius: '50%',
        backgroundColor: 'rgba(221, 221, 221, 0.1)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: '0 2px 50px rgba(0,0,0,0.075)',        
        position: 'absolute',
        top: 0,
        left: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <User 
          size={48} 
          color="rgba(0, 0, 0, 0.25)" 
          strokeWidth={0}
          fill="rgba(0, 0, 0, 0.25)"
        />
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
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
          position: 'relative',
          // overflow: 'hidden',
        }}
        onClick={handleClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {renderAgentPreview()}
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

export default AgentWidget; 