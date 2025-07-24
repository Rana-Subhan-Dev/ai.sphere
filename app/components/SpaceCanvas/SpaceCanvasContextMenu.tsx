import React, { useState, useRef, useEffect } from 'react';

interface SpaceCanvasContextMenuProps {
  x: number;
  y: number;
  visible: boolean;
  onClose: () => void;
}

const TABS = [
  { key: 'import', label: 'Import' },
  { key: 'new', label: 'New' },
  { key: 'create', label: 'Create' },
];

const OPTIONS: Record<string, { icon?: React.ReactNode; label: string }[]> = {
  import: [
    { label: 'Import File' },
    { label: 'Import Folder' },
    { label: 'Import Image' },
    { label: 'Import PDF' },
    { label: 'Import from URL' },
    { label: 'Import from Cloud' },
    { label: 'Import CSV' },
    { label: 'Import ZIP' },
  ],
  new: [
    { label: 'New Note' },
    { label: 'New Task' },
    { label: 'New File' },
    { label: 'New Folder' },
    { label: 'New Space' },
    { label: 'New Agent' },
    { label: 'New App' },
    { label: 'New Link' },
  ],
  create: [
    { label: 'Create Document' },
    { label: 'Create Spreadsheet' },
    { label: 'Create Presentation' },
    { label: 'Create Drawing' },
    { label: 'Create Mind Map' },
    { label: 'Create Database' },
    { label: 'Create API Request' },
    { label: 'Create Diagram' },
  ],
};

const SpaceCanvasContextMenu: React.FC<SpaceCanvasContextMenuProps> = ({ x, y, visible, onClose }) => {
  const [selectedTab, setSelectedTab] = useState('new');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x, y });
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const optionsListRef = useRef<HTMLDivElement>(null);

  // Update position if menu is opened at a new spot
  useEffect(() => {
    if (visible) setPosition({ x, y });
  }, [x, y, visible]);

  // Drag logic
  useEffect(() => {
    if (!dragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    };
    const handleMouseUp = () => setDragging(false);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, dragOffset]);

  // Only close menu on click outside (not on drag or inside click)
  useEffect(() => {
    if (!visible) return;
    const handleClick = (e: MouseEvent) => {
      // Don't close if dragging or if click is inside menu
      if (dragging) return;
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [visible, onClose, dragging]);

  // Reset highlight when tab changes or menu opens
  useEffect(() => {
    setHighlightedIndex(0);
  }, [selectedTab, visible]);

  // Keyboard navigation
  useEffect(() => {
    if (!visible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const options = OPTIONS[selectedTab];
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % options.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + options.length) % options.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        // Optionally: trigger action for selected option
        // alert(options[highlightedIndex].label);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [visible, selectedTab, highlightedIndex]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (!visible) return;
    const options = optionsListRef.current?.children;
    if (options && options[highlightedIndex]) {
      (options[highlightedIndex] as HTMLElement).scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex, visible, selectedTab]);

  if (!visible) return null;

  return (
    <div
      className="fixed z-[9999] pointer-events-none"
      style={{ left: position.x, top: position.y }}
    >
      <div
        ref={menuRef}
        className="w-72 inline-flex flex-col justify-start items-start gap-3 pointer-events-auto"
        style={{ background: 'transparent' }}
      >
        {/* Tabs (draggable handle) */}
        <div
          className={`shadow-2xl shadow-black/10 self-stretch px-3.5 py-2.5 bg-[#cccccc]/30 rounded-xl backdrop-blur-[50px] inline-flex justify-center items-center gap-8 select-none ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          onMouseDown={e => {
            // Only start drag with left mouse button
            if (e.button !== 0) return;
            setDragging(true);
            const rect = menuRef.current?.getBoundingClientRect();
            setDragOffset({
              x: e.clientX - (rect?.left ?? 0),
              y: e.clientY - (rect?.top ?? 0),
            });
          }}
        >
          {TABS.map((tab, i) => (
            <React.Fragment key={tab.key}>
              <button
                className={`text-center justify-start text-xs font-normal font-['Neue_Montreal'] transition-colors ${
                  selectedTab === tab.key
                    ? 'text-black'
                    : 'text-black/40 hover:text-black/70'
                }`}
                style={{ outline: 'none', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                onClick={e => { e.stopPropagation(); setSelectedTab(tab.key); }}
              >
                {tab.label}
              </button>
              {i < TABS.length - 1 && (
                <div className="w-0 h-3 outline outline-[0.50px] outline-offset-[-0.25px] outline-black/10"></div>
              )}
            </React.Fragment>
          ))}
        </div>
        {/* Options (scrollable) */}
        <div className="shadow-2xl shadow-black/10 overflow-hidden self-stretch h-72 p-0 relative bg-[#cccccc]/30 rounded-xl backdrop-blur-[50px] flex flex-col justify-start items-start">
          <div
            ref={optionsListRef}
            className="flex flex-col justify-start items-start gap-0 w-full overflow-y-auto scrollbar-hide"
            style={{ maxHeight: 'calc(100% - 5rem)' }}
          >
            <style>{`
              .scrollbar-hide::-webkit-scrollbar { display: none; }
              .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            {OPTIONS[selectedTab].map((opt, i) => (
              <div
                key={i}
                className={`w-full inline-flex justify-start items-center gap-2 cursor-pointer rounded-none p-3 transition ${
                  highlightedIndex === i ? 'bg-white/40' : 'hover:bg-white/30'
                }`}
                tabIndex={-1}
              >
                <div className="w-5 h-5 bg-white rounded-[5px]" />
                <div className="justify-start text-black text-xs font-normal font-['Neue_Montreal']">{opt.label}</div>
              </div>
            ))}
          </div>
          {/* Fixed input at bottom */}
          <div className="w-72 h-20 p-5 left-0 bottom-0 absolute bg-white/80 border-t-[0.50px] border-black/10 backdrop-blur-xl inline-flex justify-start items-start gap-2.5">
            <input
              className="flex-1 bg-transparent outline-none border-none text-black/60 text-xs font-normal font-['Neue_Montreal'] placeholder-black/40"
              placeholder="Describe what you want..."
              style={{ minWidth: 0 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpaceCanvasContextMenu; 