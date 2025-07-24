'use client';

import { useState, useEffect } from 'react';
import { X, Info, Users, Settings, Book, Layers, SlidersHorizontal, FileText, Plus, GripVertical, ArrowLeft, ChevronDown, Copy, Share2 } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SphereWindowProps {
  isVisible: boolean;
  sphereName: string;
  onClose: () => void;
}

// Section block data
const initialBlocks = [
  { id: 'description', label: 'Description', icon: FileText, color: 'text-black' },
  { id: 'intention', label: 'Intention', icon: FileText, color: 'text-black' },
  { id: 'operation', label: 'Operation Instructions', icon: FileText, color: 'text-black' },
  { id: 'behavior', label: 'Behavior Mode', icon: FileText, color: 'text-black' },
];
const newBlock = { id: 'new', label: 'New', icon: Plus, color: 'text-black/40' };

export default function SphereWindow({ isVisible, sphereName, onClose }: SphereWindowProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [blocks, setBlocks] = useState(initialBlocks);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
    }
  }, [isVisible]);

  const handleClose = () => {
    setIsAnimating(false);
    // Wait for animation to complete before actually hiding
    setTimeout(() => {
      onClose();
    }, 300);
  };

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  if (!isVisible && !isAnimating) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-[580] flex items-end justify-center pointer-events-none rounded-lg overflow-hidden">
      {/* Backdrop - subtle overlay */}
      <div 
        className={`
          absolute inset-0 transition-opacity duration-300 ease-out
          ${isAnimating && isVisible ? 'opacity-100' : 'opacity-0'}
        `}
        style={{
          background: 'rgba(0, 0, 0, 0.02)',
        }}
        onClick={handleClose}
      />

      {/* Sheet Container - Full width and height */}
      <div 
        className={`
          absolute inset-0
          transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]
          pointer-events-auto
          ${isAnimating && isVisible 
            ? 'translate-y-0' 
            : 'translate-y-full'
          }
        `}
      >
        {/* Main Sheet - Full size with specified styling and permanent blur */}
        <div 
          className="w-full h-full flex flex-col relative overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.3)',
            borderTop: '0.5px solid rgba(0, 0, 0, 0.05)',
            backdropFilter: 'blur(100px)',
          }}
        >

          {/* Fixed Toolbar */}
          <div className="fixed left-1/2 top-0 z-[1000] w-full flex justify-center pointer-events-auto" style={{ transform: 'translateX(-50%)' }}>
            <div className="w-full px-4 py-4 inline-flex justify-between items-center">
              <div className="flex justify-start items-center gap-1.5">
                <span className="text-center justify-start text-black/60 text-base font-normal font-['Neue_Montreal']">{sphereName}</span>
                <ChevronDown size={18} className="text-black/30" />
              </div>
              <div className="flex justify-start items-center gap-3">
                <div className="w-7 h-7 p-1.5 bg-black/[3.5%] rounded-[10px] backdrop-blur-xl flex justify-center items-center gap-1.5">
                  <Copy size={18} className="text-black/40" />
                </div>
                <div className="w-7 h-7 p-1.5 bg-black/[3.5%] rounded-[10px] backdrop-blur-xl flex justify-center items-center gap-1.5">
                  <Share2 size={16} className="text-black/40" />
                </div>
                <div className="w-7 h-7 p-1.5 bg-black/[3.5%] rounded-[10px] backdrop-blur-xl flex justify-center items-center gap-1.5 cursor-pointer" onClick={handleClose}>
                  <X size={18} className="text-black/30" />
                </div>
              </div>
            </div>
          </div>
          {/* Content - Scrollable, centered, padded, no scrollbar */}
          <div className="flex-1 w-full h-full overflow-y-auto scrollbar-none flex flex-col items-center p-0 py-[20vh] pt-[110px]" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <div className="w-[604px] inline-flex flex-col justify-start items-center gap-20">
              {/* Sphere visual */}
              <div className="w-[25vw] h-[25vw] bg-[#dddddd]/10 rounded-[298.67px] shadow-[0px_0px_426.6667175292969px_0px_rgba(0,0,0,0.10)] shadow-[inset_42.66667175292969px_-42.66667175292969px_213.33335876464844px_0px_rgba(255,255,255,1.00)] shadow-[inset_-42.66667175292969px_42.66667175292969px_106.66667938232422px_0px_rgba(0,0,0,0.10)] backdrop-blur-[533.33px]" />
              {/* Title and subtitle */}
              <div className="max-w-[300px] flex flex-col justify-start items-center gap-1.5">
                <div className="self-stretch text-center justify-start text-black/60 text-3xl font-normal font-['Neue_Montreal']">{sphereName}</div>
                <div className="self-stretch text-center justify-start text-black/40 text-sm font-normal font-['Neue_Montreal']">by You  •  Yesterday 11:52 AM</div>
              </div>
              
              {/* Menu buttons */}
              {/* <div className="self-stretch inline-flex justify-start items-center gap-5">
                <div className="w-20 px-2.5 py-3 bg-black/[2.5%] rounded-[10px] inline-flex flex-col justify-center items-center gap-1.5">
                  <Info size={20} className="text-black/50" />
                  <div className="justify-start text-black/40 text-xs font-normal font-['Neue_Montreal']">Acc. & Info.</div>
                </div>
                <div className="w-20 px-2.5 py-3 bg-black/[2.5%] rounded-[10px] inline-flex flex-col justify-center items-center gap-1.5">
                  <Users size={20} className="text-black/50" />
                  <div className="justify-start text-black/40 text-xs font-normal font-['Neue_Montreal']">Members</div>
                </div>
                <div className="w-20 px-2.5 py-3 bg-black/[2.5%] rounded-[10px] inline-flex flex-col justify-center items-center gap-1.5">
                  <Settings size={20} className="text-black/50" />
                  <div className="justify-start text-black/40 text-xs font-normal font-['Neue_Montreal']">Modes</div>
                </div>
                <div className="w-20 px-2.5 py-3 bg-black/[2.5%] rounded-[10px] inline-flex flex-col justify-center items-center gap-1.5">
                  <Book size={20} className="text-black/50" />
                  <div className="justify-start text-black/40 text-xs font-normal font-['Neue_Montreal']">Library</div>
                </div>
                <div className="w-20 px-2.5 py-3 bg-black/[2.5%] rounded-[10px] inline-flex flex-col justify-center items-center gap-1.5">
                  <Layers size={20} className="text-black/50" />
                  <div className="justify-start text-black/40 text-xs font-normal font-['Neue_Montreal']">Custom</div>
                </div>
                <div className="w-20 px-2.5 py-3 bg-black/[2.5%] rounded-[10px] inline-flex flex-col justify-center items-center gap-1.5">
                  <SlidersHorizontal size={20} className="text-black/50" />
                  <div className="justify-start text-black/40 text-xs font-normal font-['Neue_Montreal']">Training</div>
                </div>
              </div> */}
              
              <div className="self-stretch h-0 outline outline-[0.50px] outline-offset-[-0.25px] outline-black/5"></div>

              {/* Section list */}
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                  <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
                    {/* New block always at the top, not draggable */}
                    <NewBlock hovered={hoveredId === 'new'} setHovered={setHoveredId} />
                    {blocks.map((block, idx) => (
                      <SortableBlock
                        key={block.id}
                        id={block.id}
                        label={block.label}
                        icon={block.icon}
                        color={block.color}
                        setHovered={setHoveredId}
                        hovered={hoveredId === block.id}
                        isLast={idx === blocks.length - 1}
                      />
                    ))}
                    {/* Hidden 'New' block at the end, always rendered but only visible on hover over itself */}
                    <div className={`transition-opacity duration-200 opacity-0 hover:opacity-100`}>
                      <NewBlock hovered={hoveredId === 'new-hidden'} setHovered={setHoveredId} idOverride="new-hidden" />
                    </div>
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 

