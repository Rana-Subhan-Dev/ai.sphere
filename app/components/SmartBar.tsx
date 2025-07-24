'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import SmartPanel from './SmartPanel';
import SmartToolbar from './SmartToolbar';
import SmartInputBar from './SmartInputBar';

interface SmartBarProps {
  onStateChange?: (state: 'expanded' | 'collapsed' | 'normal') => void;
  onHoverChange?: (isHovering: boolean) => void;
  forceHidden?: boolean;
  onHover?: (isHovering: boolean) => void;
  interactionPreviewVisible?: boolean;
}

const SmartBar: React.FC<SmartBarProps> = ({
  onStateChange,
  onHoverChange,
  forceHidden,
  onHover,
  interactionPreviewVisible = false
}) => {
  const [state, setState] = useState<'expanded' | 'collapsed' | 'normal'>('collapsed');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [inputText, setInputText] = useState('');
  const [inputBarHeight, setInputBarHeight] = useState(80);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  
  // Track previous state to prevent unnecessary calls
  const prevStateRef = useRef(state);

  // Notify parent of state changes - only when state actually changes
  useEffect(() => {
    if (onStateChange && prevStateRef.current !== state) {
      prevStateRef.current = state;
      onStateChange(state);
    }
  }, [state, onStateChange]);

  const handleMouseEnter = useCallback(() => {
    onHoverChange?.(true);
    onHover?.(true);
    if (state === 'collapsed') {
      setState('normal');
      onStateChange?.('normal');
    }
  }, [onHoverChange, onHover, state, onStateChange]);

  const handleMouseLeave = useCallback(() => {
    onHoverChange?.(false);
    onHover?.(false);
    if (state === 'normal') {
      setState('collapsed');
      onStateChange?.('collapsed');
    }
  }, [onHoverChange, onHover, state, onStateChange]);

  const handleExpandToggle = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    if (state === 'normal') {
      setState('expanded');
      setInputBarHeight(64); // Default to minimum 64px in expanded
    } else if (state === 'expanded') {
      setState('normal');
      setInputBarHeight(80);
    }
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 220); // Match the new faster animation duration
  };

  const handleClosePanel = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setState('normal');
    setInputBarHeight(80);
    onHoverChange?.(false);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 220); // Match the animation duration
  };

  // Auto-focus input when transitioning to normal state
  useEffect(() => {
    if (state === 'normal' && inputRef.current) {
      setTimeout(() => {
        const input = inputRef.current;
        if (input) {
          input.focus();
          // Position cursor at the end of existing text
          const length = input.value.length;
          input.setSelectionRange(length, length);
        }
      }, 150);
    }
  }, [state]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !interactionPreviewVisible) {
        if (state !== 'collapsed') {
          setState('collapsed');
          onStateChange?.('collapsed');
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [state, onStateChange, interactionPreviewVisible]);

  // Global spacebar handler for opening SmartBar
  useEffect(() => {
    const handleSpaceKey = (event: KeyboardEvent) => {
      // Only trigger if SmartBar is collapsed and not already transitioning
      if (event.code === 'Space' && state === 'collapsed' && !isTransitioning) {
        // Don't trigger if user is typing in an input field, textarea, or contenteditable
        const activeElement = document.activeElement;
        const isTyping = activeElement && (
          activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.getAttribute('contenteditable') === 'true' ||
          activeElement.getAttribute('role') === 'textbox'
        );
        
        if (!isTyping) {
          event.preventDefault();
          event.stopPropagation();
          
          setIsTransitioning(true);
          setState('normal');
          onHoverChange?.(true);
          
          setTimeout(() => {
            setIsTransitioning(false);
          }, 220); // Match the animation duration
        }
      }
    };

    document.addEventListener('keydown', handleSpaceKey, { capture: true });
    
    return () => {
      document.removeEventListener('keydown', handleSpaceKey, { capture: true });
    };
  }, [state, isTransitioning, onHoverChange]);

  // Click outside to close expanded panel
  useEffect(() => {
    if (state === 'expanded') {
      const handleClickOutside = (event: MouseEvent) => {
        if (isTransitioning) return;
        
        // Check if click is outside the SmartBar components
        const target = event.target as Element;
        if (!target.closest('[id^="smart-"]')) {
          event.preventDefault();
          event.stopPropagation();
          
          setIsTransitioning(true);
          setState('normal');
          setInputBarHeight(80);
          onHoverChange?.(false);
          
          setTimeout(() => {
            setIsTransitioning(false);
          }, 220); // Match the animation duration
        }
      };

      document.addEventListener('mousedown', handleClickOutside, { capture: true });
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside, { capture: true });
      };
    }
  }, [state, isTransitioning, onHoverChange]);

  // Main container with 28px corners and overflow hidden for all states
  return (
    <div className="relative">
      <div 
        className={`
          relative cursor-pointer overflow-hidden rounded-[28px] transition-all duration-300
          ${state === 'collapsed' 
            ? 'w-[200px] hover:w-64' 
            : state === 'normal'
            ? 'w-auto flex flex-col justify-end items-center'
            : 'w-[70vw] flex flex-col'
          }
          ${forceHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'}
        `}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          height: state === 'collapsed' 
            ? '8px' 
            : state === 'expanded'
            ? '80vh'
            : 'auto',
          minHeight: state === 'normal' ? '0' : undefined,
          maxHeight: state === 'normal' ? '116px' : undefined,
          borderRadius: state === 'collapsed' ? '24px' : '28px',
          transform: state === 'collapsed' 
            ? 'scale(1)' 
            : 'scale(1) translateY(-2px)',
          transformOrigin: 'center bottom',
          transition: `all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)${state === 'normal' ? ', height 0s' : ''}`,
          pointerEvents: isTransitioning ? 'none' : 'auto',
          backgroundColor: state === 'collapsed' 
            ? 'rgba(255, 255, 255, 0.5)'
            : 'transparent',
          backdropFilter: state === 'collapsed'
            ? 'blur(50px)'
            : 'none',
          boxShadow: state === 'collapsed'
            ? '0px 10px 20px 0px rgba(0,0,0,0.05), inset 0px 0px 12px 0px rgba(255,255,255,0.50)'
            : state === 'normal'
            ? '0px 14px 40px 0px rgba(0,0,0,0.06)'
            : 'none',
        }}
      >
        {/* COLLAPSED STATE */}
        {state === 'collapsed' && (
          <div className="w-full h-full" />
        )}
        
        {/* NORMAL STATE - Input + Toolbar only */}
        {state === 'normal' && (
          <div className="flex flex-col items-center w-full">
            {/* Input Bar */}
            <div 
              style={{
                transform: 'translateY(0px) scale(1)',
                transformOrigin: 'center bottom',
                transition: 'all 0.25s cubic-bezier(0.25,0.46,0.45,0.94)',
              }}
            >
              <SmartInputBar 
                state={state}
                inputText={inputText}
                setInputText={setInputText}
                inputRef={inputRef}
                height={inputBarHeight}
                onHeightChange={setInputBarHeight}
              />
            </div>
            
            {/* Toolbar - always in normal state, click triggers expansion */}
            <SmartToolbar 
              state="normal"
              onExpandToggle={handleExpandToggle}
            />
          </div>
        )}
        
        {/* EXPANDED STATE - Panel background with floating toolbar/input */}
        {state === 'expanded' && (
          <div className="relative w-full h-full flex flex-col justify-end items-center space-y-3.5">
            {/* Rest of expanded state content remains the same */}
            <div 
              className="relative w-full h-full bg-[#dddddd]/[20%] backdrop-blur-2xl rounded-[18px] overflow-hidden"
            >
              <div 
                className="absolute inset-0 overflow-hidden"
                style={{
                  transform: isTransitioning 
                    ? 'translateY(20px) scale(0.995)' 
                    : 'translateY(0%) scale(1)',
                  opacity: isTransitioning ? 0.3 : 1,
                  transition: 'transform 0.15s cubic-bezier(0.4, 0.0, 0.2, 1), opacity 0.12s ease-out',
                  transitionDelay: isTransitioning ? '0ms' : '0ms',
                  transformOrigin: 'center bottom',
                }}
              >
                <SmartPanel 
                  onClose={handleClosePanel}
                  isBackground={true}
                />
              </div>

              <div 
                className="absolute w-full bottom-0 left-0 right-0 flex flex-col items-center"
                style={{
                  transform: isTransitioning 
                    ? 'translateY(8px) scale(0.998)' 
                    : 'translateY(0px) scale(1)',
                  opacity: isTransitioning ? 0.6 : 1,
                  transition: 'transform 0.15s cubic-bezier(0.4, 0.0, 0.2, 1), opacity 0.1s ease-out',
                  transitionDelay: isTransitioning ? '0ms' : '0ms',
                }}
              >
                <SmartInputBar 
                  state={state}
                  inputText={inputText}
                  setInputText={setInputText}
                  inputRef={inputRef}
                  height={inputBarHeight}
                  onHeightChange={setInputBarHeight}
                />
              </div>
            </div>

            <div 
              className="h-auto w-full max-w-[500px] bg-black/20 backdrop-blur-xl rounded-[28px] z-20 overflow-hidden flex justify-center items-center"
            >
              <SmartToolbar 
                state="normal"
                onExpandToggle={handleExpandToggle}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartBar;