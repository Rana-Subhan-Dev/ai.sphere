import React from 'react';

interface WidgetToolbarProps {
  onAddWidget: (type: 'text' | 'note' | 'shape' | 'url' | 'object' | 'app' | 'file' | 'task' | 'infoaction') => void;
}

const WidgetToolbar: React.FC<WidgetToolbarProps> = ({ onAddWidget }) => {
  const widgets = [
    { type: 'text' as const, label: 'Text', icon: '📝', color: '#3b82f6' },
    { type: 'note' as const, label: 'Note', icon: '📋', color: '#f59e0b' },
    { type: 'shape' as const, label: 'Shape', icon: '🟦', color: '#10b981' },
    { type: 'url' as const, label: 'URL', icon: '🌐', color: '#8b5cf6' },
    { type: 'object' as const, label: 'Object', icon: '📦', color: '#ec4899' },
    { type: 'app' as const, label: 'App', icon: '📱', color: '#6366f1' },
    { type: 'file' as const, label: 'File', icon: '📄', color: '#7c3aed' },
    { type: 'task' as const, label: 'Task', icon: '✅', color: '#059669' },
    { type: 'infoaction' as const, label: 'Info/Action', icon: '⚡', color: '#dc2626' },
  ];

  return (
    <div
      style={{
        position: 'absolute',
        top: '90px', // Below the header
        left: '20px',
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: '12px',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <h3
        style={{
          margin: '0 0 8px 0',
          fontSize: '14px',
          fontWeight: '600',
          color: '#374151',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        Add Widget
      </h3>
      
      {widgets.map((widget) => (
        <button
          key={widget.type}
          onClick={() => onAddWidget(widget.type)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 12px',
            border: `2px solid ${widget.color}20`,
            borderRadius: '8px',
            backgroundColor: `${widget.color}10`,
            color: widget.color,
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            transition: 'all 0.2s ease',
            minWidth: '100px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = `${widget.color}20`;
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = `${widget.color}10`;
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <span style={{ fontSize: '16px' }}>{widget.icon}</span>
          <span>{widget.label}</span>
        </button>
      ))}
    </div>
  );
};

export default WidgetToolbar; 