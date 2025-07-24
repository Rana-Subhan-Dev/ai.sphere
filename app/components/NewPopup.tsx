'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowUp, Plus, FilePlus, Globe, Layers, Search, Settings, Link2, Sparkles } from 'lucide-react';

interface ControlPanelProps {
  isVisible: boolean;
  onClose: () => void;
  initialTab?: string;
}

const TABS = [
  {
    key: 'feed',
    label: 'Feed',
    draggableLabel: 'Feed',
    placeholder: 'Paste or upload data, files, or links to feed the system...',
    options: [
      { icon: '📤', title: 'Upload File', subtitle: 'Feed a file into the system', keywords: ['upload', 'file', 'import', 'feed'] },
      { icon: '🔗', title: 'Paste Link', subtitle: 'Feed a URL or link', keywords: ['paste', 'link', 'url', 'feed'] },
      { icon: '🗂️', title: 'Import Dataset', subtitle: 'Feed a dataset (CSV, JSON, etc.)', keywords: ['import', 'dataset', 'csv', 'json', 'feed'] },
      { icon: '🃏', title: 'Create FlashCard', subtitle: 'Make a new flashcard for spaced repetition', keywords: ['flashcard', 'card', 'memory', 'learn', 'feed'] },
    ],
  },
  {
    key: 'new',
    label: 'New',
    draggableLabel: 'New',
    placeholder: 'Create anything...',
    options: [
      { icon: '📄', title: 'Element', subtitle: 'File, Link, or Note', keywords: ['element', 'file', 'link', 'note', 'object'] },
      { icon: '🗂️', title: 'Cluster', subtitle: 'Folder or group of elements', keywords: ['cluster', 'folder', 'group'] },
      { icon: '🌍', title: 'Sphere', subtitle: 'A new globe or world', keywords: ['sphere', 'globe', 'world'] },
      { icon: '🚀', title: 'Space', subtitle: 'A new space or workspace', keywords: ['space', 'workspace', 'area'] },
      { icon: '🤖', title: 'Agent', subtitle: 'A new agent or assistant', keywords: ['agent', 'assistant', 'ai', 'bot'] },
      { icon: '🛠️', title: 'App/Tool', subtitle: 'A new app or tool', keywords: ['app', 'tool', 'application', 'utility'] },
      { icon: '🔲', title: 'Widget', subtitle: 'A new widget or mini-app', keywords: ['widget', 'mini-app', 'component'] },
    ],
  },
  {
    key: 'web',
    label: 'Web',
    draggableLabel: 'Web Window',
    placeholder: 'Enter a website URL...',
    options: [
      { icon: '🌐', title: 'Open Website', subtitle: 'Launch a new web window', keywords: ['web', 'site', 'browser'] },
      { icon: '🔗', title: 'Paste Link', subtitle: 'Paste a link to open', keywords: ['link', 'url', 'paste'] },
    ],
  },
  {
    key: 'spotlight',
    label: 'Spotlight',
    draggableLabel: 'Spotlight',
    placeholder: 'Search anything...',
    options: [
      { icon: '🔍', title: 'Search', subtitle: 'Find anything', keywords: ['search', 'find', 'lookup'] },
      { icon: '⭐', title: 'Favorites', subtitle: 'Quick access', keywords: ['favorite', 'quick', 'access'] },
    ],
  },
  {
    key: 'settings',
    label: 'System',
    draggableLabel: 'System',
    placeholder: 'Search or tweak system settings...',
    options: [
      { icon: '🤖', title: 'Main Agent', subtitle: 'Configure Airis main agent', keywords: ['main agent', 'airis', 'ai', 'assistant'] },
      { icon: '🌍', title: 'Globe', subtitle: 'Globe/world settings', keywords: ['globe', 'world', 'settings'] },
      { icon: '🧠', title: 'Cortex', subtitle: 'Cortex/brain settings', keywords: ['cortex', 'brain', 'memory', 'settings'] },
      { icon: '💻', title: 'Computer/Engine', subtitle: 'System/engine settings', keywords: ['computer', 'engine', 'system', 'settings'] },
      { icon: '🌐', title: 'Network', subtitle: 'Network and connectivity', keywords: ['network', 'connectivity', 'internet'] },
    ],
  },
];

const TAB_SHORTCUTS: Record<string, string> = {
  new: 'Shift+N',
  web: 'Shift+T',
  feed: 'Shift+I',
  spotlight: 'Shift+F',
  settings: 'Shift+P',
};

