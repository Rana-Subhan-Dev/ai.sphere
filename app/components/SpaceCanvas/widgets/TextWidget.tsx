import React, { useState, useRef, useEffect } from 'react';
import { NodeProps, Handle, Position, NodeResizer } from '@xyflow/react';

interface TextWidgetData {
  text: string;
  fontSize?: number;
  color?: string;
}

interface TextWidgetProps extends Omit<NodeProps, 'data'> {
  data: TextWidgetData;
}

const TextWidget: React.FC<TextWidgetProps> = ({ data, selected }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(data.text || 'Click to edit');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    // Here you could update the node data
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setIsEditing(false);
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setText(data.text || 'Click to edit'); // Revert changes
    }
  };

  return (
    <div
      style={{
        padding: '12px 16px',
        backgroundColor: '#ffffff',
        border: selected ? '2px solid #3b82f6' : '2px solid transparent',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        minWidth: '120px',
        maxWidth: '400px',
        minHeight: '40px',
        cursor: isEditing ? 'text' : 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
        width: '100%',
        height: '100%',
      }}
      onDoubleClick={handleDoubleClick}
    >
      <NodeResizer
        color="#3b82f6"
        isVisible={selected}
        minWidth={120}
        minHeight={40}
        maxWidth={400}
        maxHeight={300}
      />
      
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={{
            border: 'none',
            outline: 'none',
            resize: 'none',
            background: 'transparent',
            fontSize: data.fontSize || 14,
            color: data.color || '#333',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            width: '100%',
            minHeight: '20px',
          }}
          rows={1}
        />
      ) : (
        <div
          style={{
            fontSize: data.fontSize || 14,
            color: data.color || '#333',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
};

export default TextWidget; 