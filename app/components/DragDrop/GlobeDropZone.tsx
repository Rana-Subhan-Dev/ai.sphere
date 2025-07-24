import React, { useRef, useEffect, useState } from 'react';
import { useDragDrop } from './DragDropProvider';

interface GlobeDropZoneProps {
  children: React.ReactNode;
  onDrop?: (item: any) => void;
}

const GlobeDropZone: React.FC<GlobeDropZoneProps> = ({ children, onDrop }) => {
  const { isDragging, dragItem, setDropZone, setIsOverDropZone, handleDrop } = useDragDrop();
  const [isHovering, setIsHovering] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDragging) {
      setIsHovering(false);
      setIsIngesting(false);
    }
  }, [isDragging]);

  useEffect(() => {
    const element = dropZoneRef.current;
    if (!element || !isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Check if mouse is within the globe area (circular)
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const radius = Math.min(rect.width, rect.height) / 2 - 20; // Slightly smaller than actual globe
      const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      
      const wasHovering = isHovering;
      const nowHovering = distance <= radius;
      
      if (nowHovering !== wasHovering) {
        console.log('🌍 Globe hover changed:', nowHovering, 'Distance:', distance, 'Radius:', radius);
        setIsHovering(nowHovering);
        setDropZone(nowHovering ? 'globe' : null);
        setIsOverDropZone(nowHovering);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isHovering && dragItem) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('🌍 Globe drop detected!', dragItem);
        
        // Call onDrop first
        onDrop?.(dragItem);
        
        // Then handle the drop
        handleDrop('globe');
      }
    };

    console.log('🌍 Globe drop zone: Adding mouse listeners, isDragging:', isDragging);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      console.log('🌍 Globe drop zone: Removing mouse listeners');
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isHovering, dragItem, setDropZone, setIsOverDropZone, handleDrop, onDrop]);

  return (
    <div 
      ref={dropZoneRef}
      className="relative w-full h-full transition-all duration-700 ease-out"
      style={{
        transform: isHovering && isDragging ? 'scale(0.95)' : 'scale(1)',
        opacity: isHovering && isDragging ? 0.8 : 1,
      }}
    >
      {children}
      
      {/* Hover indicator ring */}
      {isHovering && isDragging && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'none',
          }}
        >
          <div 
            className="absolute inset-8 rounded-full border-2 border-black/10"
            style={{
              animation: 'none',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default GlobeDropZone; 