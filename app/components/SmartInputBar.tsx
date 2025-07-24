'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowUp, Mic, Paperclip } from 'lucide-react';

interface SmartInputBarProps {
  state: 'collapsed' | 'normal' | 'expanded';
  inputText: string;
  setInputText: (text: string) => void;
  inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  height?: number;
  onHeightChange?: (height: number) => void;
}

export default function SmartInputBar({ 
  state, 
  inputText, 
  setInputText, 
  inputRef,
  height = 80,
  onHeightChange
}: SmartInputBarProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const initialHeight = useRef(height);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isContextDockOpen, setIsContextDockOpen] = useState(false);

  // Height constraints
  const MIN_HEIGHT = 64;
  const MAX_HEIGHT = 400;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    dragStartY.current = e.clientY;
    initialHeight.current = height;
    
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
  }, [height]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    // Cancel previous animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Use RAF for smooth updates
    animationFrameRef.current = requestAnimationFrame(() => {
      const deltaY = dragStartY.current - e.clientY; // Inverted: drag up = increase height
      const newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, initialHeight.current + deltaY));
      
      onHeightChange?.(newHeight);
    });
  }, [isDragging, onHeightChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    
    // Clean up animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: true });
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (state === 'collapsed') {
    return null;
  }

  if (state === 'normal') {
    return (
      <div className="relative">
        <div 
          ref={containerRef}
          id="smart-input-container"
          className="max-h-[64px] w-[480px] px-3 py-2.5 relative bg-[#ffffff]/90 rounded-t-[28px] shadow-[0px_34px_84px_0px_rgba(0,0,0,0.03)] backdrop-blur-xl flex flex-col justify-start items-center gap-4 overflow-hidden"
          style={{
            height: 'auto',
            transition: isDragging ? 'none' : 'all 0.2s cubic-bezier(0.25,0.46,0.45,0.94)',
            transformOrigin: 'center bottom',
            willChange: isDragging ? 'height' : 'auto',
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="w-full flex flex-col">
            {/* Input + Buttons Area */}
            <div className="relative w-full flex flex-col">
              {/* Context Button (Left) */}
              {(isHovered || inputText.trim()) && (
                <div className="absolute left-[4px] bottom-[12px] flex items-center z-10 transition-opacity duration-200" style={{opacity: (isHovered || inputText.trim()) ? 1 : 0}}>
                  <button
                    className="w-7 h-7 p-1.5 rounded-full flex justify-center items-center transition-all duration-150 ease-out cursor-pointer"
                    aria-label="Attach"
                    tabIndex={0}
                    onClick={() => setIsContextDockOpen((v) => !v)}
                  >
                    <Paperclip size={18} className="text-black/30 hover:text-black/60" />
                  </button>
                </div>
              )}
              {/* Input Field */}
              <div 
                id="smart-input-field"
                className="px-10 self-stretch p-2.5 rounded-2xl inline-flex justify-start items-center gap-2.5 flex-1"
              >
                <div className="relative w-full flex justify-start items-start gap-2.5 h-full">
                  <textarea 
                    ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className={`flex-1 w-full h-auto min-h-7 bg-transparent text-black font-normal font-['Neue_Montreal'] outline-none placeholder:text-black/30 resize-none transition-all duration-200 ease-out
                      ${inputText.trim() ? 'text-left' : 'text-center placeholder:text-center'}`}
                    style={{ 
                      caretColor: 'rgba(0, 0, 0, 0.3)',
                      paddingTop: height > 100 ? '8px' : '0px'
                    }}
                    placeholder="Search, chat, create, instruct..."
                    rows={1}
                  />
                </div>
              </div>
              {/* Speech/Send Buttons (Right) */}
              <div className="absolute right-[4px] bottom-[12px] flex items-center gap-2 z-10">
                {(isHovered || inputText.trim()) && !inputText.trim() && (
                  <button
                    className="w-7 h-7 p-1.5 rounded-full flex justify-center items-center transition-all duration-150 ease-out cursor-pointer"
                    aria-label="Voice Input"
                    tabIndex={0}
                  >
                    <Mic size={18} className="text-black/30 hover:text-black/60" />
                  </button>
                )}
                {inputText.trim() && (
                  <button 
                    className="w-7 h-7 p-1.5 rounded-full flex justify-center items-center bg-black opacity-100 hover:bg-black/80 cursor-pointer scale-100 transition-all duration-150 ease-out"
                    aria-label="Send"
                    tabIndex={0}
                  >
                    <ArrowUp size={14} className="text-white" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Context Dock - only show when paperclip hovered */}
        <div
              style={{height: isContextDockOpen ? '52px' : 0, overflow: 'hidden', transition: 'height 0.2s cubic-bezier(0.25,0.46,0.45,0.94)'}}
        >
              {isContextDockOpen && (
                <div className="h-[52px] border-t-[1.5px] border-t-[#eeeeee]/50 w-full p-3 bg-black/5 inline-flex justify-center items-center">
                  <div className="flex justify-center items-center gap-3.5">
                    <div className="w-7 h-6 bg-white rounded-[5px]" />
                    <div className="w-7 h-6 bg-white/60 rounded-[5px]" />
                    <div className="w-7 h-6 bg-white/60 rounded-[5px]" />
                    <div className="w-7 h-6 bg-white/60 rounded-[5px]" />
                    <div className="w-7 h-6 bg-white/60 rounded-[5px]" />
                    <div className="w-7 h-6 bg-white/60 rounded-[5px]" />
                    <div className="w-7 h-6 bg-white/60 rounded-[5px]" />
                    <div className="w-7 h-6 bg-white/60 rounded-[5px]" />
                    <div className="w-7 h-6 bg-white/60 rounded-[5px]" />
                  </div>
                </div>
              )}
            </div>
      </div>
    );
  }

  if (state === 'expanded') {
    // Floating input bar in expanded state
    return (
      <div className="w-full relative">
        <div 
          ref={containerRef}
          id="smart-input-container"
          className="w-full p-[18px] border-t-[1.5px] border-t-[#eeeeee]/50 bg-[#f1f1f1]/90 rounded-t-[0px] shadow-[0px_12px_40px_0px_rgba(0,0,0,0.08)] backdrop-blur-xl flex flex-col justify-start items-center gap-4"
          style={{
            height: 'auto',
            transition: isDragging ? 'none' : 'all 0.2s cubic-bezier(0.25,0.46,0.45,0.94)',
            transformOrigin: 'center bottom',
            willChange: isDragging ? 'height' : 'auto',
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="w-full flex flex-col">
            {/* Input + Buttons Area */}
            <div className="relative w-full flex flex-col">
              {/* Draggable Handle */}
              {/* <div 
                id="smart-input-handle"
                onMouseDown={handleMouseDown}
                className={`w-10 h-[5px] absolute -top-[13px] left-1/2 transform -translate-x-1/2 bg-[#d9d9d9] rounded-[100px] cursor-ns-resize select-none
                  transition-all duration-150 ease-out
                  ${isDragging 
                    ? 'bg-[#999] scale-110 shadow-lg' 
                    : 'hover:bg-[#bbb] hover:scale-105 active:bg-[#999]'
                  }`}
              /> */}

              {/* Context Button (Left) */}
              {(isHovered || inputText.trim()) && (
                <div className="absolute left-[0px] bottom-[0px] flex items-center z-10 transition-opacity duration-200" style={{opacity: (isHovered || inputText.trim()) ? 1 : 0}}>
                  <button
                    className="w-7 h-7 p-1.5 rounded-full flex justify-center items-center transition-all duration-150 ease-out cursor-pointer"
                    aria-label="Attach"
                    tabIndex={0}
                    onClick={() => setIsContextDockOpen((v) => !v)}
                  >
                    <Paperclip size={18} className="text-black/30 hover:text-black/60" />
                  </button>
                </div>
              )}
              {/* Input Field */}
              <div 
                id="smart-input-field"
                className="px-10 self-stretch inline-flex justify-start items-center gap-2.5 flex-1"
              >
                <div className=" relative flex justify-center items-start gap-2.5 flex-1">
                  <textarea 
                    ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className={`max-w-[50%] min-w-[400px] h-7 flex-1 bg-transparent text-black font-normal font-['Neue_Montreal'] outline-none placeholder:text-black/30 resize-none transition-all duration-200 ease-out
                      ${inputText.trim() ? 'text-left' : 'text-center align-text-top placeholder:text-center'}`}
                    style={{ 
                      caretColor: 'rgba(0, 0, 0, 0.3)',
                      paddingTop: height > 100 ? '8px' : '0px'
                    }}
                    placeholder="Search, chat, create, instruct..."
                  />
                </div>
              </div>
              {/* Speech/Send Buttons (Right) */}
              <div className="absolute right-[0px] bottom-[0px] flex items-center gap-2 z-10">
                {(isHovered || inputText.trim()) && !inputText.trim() && (
                  <button
                    className="w-7 h-7 p-1.5 rounded-full flex justify-center items-center transition-all duration-150 ease-out cursor-pointer"
                    aria-label="Voice Input"
                    tabIndex={0}
                  >
                    <Mic size={18} className="text-black/30 hover:text-black/60" />
                  </button>
                )}
                {inputText.trim() && (
                  <button 
                    className="w-7 h-7 p-1.5 rounded-full flex justify-center items-center bg-black opacity-100 hover:bg-black/80 cursor-pointer scale-100 transition-all duration-150 ease-out"
                    aria-label="Send"
                    tabIndex={0}
                  >
                    <ArrowUp size={14} className="text-white" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Context Dock - only show when paperclip hovered */}
        <div
              style={{height: isContextDockOpen ? '52px' : 0, overflow: 'hidden', transition: 'height 0.2s cubic-bezier(0.25,0.46,0.45,0.94)'}}
        >
              {isContextDockOpen && (
                <div className="h-[52px] w-full p-3 bg-black/5 inline-flex justify-center items-center">
                  <div className="flex justify-center items-center gap-3.5">
                    <div className="w-7 h-6 bg-white rounded-[5px]" />
                    <div className="w-7 h-6 bg-white/60 rounded-[5px]" />
                    <div className="w-7 h-6 bg-white/60 rounded-[5px]" />
                    <div className="w-7 h-6 bg-white/60 rounded-[5px]" />
                    <div className="w-7 h-6 bg-white/60 rounded-[5px]" />
                    <div className="w-7 h-6 bg-white/60 rounded-[5px]" />
                    <div className="w-7 h-6 bg-white/60 rounded-[5px]" />
                    <div className="w-7 h-6 bg-white/60 rounded-[5px]" />
                    <div className="w-7 h-6 bg-white/60 rounded-[5px]" />
                  </div>
                </div>
              )}
            </div>
      </div>
    );
  }

  return null;
} 