// SortableBlock component
function SortableBlock({ id, label, icon: Icon, color, setHovered, hovered, isLast }: { id: string, label: string, icon: any, color: string, setHovered: (id: string | null) => void, hovered: boolean, isLast: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: hovered ? 'rgba(255,255,255,0.40)' : 'transparent',
    cursor: isDragging ? 'grabbing' : 'pointer',
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={
        'relative self-stretch h-8 px-2.5 py-2 rounded-[10px] flex flex-row items-center gap-2.5 group transition-colors duration-150'
      }
      onMouseEnter={() => setHovered(id)}
      onMouseLeave={() => setHovered(null)}
    >
      {/* Drag handle - absolute left, only on hover */}
      <span
        {...attributes}
        {...listeners}
        className={`absolute left-0 top-1/2 -translate-y-1/2 ml-[-18px] flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-grab active:cursor-grabbing`}
        style={{ opacity: hovered ? 0.1 : 0 }}
      >
        <GripVertical size={16} />
      </span>
      <span className="inline-flex justify-start items-center gap-1.5">
        <Icon size={16} className={color} />
        <span className={`justify-start text-sm font-normal font-['Neue_Montreal'] ${color}`}>{label}</span>
      </span>
    </div>
  );
}

// NewBlock component (not draggable, always at top or as hidden at end)
function NewBlock({ hovered, setHovered, idOverride }: { hovered: boolean, setHovered: (id: string | null) => void, idOverride?: string }) {
  const id = idOverride || 'new';
  return (
    <div
      className={`cursor-pointer relative self-stretch h-8 px-2.5 py-2 rounded-[10px] flex flex-row items-center gap-2.5 group transition-colors duration-150 bg-transparent`}
      onMouseEnter={() => setHovered(id)}
      onMouseLeave={() => setHovered(null)}
    >
      {/* Drag handle - absolute left, only on hover, but not draggable */}
      <span
        className={`absolute left-0 top-1/2 -translate-y-1/2 ml-[-18px] flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-150`}
        style={{ opacity: hovered ? 0.1 : 0 }}
      >
        <GripVertical size={16} />
      </span>
      <span className="inline-flex justify-start items-center gap-1.5">
        <Plus size={16} className="text-black/40" />
        <span className="justify-start text-black/40 text-sm font-normal font-['Neue_Montreal']">New</span>
      </span>
    </div>
  );
} 