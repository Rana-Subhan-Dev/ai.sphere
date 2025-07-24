import React, { useRef, useEffect, useState } from 'react';
import { useDragDrop } from './DragDropProvider';

interface CanvasDropZoneProps {
  children: React.ReactNode;
  onDrop?: (item: any, position: { x: number; y: number }) => void;
}

const CanvasDropZone: React.FC<CanvasDropZoneProps> = ({ children, onDrop }) => {
  const { isDragging, dragItem, setDropZone, setIsOverDropZone, handleDrop } = useDragDrop();
  const [isHovering, setIsHovering] = useState(false);
  const [dropPosition, setDropPosition] = useState<{ x: number; y: number } | null>(null);
  const [isLanding, setIsLanding] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDragging) {
      setIsHovering(false);
      setDropPosition(null);
      setIsLanding(false);
    }
  }, [isDragging]);

  useEffect(() => {
    const element = dropZoneRef.current;
    if (!element || !isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Check if mouse is within the canvas area
      const wasHovering = isHovering;
      const nowHovering = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;
      
      if (nowHovering !== wasHovering) {
        console.log('🎨 Canvas hover changed:', nowHovering, 'Position:', {x, y}, 'Bounds:', {width: rect.width, height: rect.height});
        setIsHovering(nowHovering);
        setDropZone(nowHovering ? 'canvas' : null);
        setIsOverDropZone(nowHovering);
      }
      
      if (nowHovering) {
        setDropPosition({ x, y });
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isHovering && dragItem && dropPosition) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('🎨 Canvas drop detected!', dragItem, 'at position:', dropPosition);
        
        // Start landing animation
        setIsLanding(true);
        
        // Handle the drop
        handleDrop('canvas');
        onDrop?.(dragItem, dropPosition);
        
        // Reset landing after animation
        setTimeout(() => {
          setIsLanding(false);
          setDropPosition(null);
        }, 1000);
      }
    };

    console.log('🎨 Canvas drop zone: Adding mouse listeners, isDragging:', isDragging);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      console.log('🎨 Canvas drop zone: Removing mouse listeners');
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isHovering, dragItem, dropPosition, setDropZone, setIsOverDropZone, handleDrop, onDrop]);

  return (
    <div 
      ref={dropZoneRef}
      className="relative w-full h-full"
    >
      {/* Canvas content - no opacity changes here */}
      <div 
        className="w-full h-full"
      >
        {children}
      </div>
      
      {/* Drop position indicator */}
      {isHovering && isDragging && dropPosition && (
        <div 
          className="absolute pointer-events-none z-50"
          style={{
            left: dropPosition.x - 24,
            top: dropPosition.y - 24,
          }}
        >
          <div 
            className="w-12 h-12 rounded-full border-2 border-blue-400/60 bg-blue-100/40 backdrop-blur-sm animate-pulse"
            style={{
              animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
          <div className="absolute inset-2 rounded-full border border-blue-500/50" />
        </div>
      )}
      
      {/* Landing animation */}
      {isLanding && dropPosition && (
        <div 
          className="absolute pointer-events-none z-50"
          style={{
            left: dropPosition.x - 32,
            top: dropPosition.y - 32,
          }}
        >
          {/* Ripple effect */}
          <div 
            className="w-16 h-16 rounded-full border-2 border-green-400/60 animate-ping"
            style={{
              animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) 1',
            }}
          />
          <div 
            className="absolute inset-4 rounded-full border-2 border-green-500/40 animate-ping"
            style={{
              animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) 0.2s 1',
            }}
          />
          <div 
            className="absolute inset-6 rounded-full bg-green-400/30 animate-ping"
            style={{
              animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) 0.4s 1',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default CanvasDropZone; 