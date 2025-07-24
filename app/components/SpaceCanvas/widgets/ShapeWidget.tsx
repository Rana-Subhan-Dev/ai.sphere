import React, { useState } from 'react';
import { NodeProps, NodeResizer, useUpdateNodeInternals } from '@xyflow/react';

interface ShapeWidgetData {
  shape: 'rectangle' | 'circle' | 'triangle';
  color?: string;
}

interface ShapeWidgetProps extends Omit<NodeProps, 'data'> {
  data: ShapeWidgetData;
}

const ShapeWidget: React.FC<ShapeWidgetProps> = ({ data, selected, id }) => {
  const [showShapeSelector, setShowShapeSelector] = useState(false);
  const updateNodeInternals = useUpdateNodeInternals();
  
  const shapeType = data.shape || 'rectangle';
  const shapeColor = data.color || '#3b82f6';

  const shapes = [
    { type: 'rectangle' as const, icon: '⬜', label: 'Rectangle' },
    { type: 'circle' as const, icon: '⭕', label: 'Circle' },
    { type: 'triangle' as const, icon: '🔺', label: 'Triangle' },
  ];

  const handleShapeChange = (newShape: 'rectangle' | 'circle' | 'triangle') => {
    // Update the node data
    data.shape = newShape;
    setShowShapeSelector(false);
    updateNodeInternals(id);
  };

  const renderShape = () => {
    const commonStyles = {
      width: '100%',
      height: '100%',
      backgroundColor: shapeColor,
      border: '1px solid rgba(59, 130, 246, 0.3)',
    };

    switch (shapeType) {
      case 'circle':
        return (
          <div
            style={{
              ...commonStyles,
              borderRadius: '50%',
            }}
          />
        );
      case 'triangle':
        return (
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: '40px solid transparent',
              borderRight: '40px solid transparent',
              borderBottom: `70px solid ${shapeColor}`,
              margin: 'auto',
              marginTop: '15px',
              filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))',
            }}
          />
        );
      case 'rectangle':
      default:
        return (
          <div
            style={{
              ...commonStyles,
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            }}
          />
        );
    }
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        minWidth: '80px',
        minHeight: '80px',
        border: selected ? '2px solid #3b82f6' : '2px solid transparent',
        borderRadius: shapeType === 'circle' ? '50%' : '8px',
        transition: 'all 0.2s ease',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
      onDoubleClick={() => setShowShapeSelector(!showShapeSelector)}
    >
      {/* Resizer handles - only show when selected */}
      <NodeResizer
        color="#3b82f6"
        isVisible={selected}
        minWidth={80}
        minHeight={80}
        maxWidth={300}
        maxHeight={300}
      />
      
      {renderShape()}

      {/* Shape Selector - only show when widget is selected and selector is open */}
      {selected && showShapeSelector && (
        <div
          style={{
            position: 'absolute',
            top: '-60px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            padding: '8px',
            display: 'flex',
            gap: '4px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            backdropFilter: 'blur(10px)',
            zIndex: 1000,
          }}
        >
          {shapes.map((shape) => (
            <button
              key={shape.type}
              onClick={(e) => {
                e.stopPropagation();
                handleShapeChange(shape.type);
              }}
              style={{
                padding: '6px 8px',
                border: shapeType === shape.type ? '2px solid #3b82f6' : '2px solid transparent',
                borderRadius: '6px',
                backgroundColor: shapeType === shape.type ? '#3b82f610' : 'transparent',
                cursor: 'pointer',
                fontSize: '16px',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '32px',
                height: '32px',
              }}
              onMouseEnter={(e) => {
                if (shapeType !== shape.type) {
                  e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (shapeType !== shape.type) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
              title={shape.label}
            >
              {shape.icon}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShapeWidget; 