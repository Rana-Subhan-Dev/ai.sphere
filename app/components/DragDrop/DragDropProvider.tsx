import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface DragItem {
  id: string;
  type: 'file' | 'url';
  name: string;
  data: any;
  position: { x: number; y: number };
}

export interface DragState {
  isDragging: boolean;
  dragItem: DragItem | null;
  dropZone: 'globe' | 'canvas' | null;
  isOverDropZone: boolean;
}

interface DragDropContextType extends DragState {
  startDrag: (item: DragItem) => void;
  endDrag: () => void;
  updateDragPosition: (position: { x: number; y: number }) => void;
  updateDragItem: (updates: Partial<DragItem>) => void;
  setDropZone: (zone: 'globe' | 'canvas' | null) => void;
  setIsOverDropZone: (isOver: boolean) => void;
  handleDrop: (zone: 'globe' | 'canvas') => void;
}

const DragDropContext = createContext<DragDropContextType | null>(null);

export const useDragDrop = () => {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error('useDragDrop must be used within a DragDropProvider');
  }
  return context;
};

interface DragDropProviderProps {
  children: ReactNode;
  onFileDrop?: (item: DragItem, zone: 'globe' | 'canvas') => void;
}

export const DragDropProvider: React.FC<DragDropProviderProps> = ({ 
  children, 
  onFileDrop 
}) => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragItem: null,
    dropZone: null,
    isOverDropZone: false,
  });

  const startDrag = useCallback((item: DragItem) => {
    setDragState({
      isDragging: true,
      dragItem: item,
      dropZone: null,
      isOverDropZone: false,
    });
  }, []);

  const endDrag = useCallback(() => {
    setDragState({
      isDragging: false,
      dragItem: null,
      dropZone: null,
      isOverDropZone: false,
    });
  }, []);

  const updateDragPosition = useCallback((position: { x: number; y: number }) => {
    setDragState(prev => ({
      ...prev,
      dragItem: prev.dragItem ? { ...prev.dragItem, position } : null,
    }));
  }, []);

  const updateDragItem = useCallback((updates: Partial<DragItem>) => {
    setDragState(prev => ({
      ...prev,
      dragItem: prev.dragItem ? { ...prev.dragItem, ...updates } : null,
    }));
  }, []);

  const setDropZone = useCallback((zone: 'globe' | 'canvas' | null) => {
    setDragState(prev => ({
      ...prev,
      dropZone: zone,
    }));
  }, []);

  const setIsOverDropZone = useCallback((isOver: boolean) => {
    setDragState(prev => ({
      ...prev,
      isOverDropZone: isOver,
    }));
  }, []);

  const handleDrop = useCallback((zone: 'globe' | 'canvas') => {
    if (dragState.dragItem && onFileDrop) {
      // Call onFileDrop first
      onFileDrop(dragState.dragItem, zone);
      
      // Then end the drag state
      endDrag();
    }
  }, [dragState.dragItem, onFileDrop, endDrag]);

  const contextValue: DragDropContextType = {
    ...dragState,
    startDrag,
    endDrag,
    updateDragPosition,
    updateDragItem,
    setDropZone,
    setIsOverDropZone,
    handleDrop,
  };

  return (
    <DragDropContext.Provider value={contextValue}>
      {children}
    </DragDropContext.Provider>
  );
}; 