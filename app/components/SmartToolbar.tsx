'use client';

import { useState } from 'react';
import { Search, Bot, Grid3x3, MessageCircle, Zap, Layers, Clock, Bell } from 'lucide-react';

interface SmartToolbarProps {
  state: 'collapsed' | 'normal';
  onExpandToggle?: () => void;
  onHoverStateChange?: (isHovering: boolean) => void;
  onToolSelect?: (tool: string | null) => void;
}

export default function SmartToolbar({ state, onExpandToggle, onHoverStateChange, onToolSelect }: SmartToolbarProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [isMiddleExpanded, setIsMiddleExpanded] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const handleMouseEnter = () => {
    setIsHovering(true);
    onHoverStateChange?.(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    onHoverStateChange?.(false);
  };

  const handleMiddleMouseEnter = () => {
    setIsMiddleExpanded(true);
  };

  const handleMiddleMouseLeave = () => {
    setIsMiddleExpanded(false);
  };

  const handleToolClick = (toolName: string) => {
    // If middle section is not expanded, expand it first
    if (!isMiddleExpanded) {
      setIsMiddleExpanded(true);
    }
    
    // Set the selected tool (toggle if clicking the same tool)
    const newSelectedTool = selectedTool === toolName ? null : toolName;
    setSelectedTool(newSelectedTool);
    onToolSelect?.(newSelectedTool);
  };

  // Handle clicks on toolbar area (not on specific buttons)
  const handleToolbarAreaClick = (e: React.MouseEvent) => {
    // Only trigger expansion if clicking on the toolbar area itself, not buttons
    const target = e.target as Element;
    if (target.closest('div[data-button="true"]')) {
      return; // Don't trigger expansion on button clicks
    }
    onExpandToggle?.();
  };

  if (state === 'collapsed') {
    return null;
  }

  if (state === 'normal') {
    const middleTools = [
      { icon: Bot, name: 'agents' },
      { icon: Grid3x3, name: 'apps' },
      { icon: MessageCircle, name: 'chat' },
      { icon: Zap, name: 'actions' },
      { icon: Layers, name: 'elements' }
    ];

    return (
      <div 
        className="w-full max-w-[500px] bg-[#ffffff]/90 backdrop-blur-[50px] shadow-[0px_-0px_32px_0px_rgba(0,0,0,0.085)] flex flex-col justify-center items-center overflow-hidden cursor-pointer
          transition-all duration-400 delay-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
        onClick={handleToolbarAreaClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transformOrigin: 'center top',
          height: isHovering ? '52px' : '24px',
          transition: 'all 0.4s cubic-bezier(0.25,0.46,0.45,0.94)',
        }}
      >
        <div 
          className="w-full inline-flex items-center transition-all duration-300 ease-out self-stretch justify-between"
          style={{
            padding: isHovering ? '12px' : '4px',
            opacity: isHovering ? 1 : 0.5,
          }}
        >
          {/* Left section */}
          <div 
            className="h-7 flex justify-end items-center gap-1.5 transition-all duration-300 delay-100 ease-out"
            style={{
              opacity: isHovering ? 1 : 0,
              transform: isHovering ? 'translateX(0)' : 'translateX(-10px)',
            }}
          >
            <div 
              data-button="true"
              className={`w-7 h-7 rounded-[10px] flex justify-center items-center gap-3 transition-all duration-200 ease-out cursor-pointer active:scale-95 hover:scale-105 hover:bg-black/[3.5%] ${
                selectedTool === 'notifications' 
                  ? 'outline outline-[0.5px] outline-black/10' 
                  : ''
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleToolClick('notifications');
              }}
            >
              <Bell 
                size={16} 
                className={selectedTool === 'notifications' ? 'text-black/100' : 'text-black/40'} 
              />
            </div>
          </div>

          {/* Left divider - only visible when center is expanded */}
          <div 
            className="h-3.5 w-0 border-r-[0.5px] border-black/10 transition-all duration-200 ease-out"
            style={{
              width: isMiddleExpanded ? '1px' : '0px',
              opacity: isMiddleExpanded ? 1 : 0,
            }}
          ></div>

          {/* Center tools - collapsible on hover of this element only */}
          <div 
            className="flex justify-center items-center transition-all duration-200 ease-out"
            onMouseEnter={handleMiddleMouseEnter}
            onMouseLeave={handleMiddleMouseLeave}
            style={{
              gap: isMiddleExpanded ? '8px' : '0px',
              width: isMiddleExpanded ? 'auto' : 'auto',
            }}
          >
            {!isMiddleExpanded ? (
              // Collapsed state - Central Circle
              <div 
                className="bg-[#dddddd]/30 rounded-full shadow-[0px_0px_16px_0px_rgba(0,0,0,0.035),inset_3px_-3px_8px_0px_rgba(255,255,255,1.00),inset_-3px_3px_6px_0px_rgba(0,0,0,0.05)] backdrop-blur-2xl transition-all duration-400 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                style={{
                  width: isHovering ? '28px' : '16px',
                  height: isHovering ? '28px' : '16px',
                }}
              />
            ) : (
              // Expanded state - full toolbar
              <>
                {middleTools.map((item, index) => (
                  <div 
                    key={index}
                    data-button="true"
                    className={`w-7 h-7 rounded-[10px] flex justify-center items-center gap-3 transition-all duration-200 ease-out cursor-pointer hover:bg-black/[3.5%] ${
                      selectedTool === item.name 
                        ? 'outline outline-[0.5px] outline-black/10' 
                        : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToolClick(item.name);
                      setSelectedTool(item.name);
                      if (onExpandToggle) onExpandToggle();
                    }}
                    style={{
                      opacity: isMiddleExpanded ? 1 : 0,
                      transform: isMiddleExpanded ? 'scaleX(1)' : 'scaleX(0)',
                      transition: `all 0.2s ease-out`,
                      transitionDelay: isMiddleExpanded ? `${index * 20}ms` : '0ms',
                    }}
                  >
                    <item.icon 
                      size={16} 
                      className={selectedTool === item.name ? 'text-black/100' : 'text-black/40'} 
                    />
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Right divider - only visible when center is expanded */}
          <div 
            className="h-3.5 w-0 border-r-[0.5px] border-black/10 transition-all duration-200 ease-out"
            style={{
              width: isMiddleExpanded ? '1px' : '0px',
              opacity: isMiddleExpanded ? 1 : 0,
            }}
          ></div>

          {/* Right section */}
          <div 
            className="h-7 flex justify-end items-center gap-0.5 transition-all duration-300 delay-100 ease-out"
            style={{
              opacity: isHovering ? 1 : 0,
              transform: isHovering ? 'translateX(0)' : 'translateX(10px)',
            }}
          >
            <div 
              data-button="true"
              className={`w-7 h-7 rounded-[10px] flex justify-center items-center gap-3 transition-all duration-200 ease-out cursor-pointer active:scale-95 hover:scale-105 hover:bg-black/[3.5%] ${
                selectedTool === 'history' 
                  ? 'outline outline-[0.5px] outline-black/10' 
                  : ''
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleToolClick('history');
              }}
            >
              <Clock 
                size={16} 
                className={selectedTool === 'history' ? 'text-black/100' : 'text-black/40'} 
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
} 