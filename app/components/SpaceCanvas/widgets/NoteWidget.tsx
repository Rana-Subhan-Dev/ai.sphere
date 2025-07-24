import React, { useState, useRef, useEffect } from 'react';
import { NodeProps, NodeResizer } from '@xyflow/react';

interface NoteWidgetData {
  text: string;
  color?: string;
}

interface NoteWidgetProps extends Omit<NodeProps, 'data'> {
  data: NoteWidgetData;
}

const NoteWidget: React.FC<NoteWidgetProps> = ({ data, selected }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(data.text || 'Double-click to edit note');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const noteColor = data.color || '#ffffff'; // Default white note

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
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
      setText(data.text || 'Double-click to edit note');
    }
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        minWidth: '150px',
        minHeight: '150px',
        backgroundColor: noteColor,
        border: 'none',
        borderRadius: '20px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
        cursor: isEditing ? 'text' : 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
      onDoubleClick={handleDoubleClick}
    >
      {/* Resizer handles - commented out for now */}
      {/* <NodeResizer
        color="#f59e0b"
        isVisible={selected}
        minWidth={150}
        minHeight={150}
        maxWidth={400}
        maxHeight={400}
      /> */}
      
      {/* Note header/tab */}
      <div
        style={{
          height: '20px',
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
          borderTopLeftRadius: '18px',
          borderTopRightRadius: '18px',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        }}
      />
      
      {/* Note content */}
      <div style={{ flex: 1, padding: '16px', overflow: 'hidden' }}>
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
              fontSize: '14px',
              color: '#374151',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              width: '100%',
              height: '100%',
            }}
            placeholder="Write your note here..."
          />
        ) : (
          <div
            style={{
              fontSize: '14px',
              color: '#374151',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              height: '100%',
              overflow: 'hidden',
            }}
          >
            {text}
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteWidget; 