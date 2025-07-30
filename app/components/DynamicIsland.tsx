'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Command, 
  Folder, 
  Home, 
  Search,
  Calendar,
  MessageSquare,
  Settings,
  Bell,
  User,
  Wifi,
  Battery,
  Volume2,
  Bluetooth,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Plus,
  Bookmark,
  Share,
  MoreHorizontal,
  Square,
  Globe,
  X
} from 'lucide-react';

type DynamicIslandState = 'collapsed' | 'full-width' | 'full-width-dock';
type SmartBarState = 'collapsed' | 'normal' | 'expanded';

interface WebViewTab {
  id: string;
  url: string;
  title: string;
  favicon?: string;
}

interface DynamicIslandInfo {
  isDockVisible: boolean;
  height: number;
  totalHeight: number; // height + 24px gap
}

interface DynamicIslandProps {
  onStateChange?: (info: DynamicIslandInfo) => void;
  onSphereClick?: (sphereName: string) => void;
  onChatClick?: () => void;
  selectedSphere?: { id: string; name: string } | null;
  sphereWindowVisible?: boolean;
  shouldScaleDown?: boolean;
  chatVisible?: boolean;
  webViewVisible?: boolean;
  webViewUrl?: string;
  onWebViewBack?: () => void;
  onWebViewForward?: () => void;
  onWebViewRefresh?: () => void;
  onWebViewNewTab?: () => void;
  onWebViewUrlChange?: (url: string) => void;
  smartBarState?: SmartBarState;
  webViewTabs?: WebViewTab[];
  activeTabId?: string | null;
  onTabClose?: (tabId: string) => void;
  onTabSwitch?: (tabId: string) => void;
  onDockHoverChange?: (isHovering: boolean) => void;
  displayTitle?: string;
}

