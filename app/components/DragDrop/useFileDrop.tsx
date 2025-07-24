import { useEffect, useRef } from 'react';
import { useDragDrop, DragItem } from './DragDropProvider';

interface UseFileDropOptions {
  onFileHover?: (isHovering: boolean) => void;
}

export const useFileDrop = (options: UseFileDropOptions = {}) => {
  const { onFileHover } = options;
  const { startDrag, updateDragPosition, updateDragItem, endDrag, handleDrop: providerHandleDrop, dropZone } = useDragDrop();
  const dragCounterRef = useRef(0);
  
  useEffect(() => {
    let isDragging = false;
    let placeholderDragItem: DragItem | null = null;
    
    const handleDragEnter = (e: DragEvent) => {
      dragCounterRef.current++;
      
      console.log('🚪 DragEnter - Event:', e.type, 'Counter:', dragCounterRef.current, 'Types:', e.dataTransfer?.types);
      
      // Check for files being dragged
      if (e.dataTransfer?.types.includes('Files')) {
        console.log('✅ Files detected on dragenter!', 'Counter:', dragCounterRef.current);
        onFileHover?.(true);
        
        if (!isDragging) {
          // Create placeholder drag item for visual feedback
          placeholderDragItem = {
            id: `file-${Date.now()}`,
            type: 'file',
            name: 'File',
            data: null,
            position: { x: e.clientX, y: e.clientY }
          };
          startDrag(placeholderDragItem);
          isDragging = true;
        }
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      dragCounterRef.current--;
      
      console.log('🚪 DragLeave - Counter:', dragCounterRef.current);
      
      if (dragCounterRef.current === 0) {
        console.log('⬅️ All drag elements left');
        onFileHover?.(false);
        if (isDragging) {
          endDrag();
          isDragging = false;
          placeholderDragItem = null;
        }
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      
      // Update position if we're already dragging
      if (isDragging && placeholderDragItem) {
        updateDragPosition({ x: e.clientX, y: e.clientY });
      }
      // Also check for files type if we haven't started dragging yet
      else if (!isDragging && e.dataTransfer?.types.includes('Files')) {
        console.log('✅ Files detected on dragover!');
        placeholderDragItem = {
          id: `file-${Date.now()}`,
          type: 'file',
          name: 'File',
          data: null,
          position: { x: e.clientX, y: e.clientY }
        };
        startDrag(placeholderDragItem);
        isDragging = true;
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current = 0;
      onFileHover?.(false);
      
      console.log('🎯 Drop event - Files count:', e.dataTransfer?.files?.length, 'Current drop zone:', dropZone);
      
      // Handle actual file data on drop
      if (isDragging && e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        console.log('📁 File dropped:', file.name, 'Size:', file.size, 'Type:', file.type);
        
        // Update the drag item with real file data
        updateDragItem({
          name: file.name,
          data: file
        });
        
        // Always trigger the drop handler with the current zone
        if (dropZone) {
          providerHandleDrop(dropZone);
        } else {
          // Use 'canvas' as default zone for imports outside specific zones
          console.log('🎯 File dropped outside zones - triggering default import');
          providerHandleDrop('canvas');
        }
      }
      
      // Always end the drag state immediately
      endDrag();
      isDragging = false;
      placeholderDragItem = null;
    };

    // Add event listeners to document
    document.addEventListener('dragenter', handleDragEnter);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('dragenter', handleDragEnter);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('drop', handleDrop);
    };
  }, [startDrag, updateDragPosition, updateDragItem, endDrag, onFileHover, providerHandleDrop, dropZone]);
};

// Hook for URL dragging from browser
export const useUrlDrop = () => {
  const { startDrag, updateDragPosition, endDrag } = useDragDrop();

  useEffect(() => {
    let isDragging = false;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      
      // Check if we're dragging a URL
      if (!isDragging && e.dataTransfer?.types.includes('text/uri-list')) {
        const url = e.dataTransfer.getData('text/uri-list');
        if (url) {
          const dragItem: DragItem = {
            id: `url-${Date.now()}`,
            type: 'url',
            name: url,
            data: url,
            position: { x: e.clientX, y: e.clientY }
          };
          startDrag(dragItem);
          isDragging = true;
        }
      }
      
      if (isDragging) {
        updateDragPosition({ x: e.clientX, y: e.clientY });
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      if (isDragging) {
        endDrag();
        isDragging = false;
      }
    };

    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('drop', handleDrop);
    };
  }, [startDrag, updateDragPosition, endDrag]);
}; 