const TAB_ICONS: Record<string, (active: boolean) => React.ReactNode> = {
  feed: (active) => <FilePlus size={13} className={active ? 'mr-1 text-black/80' : 'mr-1 text-black/30'} />, 
  new: (active) => <Plus size={13} className={active ? 'mr-1 text-black/80' : 'mr-1 text-black/30'} />, 
  web: (active) => <Globe size={13} className={active ? 'mr-1 text-black/80' : 'mr-1 text-black/30'} />, 
  spotlight: (active) => <Search size={13} className={active ? 'mr-1 text-black/80' : 'mr-1 text-black/30'} />, 
  settings: (active) => <Settings size={13} className={active ? 'mr-1 text-black/80' : 'mr-1 text-black/30'} />, 
};

export default function ControlPanel({ isVisible, onClose, initialTab }: ControlPanelProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [inputText, setInputText] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState(initialTab || 'new');
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Set active tab on open if initialTab changes
  useEffect(() => {
    if (isVisible && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isVisible, initialTab]);

  // Enhanced close handler that always resets position
  const handleClose = () => {
    setPosition({ x: 0, y: 0 }); // Reset position immediately
    onClose();
  };

  const tabConfig = TABS.find(tab => tab.key === activeTab) || TABS[0];

  // Filter options based on search input
  const filteredOptions = tabConfig.options.filter(option => {
    if (!inputText.trim()) return true;
    const searchTerm = inputText.toLowerCase();
    return (
      option.title.toLowerCase().includes(searchTerm) ||
      option.subtitle.toLowerCase().includes(searchTerm) ||
      option.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))
    );
  });

  // Reset selected index when options change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredOptions.length, inputText]);

  // Scroll to keep selected option visible
  useEffect(() => {
    if (scrollRef.current && optionRefs.current[selectedIndex]) {
      const scrollContainer = scrollRef.current;
      const selectedElement = optionRefs.current[selectedIndex];
      
      if (selectedElement) {
        const containerRect = scrollContainer.getBoundingClientRect();
        const elementRect = selectedElement.getBoundingClientRect();
        
        // Calculate relative positions within the scroll container
        const containerTop = scrollContainer.scrollTop;
        const containerBottom = containerTop + scrollContainer.clientHeight;
        const elementTop = selectedElement.offsetTop;
        const elementBottom = elementTop + selectedElement.offsetHeight;
        
        // Account for input bar covering top 70px when scrolling up
        const inputBarOffset = 70;
        const visibleAreaTop = containerTop + inputBarOffset;
        
        // Check if element is outside visible area
        if (elementTop < visibleAreaTop) {
          // Element is above visible area (behind input bar), scroll up to show it below input bar
          scrollContainer.scrollTo({
            top: elementTop - inputBarOffset - 10, // Position 70px from top + 10px padding
            behavior: 'smooth'
          });
        } else if (elementBottom > containerBottom) {
          // Element is below visible area, scroll down
          scrollContainer.scrollTo({
            top: elementBottom - scrollContainer.clientHeight + 10, // 10px padding
            behavior: 'smooth'
          });
        }
      }
    }
  }, [selectedIndex, filteredOptions.length]);

  // Animation handling
  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      setPosition({ x: 0, y: 0 }); // Reset position when opening
      // Auto-focus input when popup appears
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    } else {
      setIsAnimating(false);
      // Reset position when closing to ensure it's centered on next open
      setTimeout(() => {
        setPosition({ x: 0, y: 0 });
      }, 250); // Wait for animation to complete
    }
  }, [isVisible]);

  // Keyboard navigation - NO LOOPING
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isVisible) return;

      // Tab switching shortcuts (always work, even if input is focused)
      if (event.shiftKey) {
        if (event.key.toLowerCase() === 'n') setActiveTab('new');
        if (event.key.toLowerCase() === 't') setActiveTab('web');
        if (event.key.toLowerCase() === 'i') setActiveTab('feed');
        if (event.key.toLowerCase() === 'f') setActiveTab('spotlight');
        if (event.key.toLowerCase() === 'p') setActiveTab('settings');
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          const idx = TABS.findIndex(tab => tab.key === activeTab);
          setActiveTab(TABS[(idx + 1) % TABS.length].key);
        }
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          const idx = TABS.findIndex(tab => tab.key === activeTab);
          setActiveTab(TABS[(idx - 1 + TABS.length) % TABS.length].key);
        }
      }

      // If the input field is focused, handle navigation keys and specific input keys
      const isInputFocused = document.activeElement === inputRef.current;
      
      if (isInputFocused) {
        switch (event.key) {
          case 'Escape':
            event.preventDefault();
            event.stopPropagation();
            inputRef.current?.blur(); // Remove focus from input
            handleClose();
            break;
          case 'Enter':
            event.preventDefault();
            event.stopPropagation();
            if (filteredOptions[selectedIndex]) {
              handleOptionSelect(filteredOptions[selectedIndex]);
            }
            break;
          case 'ArrowDown':
            event.preventDefault();
            event.stopPropagation();
            setSelectedIndex(prev => 
              prev < filteredOptions.length - 1 ? prev + 1 : prev
            );
            break;
          case 'ArrowUp':
            event.preventDefault();
            event.stopPropagation();
            setSelectedIndex(prev => 
              prev > 0 ? prev - 1 : prev
            );
            break;
          // Let Delete, Backspace, and all other keys work normally in the input
          default:
            // Stop propagation to prevent space canvas from handling these events
            event.stopPropagation();
            break;
        }
        return;
      }

      // For non-input-focused state, handle navigation keys
      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          event.stopPropagation();
          handleClose();
          break;
        case 'ArrowDown':
          event.preventDefault();
          event.stopPropagation();
          setSelectedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          event.stopPropagation();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : prev
          );
          break;
        case 'Enter':
          event.preventDefault();
          event.stopPropagation();
          if (filteredOptions[selectedIndex]) {
            handleOptionSelect(filteredOptions[selectedIndex]);
          }
          break;
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown, { capture: true });
      return () => {
        document.removeEventListener('keydown', handleKeyDown, { capture: true });
      };
    }
  }, [isVisible, handleClose, filteredOptions, selectedIndex, activeTab]);

  // Drag functionality
  const handleMouseDown = (event: React.MouseEvent) => {
    if (!dragRef.current) return;
    
    setIsDragging(true);
    setDragStart({
      x: event.clientX - position.x,
      y: event.clientY - position.y
    });
    
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!isDragging) return;
    
    setPosition({
      x: event.clientX - dragStart.x,
      y: event.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-control-panel]')) {
        handleClose();
      }
    };

    if (isVisible && !isDragging) {
      document.addEventListener('mousedown', handleClickOutside, { capture: true });
      return () => {
        document.removeEventListener('mousedown', handleClickOutside, { capture: true });
      };
    }
  }, [isVisible, handleClose, isDragging]);

  const handleOptionSelect = (option: typeof tabConfig.options[0]) => {
    console.log('Selected option:', option);
    handleClose();
  };

  const handleSendMessage = () => {
    if (inputText.trim()) {
      console.log('Sending:', inputText);
      setInputText('');
      handleClose();
    }
  };

  // Navigation shortcuts data (for bottom bar)
  const navigationShortcuts = TABS.map(tab => ({
    label: tab.label,
    shortcut: TAB_SHORTCUTS[tab.key] || '',
    key: tab.key,
  }));

  if (!isVisible && !isAnimating) {
    return null;
  }

  return (
    <div 
      className="fixed -mt-10 inset-0 z-[1000] flex items-center justify-center pointer-events-none"
      style={{
        background: isAnimating && isVisible ? 'rgba(0, 0, 0, 0.02)' : 'transparent',
        transition: 'background 0.3s cubic-bezier(0.25,0.46,0.45,0.94)',
      }}
    >
      <div 
        data-control-panel
        className="pointer-events-auto"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) ${
            isAnimating && isVisible 
              ? 'scale(1) translateY(0px)' 
              : 'scale(0.95) translateY(10px)'
          }`,
          opacity: isAnimating && isVisible ? 1 : 0,
          transition: isDragging ? 'opacity 0.25s' : 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
          transformOrigin: 'center center',
        }}
      >
        <div className="w-[50vw] min-w-[500px] relative inline-flex flex-col justify-start items-center gap-3">
          {/* Draggable Label - dynamic per tab */}
          <div 
            ref={dragRef}
            className={`px-14 py-1 bg-[#cccccc]/30 rounded-lg inline-flex justify-start items-center gap-5 transition-all duration-150 ${
              isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab hover:bg-[#cccccc]/40'
            }`}
            style={{
              backdropFilter: 'blur(140px)',
              WebkitBackdropFilter: 'blur(140px)',
            }}
            onMouseDown={handleMouseDown}
          >
            <div className="justify-start text-black/50 text-xs font-normal font-['Neue_Montreal'] select-none">{tabConfig.draggableLabel}</div>
          </div>

          {/* Main Options Panel */}
          <div 
            className="w-full h-[27.5vw] pt-[68px] pb-6 relative bg-[#cccccc]/30 rounded-[10px] shadow-[0px_24px_60px_0px_rgba(0,0,0,0.12),0px_30px_100px_0px_rgba(0,0,0,0.05)] flex flex-col justify-start items-center overflow-hidden"
            style={{
              backdropFilter: 'blur(140px)',
              WebkitBackdropFilter: 'blur(140px)',
            }}
          >
            {/* Scrollable Options */}
            <div 
              ref={scrollRef}
              className="self-stretch flex-1 overflow-y-auto scrollbar-hide"
            >
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <div 
                    key={`${option.title}-${index}`}
                    ref={(el) => { optionRefs.current[index] = el; }}
                    className={`self-stretch p-3.5 bg-black/0 flex flex-col justify-start items-start gap-2 cursor-pointer transition-all duration-150 ease-out group ${
                      index === selectedIndex 
                        ? 'bg-black/[3.5%]' 
                        : 'hover:bg-black/5'
                    }`}
                    onClick={() => handleOptionSelect(option)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="inline-flex justify-start items-center gap-2">
                      <div className="w-7 h-7 bg-white rounded-lg"></div>
                      <div className="inline-flex flex-col justify-center items-start">
                        <div className="justify-start text-black/80 text-xs font-normal font-['Neue_Montreal']">
                          {option.title}
                        </div>
                        <div className="self-stretch justify-start text-black/40 text-xs font-normal font-['Neue_Montreal']">
                          {option.subtitle}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="self-stretch h-full flex flex-col justify-center items-center gap-0 text-black/50">
                  <p className="text-md font-normal font-['Neue_Montreal']">No results found</p>
                  <p className="text-sm font-normal font-['Neue_Montreal'] text-black/30">Try a different search term</p>
                </div>
              )}
            </div>

            {/* Bottom Navigation Bar - acts as tab bar */}
            <div className="w-full py-1 left-0 bottom-0 absolute bg-[#fff]/[20%] border-t-[0.50px] border-black/5 backdrop-blur-xl inline-flex justify-center items-center gap-8">
              {navigationShortcuts.map((nav: {label: string, shortcut: string, key: string}, index: number) => (
                <div
                  key={index}
                  className="relative flex justify-center items-center gap-0.5 cursor-pointer group"
                  onClick={() => setActiveTab(nav.key)}
                >
                  {/* Shortcut tooltip above tab, only on hover */}
                  {nav.shortcut && (
                    <div className="absolute -top-9 left-1/2 -translate-x-1/2 z-10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150">
                      <div className="px-2 py-1 rounded-lg bg-black/5 backdrop-blur-md text-xs text-black/40 font-['Neue_Montreal']">
                        {nav.shortcut}
                      </div>
                    </div>
                  )}
                  {TAB_ICONS[nav.key](activeTab === nav.key)}
                  <div className={`justify-start text-xs font-normal font-['Neue_Montreal'] ${activeTab === nav.key ? 'text-black/80' : 'text-black/30'}`}>{nav.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Input Bar - positioned over the panel */}
          <div 
            className="w-full p-3 left-0 top-[37px] absolute bg-[#fff]/[15%] rounded-tl-[10px] rounded-tr-[10px] border-b-[0.50px] border-black/10 backdrop-blur-lg flex flex-col justify-start items-center gap-4"
          >
            <div className="self-stretch p-2.5 rounded-2xl inline-flex justify-start items-center gap-2.5 relative">
              <div className="relative flex flex-grow justify-start items-center gap-2.5 w-full">
                <textarea 
                  ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 w-full bg-transparent text-black/100 text-base font-normal font-['Neue_Montreal'] outline-none placeholder:text-black/30 resize-none transition-all duration-200 ease-out"
                  style={{ 
                    caretColor: 'rgba(0, 0, 0, 0.3)',
                    minHeight: '20px'
                  }}
                  placeholder={tabConfig.placeholder}
                  rows={1}
                />
              </div>
            </div>

            {/* Top right button - plus when empty, arrow when text */}
            <div className="right-[18px] top-[18px] absolute inline-flex justify-end items-center gap-2">
              <div className="flex justify-end items-center gap-2">
                <button
                  onClick={inputText.trim() ? handleSendMessage : handleClose}
                  className={`w-8 h-8 p-1.5 rounded-[82.35px] flex justify-center items-center gap-2.5 transition-all duration-300 ease-out ${
                    inputText.trim() 
                      ? 'bg-white/50 hover:bg-white/90 shadow-[inset_4px_-2px_8px_0px_rgba(0,0,0,0.125),_inset_-4px_4px_12px_0px_rgba(255,255,255,0.8),_0px_6px_20px_0px_rgba(0,0,0,0.05)]'
                      : 'bg-black/[3.5%] hover:bg-black/5 shadow-none'
                  }`}
                >
                  {inputText.trim() ? (
                    <ArrowUp size={16} className="text-black/30" />
                  ) : (
                    <Plus size={16} className="text-black/40" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 