export default function DynamicIsland({ 
  onStateChange, 
  onSphereClick, 
  onChatClick,
  selectedSphere,
  sphereWindowVisible = false,
  shouldScaleDown = false,
  chatVisible = false,
  webViewVisible = false,
  webViewUrl = '',
  onWebViewBack,
  onWebViewForward,
  onWebViewRefresh,
  onWebViewNewTab,
  onWebViewUrlChange,
  smartBarState = 'collapsed',
  webViewTabs = [],
  activeTabId = null,
  onTabClose,
  onTabSwitch,
  onDockHoverChange,
  displayTitle
}: DynamicIslandProps) {
  const [state, setState] = useState<DynamicIslandState>('collapsed');
  
  // Click-to-lock state for dock
  const [isDockLocked, setIsDockLocked] = useState(false);
  
  // Browser tabs dock state
  const [isHovering, setIsHovering] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [hoveredTabRect, setHoveredTabRect] = useState<DOMRect | null>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Add separate hover states
  const [isSphereHovered, setIsSphereHovered] = useState(false);
  const [isDockHovered, setIsDockHovered] = useState(false);

  const handleTabMouseEnter = (tabId: string, element: HTMLDivElement) => {
    setHoveredTab(tabId);
    setHoveredTabRect(element.getBoundingClientRect());
  };

  const getTabScale = (index: number) => {
    if (!isHovering || hoveredTab === null) return 1;
    
    const hoveredIndex = webViewTabs.findIndex(tab => tab.id === hoveredTab);
    const distance = Math.abs(index - hoveredIndex);
    
    if (distance === 0) return 1.87;
    if (distance === 1) return 1.6;
    if (distance === 2) return 1.3;
    if (distance === 3) return 1.1;
    return 1;
  };

  const getTabSpacing = (index: number) => {
    if (!isHovering || hoveredTab === null) return 12;
    
    const hoveredIndex = webViewTabs.findIndex(tab => tab.id === hoveredTab);
    const distance = Math.abs(index - hoveredIndex);
    
    if (distance === 0) return 20;
    if (distance === 1) return 16;
    return 12;
  };

  const formatDomain = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return url;
    }
  };
  
  // Track previous state to prevent unnecessary calls
  const prevStateRef = useRef(state);

  // Fast height calculation with correct measurements
  const getHeightInfo = useCallback((currentState: DynamicIslandState): DynamicIslandInfo => {
    const baseHeight = 40; // h-10 = 40px (main island)
    const dockHeight = 36; // dock container height
    const gap = 24; // gap to other elements

    switch (currentState) {
      case 'collapsed':
        return {
          isDockVisible: false,
          height: baseHeight,
          totalHeight: baseHeight + gap
        };
      case 'full-width':
        return {
          isDockVisible: false,
          height: baseHeight,
          totalHeight: baseHeight + gap
        };
      case 'full-width-dock':
        return {
          isDockVisible: true,
          height: baseHeight + dockHeight,
          totalHeight: baseHeight + dockHeight + gap
        };
      default:
        return {
          isDockVisible: false,
          height: baseHeight,
          totalHeight: baseHeight + gap
        };
    }
  }, []);

  // Notify parent immediately when state changes - only when actually changed
  useEffect(() => {
    if (prevStateRef.current !== state) {
      prevStateRef.current = state;
      const heightInfo = getHeightInfo(state);
      onStateChange?.(heightInfo);
    }
  }, [state, onStateChange, getHeightInfo]);

  // Determine if we should show compact mode
  // Only show compact mode when SmartBar is active AND there's no content opened
  const hasContentOpened = sphereWindowVisible || chatVisible || webViewVisible || selectedSphere;
  const isCompactMode = smartBarState !== 'collapsed' && !hasContentOpened;

  // Updated state logic with click-to-lock functionality
  useEffect(() => {
    if (isCompactMode) return;
    
    if (webViewVisible) {
      // Always keep DynamicIsland in full-width mode when webViewVisible
      if (isDockLocked || isSphereHovered || isDockHovered) {
        setState('full-width-dock');
      } else {
        setState('full-width');
      }
    } else if (isDockLocked || isSphereHovered || isDockHovered) {
      setState('full-width-dock');
    } else if (!sphereWindowVisible && !chatVisible && !webViewVisible) {
      setState('collapsed');
    } else if (state === 'full-width-dock' && !isDockLocked && !(isSphereHovered || isDockHovered)) {
      setState('collapsed');
    }
  }, [isDockLocked, isSphereHovered, isDockHovered, isCompactMode, sphereWindowVisible, chatVisible, webViewVisible, state]);

  // Handle sphere window closing - collapse if not hovering and chat/webview not visible (but only if not in compact mode)
  useEffect(() => {
    if (isCompactMode) {
      // In compact mode, don't change internal state
      return;
    }
    
    if (!sphereWindowVisible && !isHovering && !chatVisible && !webViewVisible && !isDockLocked && (state === 'full-width' || state === 'full-width-dock')) {
      setState('collapsed');
    }
  }, [sphereWindowVisible, isHovering, chatVisible, webViewVisible, isDockLocked, state, isCompactMode]);

  // Memoized event handlers - disabled in compact mode
  const handleMouseEnter = useCallback(() => {
    if (isCompactMode) return; // No hover behavior in compact mode
    
    setIsHovering(true);
    if (state === 'collapsed' && !chatVisible && !webViewVisible && !isDockLocked) {
      setState('full-width');
    }
  }, [state, chatVisible, webViewVisible, isDockLocked, isCompactMode]);

  const handleMouseLeave = useCallback(() => {
    if (isCompactMode) return; // No hover behavior in compact mode
    
    setIsHovering(false);
    // Only collapse if sphere window is not visible AND not in dock state AND chat/webview not visible AND dock not locked
    if (state === 'full-width' && !sphereWindowVisible && !chatVisible && !webViewVisible && !isDockLocked) {
      setState('collapsed');
    }
    // Don't collapse when in full-width-dock state or when chat/webview is visible or dock is locked
  }, [state, sphereWindowVisible, chatVisible, webViewVisible, isDockLocked, isCompactMode]);

  const handleSphereEnter = useCallback(() => {
    if (isCompactMode) return; // No hover behavior in compact mode
    
    if (!chatVisible && !webViewVisible) {
      setState('full-width-dock');
    }
  }, [chatVisible, webViewVisible, isCompactMode]);

  const handleSphereLeave = useCallback(() => {
    // Don't immediately collapse when leaving sphere - let dock container handle this
    // The dock should stay visible when moving from sphere to dock
  }, []);

  const handleDockContainerLeave = useCallback(() => {
    if (isCompactMode) return; // No hover behavior in compact mode
    
    // Only collapse if dock is not locked
    if (state === 'full-width-dock' && !sphereWindowVisible && !chatVisible && !webViewVisible && !isDockLocked) {
      setState('collapsed');
    }
  }, [state, sphereWindowVisible, chatVisible, webViewVisible, isDockLocked, isCompactMode]);

  const handleSphereClick = useCallback(() => {
    // Get the current sphere name - use selected sphere name or default to "Home"
    const sphereName = selectedSphere ? selectedSphere.name : 'Home';
    onSphereClick?.(sphereName);
  }, [selectedSphere, onSphereClick]);

  const handleChatClick = useCallback(() => {
    onChatClick?.();
  }, [onChatClick]);

  // New handler for dock toggle click
  const handleDockToggleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent sphere click
    setIsDockLocked(!isDockLocked);
  }, [isDockLocked]);

  // Get display text for the sphere
  const getSphereDisplayText = () => {
    if (selectedSphere) {
      return selectedSphere.name;
    }
    return displayTitle || 'Globe';
  };

  // Format URL for display
  const formatUrlDomain = (url: string) => {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  // Get current tab info
  const activeTab = webViewTabs.find(tab => tab.id === activeTabId);

  // Single container with morphing content
  return (
    <div 
      className={`flex flex-col items-center w-full transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
        shouldScaleDown && !isCompactMode ? 'scale-50' : 'scale-100'
      }`}
      style={{
        transformOrigin: 'center bottom',
        marginBottom: isCompactMode ? '9px' : '0px',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Dock Container - Only visible when not in compact mode */}
      {!isCompactMode && (
        <div 
          className={`
            transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]
            ${state === 'full-width-dock' 
              ? 'opacity-100 transform translate-y-0 w-full' 
              : 'opacity-0 transform translate-y-8 pointer-events-none overflow-hidden max-h-0 w-full'
            }
          `}
          onMouseEnter={() => setIsDockHovered(true)}
          onMouseLeave={() => setIsDockHovered(false)}
        >
          <div 
            className={`w-full self-stretch bg-[#f1f1f1]/70 shadow-[0px_-14px_44px_0px_rgba(0,0,0,0.03)] border-t-[0.50px] border-black/5 backdrop-blur-[50px] inline-flex justify-center items-center overflow-visible relative transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${webViewVisible ? (isDockHovered ? 'h-24' : 'h-9') : 'h-9'}`}
          >
            {webViewVisible ? (
              <div className="inline-flex justify-center items-center w-full h-full">
                {/* Tabs Container */}
                <div 
                  ref={tabsContainerRef}
                  className={`px-6 flex justify-center items-center transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] relative cursor-pointer h-full overflow-x-auto`}
                  style={{ 
                    overflow: 'visible',
                    zIndex: isDockHovered ? 10 : 1,
                    maxWidth: '100%',
                    width: '100%'
                  }}
                  onMouseEnter={() => {
                    setIsHovering(true);
                    onDockHoverChange?.(true);
                  }}
                  onMouseLeave={() => {
                    setIsHovering(false);
                    setHoveredTab(null);
                    setHoveredTabRect(null);
                    onDockHoverChange?.(false);
                  }}
                >
                  <div 
                    className="flex items-end justify-center overflow-visible" 
                    style={{ 
                      overflow: 'visible', 
                      height: isDockHovered ? '80px' : '20px',
                      minWidth: 'max-content',
                      paddingBottom: isDockHovered ? '12px' : '0px'
                    }}
                  >
                    {webViewTabs.map((tab, index) => {
                      const scale = getTabScale(index);
                      const spacing = getTabSpacing(index);
                      const isHovered = hoveredTab === tab.id;
                      const isLargest = scale >= 1.87;
                      const heightMultiplier = isDockHovered ? 3 : 1;
                      
                      return (
                        <div
                          key={tab.id}
                          ref={(el) => {
                            tabRefs.current[tab.id] = el;
                          }}
                          onClick={() => onTabSwitch?.(tab.id)}
                          onMouseEnter={(e) => handleTabMouseEnter(tab.id, e.currentTarget)}
                          className={`
                            flex items-center justify-center cursor-pointer
                            transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] relative group
                            ${activeTabId === tab.id 
                              ? 'bg-white border border-black/5' 
                              : 'bg-white/70 hover:bg-white/90'
                            }
                          `}
                          style={{
                            width: `${28 * scale * heightMultiplier}px`,
                            height: `${18 * scale * heightMultiplier}px`,
                            marginLeft: index === 0 ? '0px' : `${spacing}px`,
                            borderRadius: '3px',
                            transformOrigin: 'bottom center',
                            position: 'relative',
                            zIndex: isDockHovered ? Math.round(scale * 10) : 1
                          }}
                        >
                          {/* Tooltip - URLWidget style, positioned above tab */}
                          {hoveredTab === tab.id && (
                            <div 
                              className="absolute pointer-events-none"
                              style={{
                                bottom: '100%',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                marginBottom: '8px',
                                zIndex: 1000,
                              }}
                            >
                              <div style={{
                                paddingLeft: '8px',
                                paddingRight: '8px',
                                paddingTop: '2px',
                                paddingBottom: '2px',
                                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                                borderRadius: '8px',
                                backdropFilter: 'blur(50px)',
                                WebkitBackdropFilter: 'blur(50px)',
                                display: 'inline-flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '6px',
                                pointerEvents: 'none',
                              }}>
                                <div className="w-3 h-3 rounded-sm bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                  <Globe size={8} className="text-white" />
                                </div>
                                <div style={{
                                  textAlign: 'center',
                                  color: 'rgba(0, 0, 0, 0.4)',
                                  fontSize: '12px',
                                  fontWeight: '400',
                                  fontFamily: 'Neue Montreal, -apple-system, sans-serif',
                                  whiteSpace: 'nowrap',
                                }}>
                                  {tab.title || formatDomain(tab.url)}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Close Button - Only show for largest tab */}
                          {isLargest && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onTabClose?.(tab.id);
                              }}
                              className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-black/15 backdrop-blur-sm opacity-100 flex items-center justify-center hover:bg-black/25 transition-all duration-200 z-10"
                            >
                              <X size={8} className="text-white" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              // Regular App Controls
              <div className="flex justify-start items-center gap-3.5">
                <div className="px-4 border-l-[0.50px] border-r-[0.50px] border-black/5 flex justify-start items-center gap-3.5">
                  <div 
                    className="w-6 h-4 bg-gradient-to-b from-blue-500 to-blue-600 rounded-sm shadow-sm cursor-pointer hover:scale-105 transition-transform duration-200 flex items-center justify-center"
                    onClick={handleChatClick}
                  >
                    <MessageSquare size={10} className="text-white" />
                  </div>
                  <div className="w-6 h-4 bg-gradient-to-b from-gray-300 to-gray-400 rounded-sm shadow-sm cursor-pointer hover:scale-105 transition-transform duration-200 flex items-center justify-center">
                    <Folder size={10} className="text-white" />
                  </div>
                  <div className="w-6 h-4 bg-gradient-to-b from-green-500 to-green-600 rounded-sm shadow-sm cursor-pointer hover:scale-105 transition-transform duration-200 flex items-center justify-center">
                    <Calendar size={10} className="text-white" />
                  </div>
                  <div className="w-6 h-4 bg-gradient-to-b from-purple-500 to-purple-600 rounded-sm shadow-sm cursor-pointer hover:scale-105 transition-transform duration-200 flex items-center justify-center">
                    <Settings size={10} className="text-white" />
                  </div>
                  <div className="w-6 h-4 bg-gradient-to-b from-red-500 to-red-600 rounded-sm shadow-sm cursor-pointer hover:scale-105 transition-transform duration-200 flex items-center justify-center">
                    <Bell size={10} className="text-white" />
                  </div>
                  <div className="w-6 h-4 bg-gradient-to-b from-orange-500 to-orange-600 rounded-sm shadow-sm cursor-pointer hover:scale-105 transition-transform duration-200 flex items-center justify-center">
                    <Search size={10} className="text-white" />
                  </div>
                  <div className="w-6 h-4 bg-gradient-to-b from-indigo-500 to-indigo-600 rounded-sm shadow-sm cursor-pointer hover:scale-105 transition-transform duration-200 flex items-center justify-center">
                    <User size={10} className="text-white" />
                  </div>
                  <div className="w-6 h-4 bg-gradient-to-b from-pink-500 to-pink-600 rounded-sm shadow-sm cursor-pointer hover:scale-105 transition-transform duration-200 flex items-center justify-center">
                    <Command size={10} className="text-white" />
                  </div>
                  <div className="w-6 h-4 bg-gradient-to-b from-teal-500 to-teal-600 rounded-sm shadow-sm cursor-pointer hover:scale-105 transition-transform duration-200 flex items-center justify-center">
                    <Home size={10} className="text-white" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main morphing container */}
      <div 
        className={`
          bg-[#ccc]/50 
          shadow-[0px_-14px_44px_0px_rgba(0,0,0,0.03)] 
          backdrop-blur-[50px] 
          flex
          items-center 
          transition-all 
          duration-500
          ease-[cubic-bezier(0.25,0.1,0.25,1)]
          ${isCompactMode
            ? 'h-[18px] w-auto px-2 py-1.5 rounded-xl shadow-none justify-center' // Compact pill
            : state === 'collapsed' 
              ? 'h-10  px-3.5 rounded-tl-3xl rounded-tr-3xl border-t-[0.50px] border-black/0 shadow-[inset_0px_-4px_18px_0px_rgba(255,255,255,0.85)] justify-center' 
              : 'h-10 w-[calc(100vw-20px)] px-2.5 rounded-none border-t-[0.50px] border-black/5 shadow-[inset_0px_-4px_18px_0px_rgba(255,255,255,0.85)] justify-between'
          }
        `}
      >
        {isCompactMode ? (
          // Compact pill content
          <div className="inline-flex justify-start items-center gap-1.5">
            <div className="w-3 h-1.5 bg-[#d9d9d9]/90 rounded-[5px]" />
            <div className="w-12 h-1.5 bg-[#d9d9d9]/90 rounded-[5px]" />
            <div className="w-3 h-1.5 bg-[#d9d9d9]/90 rounded-[5px]" />
          </div>
        ) : (
          // Full DynamicIsland content
          <>
            {/* Left Section */}
            <div className={`
              flex justify-start items-center gap-1
              transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]
              ${state === 'collapsed' 
                ? 'opacity-0 w-0 overflow-hidden transform scale-x-0' 
                : 'opacity-100 w-[240px] transform scale-x-100'
              }
            `}>
              {webViewVisible ? (
                // Browser Navigation Controls
                <>
                  <div 
                    className="h-7 w-7 p-1.5 rounded-[10px] flex justify-center items-center hover:bg-black/[3.5%] cursor-pointer transition-all duration-200 ease-out"
                    onClick={onWebViewBack}
                  >
                    <ArrowLeft size={12} className="text-black/40" />
                  </div>
                  <div 
                    className="h-7 w-7 p-1.5 rounded-[10px] flex justify-center items-center hover:bg-black/[3.5%] cursor-pointer transition-all duration-200 ease-out"
                    onClick={onWebViewForward}
                  >
                    <ArrowRight size={12} className="text-black/40" />
                  </div>
                  <div 
                    className="h-7 w-7 p-1.5 rounded-[10px] flex justify-center items-center hover:bg-black/[3.5%] cursor-pointer transition-all duration-200 ease-out"
                    onClick={onWebViewRefresh}
                  >
                    <RotateCcw size={12} className="text-black/40" />
                  </div>
                  
                  {/* Favicon + URL Input */}
                  <div className="flex items-center gap-2 pl-2">
                    <div className="w-4 h-4 rounded-sm bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <Globe size={8} className="text-white" />
                    </div>
                    <input
                      type="text"
                      value={activeTab ? formatUrlDomain(activeTab.url) : (webViewUrl ? formatUrlDomain(webViewUrl) : 'Browser')}
                      onChange={(e) => onWebViewUrlChange?.(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const url = e.currentTarget.value;
                          onWebViewUrlChange?.(url);
                        }
                      }}
                      placeholder="Enter URL..."
                      className="text-black/70 text-xs font-medium w-[140px] bg-transparent border-none outline-none p-0"
                    />
                  </div>
                </>
              ) : (
                // Regular Controls
                <>
                  <div className="h-7 w-7 p-1.5 rounded-[10px] flex justify-center items-center gap-1.5 hover:bg-black/[3.5%] cursor-pointer transition-all duration-200 ease-out">
                    <Command size={14} className="text-black/40" />
                  </div>
                  <div className="h-7 w-7 p-1.5 rounded-[10px] flex justify-center items-center gap-1.5 hover:bg-black/[3.5%] cursor-pointer transition-all duration-200 ease-out">
                    <Search size={14} className="text-black/40" />
                  </div>
                  <div className="h-7 w-7 p-1.5 rounded-[10px] flex justify-center items-center gap-1.5 hover:bg-black/[3.5%] cursor-pointer transition-all duration-200 ease-out">
                    <Calendar size={14} className="text-black/40" />
                  </div>
                </>
              )}
            </div>

            {/* Center Section - Always Visible and Static */}
            <div className="flex justify-center items-center gap-3.5 flex-shrink-0">
              <div className="h-7 w-7 p-1.5 rounded-[10px] flex justify-center items-center hover:bg-black/[3.5%] cursor-pointer transition-colors duration-200 ease-out">
                <Command size={12} className="text-black/40" />
              </div>

              {/* Selected Sphere with Dock Toggle Button */}
              <div 
                className="h-7 px-3.5 py-2 border-l-[0.50px] border-r-[0.50px] border-black/10 flex justify-start items-center gap-3.5 transition-colors duration-200"
                onMouseEnter={() => setIsSphereHovered(true)}
                onMouseLeave={() => setIsSphereHovered(false)}
              >
                <div 
                  className="flex justify-start items-center pl-2 pr-2.5 py-1.5 gap-2 rounded-[10px] hover:bg-black/[3.5%] cursor-pointer"
                  onClick={handleSphereClick}
                >
                  <div className="w-5 h-5 bg-[#dddddd]/10 rounded-2xl shadow-[0px_0px_26.666667938232422px_0px_rgba(0,0,0,0.10)] shadow-[inset_2.6666667461395264px_-2.6666667461395264px_13.333333969116211px_0px_rgba(255,255,255,1.00)] shadow-[inset_-2.6666667461395264px_2.6666667461395264px_6.6666669845581055px_0px_rgba(0,0,0,0.10)] backdrop-blur-[33.33px]" />
                  <div className="text-black text-sm font-normal font-['Neue_Montreal'] flex items-center gap-1">
                    {getSphereDisplayText()}
                    {webViewVisible && webViewTabs.length > 0 && (
                      <span className="text-black/50 text-xs">
                        {webViewTabs.length}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Dock Toggle Button - Now using the existing Folder icon */}
              </div>
              
              <button
                onClick={handleDockToggleClick}
                className={`
                  h-7 w-7 p-1.5 rounded-[10px] flex justify-center items-center transition-all duration-200 ease-out cursor-pointer
                  ${isDockLocked 
                    ? 'bg-blue-500/20 text-blue-600 hover:bg-blue-500/30' 
                    : 'hover:bg-black/[3.5%] text-black/40 hover:text-black/60'
                  }
                `}
                title={isDockLocked ? "Dock locked (Click to unlock)" : "Click to lock dock"}
              >
                <Folder size={16} />
              </button>
            </div>

            {/* Right Section */}
            <div className={`
              flex justify-end items-center gap-1
              transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]
              ${state === 'collapsed' 
                ? 'opacity-0 w-0 overflow-hidden transform scale-x-0' 
                : 'opacity-100 w-[240px] transform scale-x-100'
              }
            `}>
              {webViewVisible ? (
                // Browser Action Controls
                <>
                  <div 
                    className="h-7 w-7 p-1.5 rounded-[10px] flex justify-center items-center hover:bg-black/[3.5%] cursor-pointer transition-all duration-200 ease-out"
                    onClick={onWebViewNewTab}
                  >
                    <Plus size={12} className="text-black/40" />
                  </div>
                  <div className="h-7 w-7 p-1.5 rounded-[10px] flex justify-center items-center hover:bg-black/[3.5%] cursor-pointer transition-all duration-200 ease-out">
                    <Bookmark size={12} className="text-black/40" />
                  </div>
                  <div className="h-7 w-7 p-1.5 rounded-[10px] flex justify-center items-center hover:bg-black/[3.5%] cursor-pointer transition-all duration-200 ease-out">
                    <Share size={12} className="text-black/40" />
                  </div>
                </>
              ) : (
                // Regular System Controls
                <>
                  <div className="h-7 w-7 p-1.5 rounded-[10px] flex justify-center items-center gap-1.5 hover:bg-black/[3.5%] cursor-pointer transition-all duration-200 ease-out">
                    <Wifi size={16} className="text-black/40" />
                  </div>
                  <div className="h-7 w-7 p-1.5 rounded-[10px] flex justify-center items-center gap-1.5 hover:bg-black/[3.5%] cursor-pointer transition-all duration-200 ease-out">
                    <Bluetooth size={14} className="text-black/40" />
                  </div>
                  <div className="h-7 w-7 p-1.5 rounded-[10px] flex justify-center items-center gap-1.5 hover:bg-black/[3.5%] cursor-pointer transition-all duration-200 ease-out">
                    <Volume2 size={12} className="text-black/40" />
                  </div>
                  <div className="h-7 w-7 p-1.5 rounded-[10px] flex justify-center items-center gap-1.5 hover:bg-black/[3.5%] cursor-pointer transition-all duration-200 ease-out">
                    <Battery size={14} className="text-black/40" />
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}