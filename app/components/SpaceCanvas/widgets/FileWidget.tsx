import React, { useState } from 'react';

export interface FileWidgetData {
  fileName: string;
  fileType: string;
}

interface FileWidgetProps {
  data: FileWidgetData;
  selected?: boolean;
}

const FileWidget: React.FC<FileWidgetProps> = ({ data, selected }) => {
  const [isHovering, setIsHovering] = useState(false);
  const showBg = isHovering || selected;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {selected && (
          <div
            style={{
              position: 'absolute',
              top: -6,
              left: -6,
              width: 64 + 12,
              height: 80 + 12,
              background: 'rgba(0,0,0,0.035)',
              // backdropFilter: 'blur(8px)',
              // WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(0,0,0,0.03)',
              borderRadius: 5,
              zIndex: 0,
            }}
          />
        )}
        <div
          style={{
            width: 64,
            height: 80,
            backgroundColor: '#fff',
            borderRadius: 2,
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {data.fileType && (
            <div
              style={{
                position: 'absolute',
                bottom: 6,
                left: 0,
                right: 0,
                textAlign: 'center',
                fontSize: 10,
                color: 'rgba(0, 0, 0, 0.3)',
                fontWeight: 500,
                textTransform: 'uppercase',
              }}
            >
              {data.fileType}
            </div>
          )}
        </div>
      </div>
      {data.fileName && (
        <div
          style={{
            marginTop: 8,
            fontSize: 12,
            color: 'rgba(0, 0, 0, 0.4)',
            textAlign: 'center',
            maxWidth: 80,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            padding: '2px 6px',
            borderRadius: 6,
            background: showBg ? 'rgba(0,0,0,0.07)' : 'transparent',
            transition: 'background 0.2s',
            fontWeight: 400,
            backdropFilter: showBg ? 'blur(12px)' : undefined,
            WebkitBackdropFilter: showBg ? 'blur(12px)' : undefined,
          }}
        >
          {data.fileName}
        </div>
      )}
    </div>
  );
};

export default FileWidget; 