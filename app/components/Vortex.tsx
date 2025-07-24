'use client';

import { useState, useEffect, useCallback } from 'react';
import Globe3D from './Globe/Globe3D';
import DynamicIsland from './DynamicIsland';
import NavButtons from './NavButtons';
import SmartBar from './SmartBar';
import SphereWindow from './SphereWindow';
import InteractionDisplay from './InteractionDisplay';
import ChatView from './ChatView';
import WebView from './WebView';
import { WebViewProvider, WebViewTab } from '../context/WebViewContext';
import { DragDropProvider, DragOverlay, Toast, useFileDrop, useUrlDrop, DragItem, useDragDrop } from './DragDrop';
import { Download, Search, Wand2, Play, Network } from 'lucide-react';
import ActionToolbar from './ActionToolbar';
import AgentView from './AgentView';
import InteractionPreview from './InteractionPreview';
import InteractionTabs from './InteractionTabs';

interface DynamicIslandInfo {
  isDockVisible: boolean;
  height: number;
  totalHeight: number; // height + 24px gap
}

interface VortexProps {
  interactionDisplayVisible: boolean;
  onInteractionDisplayClose: () => void;
  onChatStateChange: (isVisible: boolean) => void;
  externalChatVisible: boolean;
  agentViewVisible: boolean;
  onAgentViewClose: () => void;
  onActionClick: (actionId: string) => void;
  hollowVortex?: boolean; // New prop
  displayTitle: string;
  interactionPreviewVisible?: boolean;
  onInteractionPreviewClose?: () => void;
  interactionPreviewText?: string;
  onSmartBarHover?: (isHovering: boolean) => void;
  smartBarState?: 'collapsed' | 'normal' | 'expanded';
  onSmartBarStateChange?: (state: 'collapsed' | 'normal' | 'expanded') => void;
  selectedNode?: { id: string; name: string } | null;
  onNodeClick?: (nodeId: string, nodeName: string) => void;
  onCloseOverlay?: () => void;
  onSphereWindowVisibleChange?: (visible: boolean) => void;
  isNodeSelected?: boolean;
  onWebViewStateChange?: (isVisible: boolean) => void;
  onPlusClick?: () => void;
  collectionUpdateTrigger?: number;
}

export default function Vortex(props: VortexProps) {
  // Remove the internal selectedNode state since we're using the external one
  const [globePosition, setGlobePosition] = useState<'center' | 'expanded'>('center');
  const [dynamicIslandInfo, setDynamicIslandInfo] = useState<DynamicIslandInfo>({
    isDockVisible: false,
    height: 44,
    totalHeight: 68 // 44 + 24
  });
  const [sphereWindowVisible, setSphereWindowVisible] = useState(false);
  const [sphereWindowName, setSphereWindowName] = useState('');
  const [smartBarState, setSmartBarState] = useState<'collapsed' | 'normal' | 'expanded'>('collapsed');
  const [isSmartBarHovered, setIsSmartBarHovered] = useState(false);
  const [isDockHovered, setIsDockHovered] = useState(false);
  const [newPopupVisible, setNewPopupVisible] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [chatOpening, setChatOpening] = useState(false);
  const [webViewVisible, setWebViewVisible] = useState(false);
  const [webViewOpening, setWebViewOpening] = useState(false);
  const [webViewUrl, setWebViewUrl] = useState('');
  
  // WebView tab management
  const [webViewTabs, setWebViewTabs] = useState<WebViewTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  
  // Drag and drop state
  const [toastVisible, setToastVisible] = useState(false);
  const [lastImportedFile, setLastImportedFile] = useState<string>('');
  const [importedItems, setImportedItems] = useState<DragItem[]>([]);

  // InteractionDisplay sheet state
  const [interactionDisplaySheetVisible, setInteractionDisplaySheetVisible] = useState(false);

  // Sync external chat state with internal state
  useEffect(() => {
    if (props.externalChatVisible !== undefined && props.externalChatVisible !== chatVisible) {
      if (props.externalChatVisible) {
        setChatOpening(true);
        setChatVisible(true);
        setTimeout(() => {
          setChatOpening(false);
        }, 500);
      } else {
        setChatVisible(false);
        setChatOpening(false);
      }
    }
  }, [props.externalChatVisible]);

  // Memoized event handlers to prevent infinite re-renders
  const handleFileDrop = useCallback((item: DragItem, zone: 'globe' | 'canvas') => {
    console.log('File dropped:', item, 'in zone:', zone);
    setImportedItems(prev => [...prev, item]);
    setLastImportedFile(item.name);
    setToastVisible(true);
  }, []);

  const handleUndo = useCallback(() => {
    setImportedItems(prev => prev.slice(0, -1));
    setToastVisible(false);
  }, []);

  const handleToastDismiss = useCallback(() => {
    setToastVisible(false);
  }, []);

  // ESC key handling with priority: InteractionDisplay > NewPopup > SphereWindow > ChatView > WebView > Grid Overlay
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Priority: InteractionPreview first, then InteractionDisplay, then NewPopup, then SphereWindow, then ChatView, then WebView, then SmartBar, then Grid Overlay
        // Only close ONE thing per ESC press
        if (props.interactionPreviewVisible) {
          props.onInteractionPreviewClose?.();
          return;
        }
        
        if (props.interactionDisplayVisible) {
          props.onInteractionDisplayClose();
          return;
        }
        
        if (newPopupVisible) {
          setNewPopupVisible(false);
          return;
        }
        
        if (sphereWindowVisible) {
          setSphereWindowVisible(false);
          return;
        }
        
        if (chatVisible) {
          handleChatClose();
          return;
        }
        
        if (webViewVisible) {
          handleWebViewClose();
          return;
        }
        
        // Check if SmartBar is not collapsed (give it priority over closing overlays)
        if (smartBarState !== 'collapsed') {
          setSmartBarState('collapsed');
          return;
        }
        
        // Then handle closing overlays
        if (props.selectedNode) {
          props.onCloseOverlay?.();
          return;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [props.interactionPreviewVisible, props.onInteractionPreviewClose, props.interactionDisplayVisible, newPopupVisible, chatVisible, webViewVisible, sphereWindowVisible, smartBarState, props.selectedNode, props.onInteractionDisplayClose, props.onNodeClick]);

  // Keyboard shortcuts for opening New popup (Cmd+T and Shift+N)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd+T or Ctrl+T
      if ((event.metaKey || event.ctrlKey) && event.key === 't') {
        event.preventDefault();
        event.stopPropagation();
        setNewPopupVisible(true);
      }
      // Shift+N
      if (event.shiftKey && event.key === 'N') {
        event.preventDefault();
        event.stopPropagation();
        setNewPopupVisible(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Keyboard shortcut for toggling InteractionDisplay sheet (Shift+D)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.shiftKey && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        setInteractionDisplaySheetVisible(v => !v);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNodeClick = useCallback((nodeId: string, nodeName: string) => {
    props.onNodeClick?.(nodeId, nodeName);
  }, [props.onNodeClick]);

  const handleCloseOverlay = useCallback(() => {
    props.onCloseOverlay?.();
  }, [props.onCloseOverlay]);

  const handleDynamicIslandStateChange = useCallback((info: DynamicIslandInfo) => {
    setDynamicIslandInfo(info);
  }, []);

  const handleSphereClick = useCallback((sphereName: string) => {
    setSphereWindowName(sphereName);
    setSphereWindowVisible(prev => !prev); // Toggle visibility
  }, []);

  const handleSphereWindowClose = useCallback(() => {
    setSphereWindowVisible(false);
  }, []);

  const handleSmartBarStateChange = useCallback((state: 'collapsed' | 'normal' | 'expanded') => {
    setSmartBarState(state);
  }, []);

  const handleSmartBarHoverChange = useCallback((isHovering: boolean) => {
    setIsSmartBarHovered(isHovering);
  }, []);

  const handleDockHoverChange = useCallback((isHovering: boolean) => {
    setIsDockHovered(isHovering);
  }, []);

  const handlePlusClick = useCallback(() => {
    if (props.onPlusClick) {
      props.onPlusClick();
    } else {
      setNewPopupVisible(true);
    }
  }, [props]);

  const handleNewPopupClose = useCallback(() => {
    setNewPopupVisible(false);
  }, []);

  const handleChatClick = useCallback(() => {
    setChatOpening(true);
    setChatVisible(true);
    props.onChatStateChange?.(true);
    
    // Reset opening state after animation completes
    setTimeout(() => {
      setChatOpening(false);
    }, 500); // Match the animation duration
  }, [props.onChatStateChange]);

  const handleChatClose = useCallback(() => {
    setChatVisible(false);
    setChatOpening(false);
    props.onChatStateChange?.(false);
  }, [props.onChatStateChange]);

  // Helper function to generate tab ID
  const generateTabId = useCallback(() => {
    return `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Helper function to format domain from URL
  const formatDomain = useCallback((url: string) => {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url;
    }
  }, []);

  const handleWebViewOpen = useCallback((url: string) => {
    // Create a new tab
    const newTabId = generateTabId();
    const newTab: WebViewTab = {
      id: newTabId,
      url: url,
      title: formatDomain(url),
      favicon: undefined // Could be populated later
    };

    setWebViewTabs(prev => [...prev, newTab]);
    setActiveTabId(newTabId);
    setWebViewUrl(url);
    setWebViewOpening(true);
    setWebViewVisible(true);
    
    // Reset opening state after animation completes
    setTimeout(() => {
      setWebViewOpening(false);
    }, 500);
  }, [generateTabId, formatDomain]);

  const handleWebViewClose = useCallback(() => {
    setWebViewVisible(false);
    setWebViewOpening(false);
    // Keep tabs but clear active state
    setActiveTabId(null);
  }, []);

  const handleWebViewBack = useCallback(() => {
    // This will be handled by the WebView component internally
    console.log('WebView: Going back');
  }, []);

  const handleWebViewForward = useCallback(() => {
    // This will be handled by the WebView component internally
    console.log('WebView: Going forward');
  }, []);

  const handleWebViewRefresh = useCallback(() => {
    // This will be handled by the WebView component internally
    console.log('WebView: Refreshing');
  }, []);

  const handleWebViewNewTab = useCallback(() => {
    // Create a new empty tab
    const newTabId = generateTabId();
    const newTab: WebViewTab = {
      id: newTabId,
      url: 'https://www.google.com',
      title: 'New Tab',
      favicon: undefined
    };

    setWebViewTabs(prev => [...prev, newTab]);
    setActiveTabId(newTabId);
    setWebViewUrl(newTab.url);

    // If WebView is not visible, open it
    if (!webViewVisible) {
      setWebViewOpening(true);
      setWebViewVisible(true);
      setTimeout(() => {
        setWebViewOpening(false);
      }, 500);
    }
  }, [generateTabId, webViewVisible]);

  const handleTabClose = useCallback((tabId: string) => {
    setWebViewTabs(prev => {
      const newTabs = prev.filter(tab => tab.id !== tabId);
      
      // If closing the active tab, switch to another tab or close WebView
      if (tabId === activeTabId) {
        if (newTabs.length > 0) {
          // Switch to the last remaining tab
          const newActiveTab = newTabs[newTabs.length - 1];
          setActiveTabId(newActiveTab.id);
          setWebViewUrl(newActiveTab.url);
        } else {
          // No tabs left, close WebView
          setActiveTabId(null);
          setWebViewVisible(false);
          setWebViewOpening(false);
        }
      }
      
      return newTabs;
    });
  }, [activeTabId]);

  const handleTabSwitch = useCallback((tabId: string) => {
    const tab = webViewTabs.find(t => t.id === tabId);
    if (tab) {
      setActiveTabId(tabId);
      setWebViewUrl(tab.url);
      
      // If WebView is not visible, open it
      if (!webViewVisible) {
        setWebViewOpening(true);
        setWebViewVisible(true);
        setTimeout(() => {
          setWebViewOpening(false);
        }, 500);
      }
    }
  }, [webViewTabs, webViewVisible]);

  const handleWebViewUrlChange = (url: string) => {
    if (!activeTabId || !webViewTabs.length) return;
    
    // Format URL if needed (add https:// if not present)
    let formattedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      formattedUrl = `https://${url}`;
    }
    
    // Update the active tab's URL
    const updatedTabs = webViewTabs.map(tab => 
      tab.id === activeTabId 
        ? { ...tab, url: formattedUrl }
        : tab
    );
    
    setWebViewTabs(updatedTabs);
    setWebViewUrl(formattedUrl);
  };

  // Determine if SmartBar should cause DynamicIsland to scale down
  // Only scale down when DynamicIsland is in collapsed state (no chat, no sphere window, no webview, no selected node)
  const shouldScaleDownDynamicIsland = (smartBarState !== 'collapsed' || isSmartBarHovered) && 
                                       !chatVisible && 
                                       !sphereWindowVisible && 
                                       !webViewVisible &&
                                       !props.selectedNode;

  // Handle globe position toggle
  const handleGlobeClick = useCallback((e: React.MouseEvent) => {
    // Only toggle if clicking the globe container itself, not its children
    if (e.target === e.currentTarget) {
      setGlobePosition(prev => prev === 'center' ? 'expanded' : 'center');
    }
  }, []);

  // In Vortex, when SphereWindow is opened/closed, call the new prop
  useEffect(() => {
    if (props.onSphereWindowVisibleChange) {
      props.onSphereWindowVisibleChange(sphereWindowVisible);
    }
  }, [sphereWindowVisible, props.onSphereWindowVisibleChange]);

  // Notify parent when webViewVisible changes
  useEffect(() => {
    if (props.onWebViewStateChange) {
      props.onWebViewStateChange(webViewVisible);
    }
  }, [webViewVisible, props.onWebViewStateChange]);

  return (
    <DragDropProvider onFileDrop={handleFileDrop}>
      <WebViewProvider 
        onWebViewOpen={handleWebViewOpen}
        onWebViewBack={handleWebViewBack}
        onWebViewForward={handleWebViewForward}
        onWebViewRefresh={handleWebViewRefresh}
        onWebViewNewTab={handleWebViewNewTab}
        onTabClose={handleTabClose}
        onTabSwitch={handleTabSwitch}
        tabs={webViewTabs}
        activeTabId={activeTabId}
      >
        <VortexContent 
          selectedNode={props.selectedNode || null}
          dynamicIslandInfo={dynamicIslandInfo}
          sphereWindowVisible={sphereWindowVisible}
          sphereWindowName={sphereWindowName}
          smartBarState={smartBarState}
          isSmartBarHovered={isSmartBarHovered}
          isDockHovered={isDockHovered}
          newPopupVisible={newPopupVisible}
          chatVisible={chatVisible}
          chatOpening={chatOpening}
          webViewVisible={webViewVisible}
          webViewOpening={webViewOpening}
          webViewUrl={webViewUrl}
          webViewTabs={webViewTabs}
          activeTabId={activeTabId}
          interactionDisplayVisible={props.interactionDisplayVisible}
          shouldScaleDownDynamicIsland={shouldScaleDownDynamicIsland}
          globePosition={globePosition}
          onGlobeClick={handleGlobeClick}
          onNodeClick={handleNodeClick}
          onCloseOverlay={handleCloseOverlay}
          onDynamicIslandStateChange={handleDynamicIslandStateChange}
          onSphereClick={handleSphereClick}
          onSphereWindowClose={handleSphereWindowClose}
          onSmartBarStateChange={handleSmartBarStateChange}
          onSmartBarHoverChange={handleSmartBarHoverChange}
          onDockHoverChange={handleDockHoverChange}
          onPlusClick={handlePlusClick}
          onNewPopupClose={handleNewPopupClose}
          onChatClick={handleChatClick}
          onChatClose={handleChatClose}
          onWebViewOpen={handleWebViewOpen}
          onWebViewClose={handleWebViewClose}
          onWebViewBack={handleWebViewBack}
          onWebViewForward={handleWebViewForward}
          onWebViewRefresh={handleWebViewRefresh}
          onWebViewNewTab={handleWebViewNewTab}
          onTabClose={handleTabClose}
          onTabSwitch={handleTabSwitch}
          onInteractionDisplayClose={props.onInteractionDisplayClose}
          onWebViewUrlChange={handleWebViewUrlChange}
          setGlobePosition={setGlobePosition}
          agentViewVisible={props.agentViewVisible}
          onAgentViewClose={props.onAgentViewClose}
          onActionClick={props.onActionClick}
          hollowVortex={props.hollowVortex}
          displayTitle={props.displayTitle}
          interactionPreviewVisible={props.interactionPreviewVisible}
          onInteractionPreviewClose={props.onInteractionPreviewClose}
          interactionPreviewText={props.interactionPreviewText}
          onSmartBarHover={props.onSmartBarHover}
          interactionDisplaySheetVisible={interactionDisplaySheetVisible}
          onInteractionDisplaySheetClose={() => setInteractionDisplaySheetVisible(false)}
          isNodeSelected={props.isNodeSelected}
          collectionUpdateTrigger={props.collectionUpdateTrigger}
        />
        
        {/* Drag overlay - highest z-index */}
        {/* <DragOverlay /> */}
        
        {/* Toast notification */}
        <Toast
          isVisible={toastVisible}
          fileName={lastImportedFile}
          onUndo={handleUndo}
          onDismiss={handleToastDismiss}
        />
      </WebViewProvider>
    </DragDropProvider>
  );
}

// Separate the content into its own component to use hooks inside the provider
const VortexContent: React.FC<{
  selectedNode: { id: string; name: string } | null;
  dynamicIslandInfo: DynamicIslandInfo;
  sphereWindowVisible: boolean;
  sphereWindowName: string;
  smartBarState: 'collapsed' | 'normal' | 'expanded';
  isSmartBarHovered: boolean;
  isDockHovered: boolean;
  newPopupVisible: boolean;
  chatVisible: boolean;
  chatOpening: boolean;
  webViewVisible: boolean;
  webViewOpening: boolean;
  webViewUrl: string;
  webViewTabs: WebViewTab[];
  activeTabId: string | null;
  interactionDisplayVisible: boolean;
  shouldScaleDownDynamicIsland: boolean;
  globePosition: 'center' | 'expanded';
  agentViewVisible: boolean;
  onGlobeClick: (e: React.MouseEvent) => void;
  onNodeClick: (nodeId: string, nodeName: string) => void;
  onCloseOverlay: () => void;
  onDynamicIslandStateChange: (info: DynamicIslandInfo) => void;
  onSphereClick: (sphereName: string) => void;
  onSphereWindowClose: () => void;
  onSmartBarStateChange: (state: 'collapsed' | 'normal' | 'expanded') => void;
  onSmartBarHoverChange: (isHovering: boolean) => void;
  onDockHoverChange: (isHovering: boolean) => void;
  onPlusClick: () => void;
  onNewPopupClose: () => void;
  onChatClick: () => void;
  onChatClose: () => void;
  onWebViewOpen: (url: string) => void;
  onWebViewClose: () => void;
  onWebViewBack: () => void;
  onWebViewForward: () => void;
  onWebViewRefresh: () => void;
  onWebViewNewTab: () => void;
  onTabClose: (tabId: string) => void;
  onTabSwitch: (tabId: string) => void;
  onInteractionDisplayClose: () => void;
  onWebViewUrlChange: (url: string) => void;
  setGlobePosition: (position: 'center' | 'expanded') => void;
  onAgentViewClose?: () => void;
  onActionClick?: (actionId: string) => void;
  hollowVortex?: boolean;
  displayTitle: string;
  interactionPreviewVisible?: boolean;
  onInteractionPreviewClose?: () => void;
  interactionPreviewText?: string;
  onSmartBarHover?: (isHovering: boolean) => void;
  interactionDisplaySheetVisible: boolean;
  onInteractionDisplaySheetClose: () => void;
  isNodeSelected?: boolean;
  collectionUpdateTrigger?: number;
}> = (props) => {
  // Initialize drag and drop hooks
  useFileDrop();
  useUrlDrop();
  
  // Get global drag state for enhanced visual feedback
  const { isDragging } = useDragDrop();

  return (
    <div className={`overflow-hidden w-full h-full relative rounded-lg transition-all duration-700 ${
      props.hollowVortex
        ? 'bg-[#ddd]/10 shadow-[0px_0px_4px_0px_rgba(255,255,255,0.95)] shadow-[inset_0px_0px_26px_0px_rgba(0,0,0,0.1)] backdrop-blur-[100px]'
        : 'bg-white/90 shadow-[0px_8px_20px_0px_rgba(0,0,0,0.175)] backdrop-blur-[200px]'
    }`}>

      {/* Globe container - slides down only when agent view is visible, stays in place for interaction preview */}
      <div 
        className={`
          w-full h-full relative transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]
          ${(props.agentViewVisible || (props.interactionPreviewVisible && !props.isNodeSelected)) ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}
        `}
      >
        {/* Action buttons - visible when globe is expanded */}
        <ActionToolbar 
          isVisible={props.globePosition === 'expanded'}
          className="absolute left-1/2 top-[32.5%] -translate-x-1/2 z-[200]"
          onActionClick={props.onActionClick}
        />

        {/* 3D Globe in the center - Background layer (z-[100]) */}
        <div className="absolute inset-0 z-[100] flex items-center justify-center">
          <Globe3D
            selectedNode={props.selectedNode}
            onNodeClick={props.onNodeClick}
            onCloseOverlay={props.onCloseOverlay}
            newPopupVisible={props.newPopupVisible}
            key={props.collectionUpdateTrigger}
          />
        </div>
      </div>

      {/* Agent View - slides down from above */}
      <div 
        className={`
          absolute inset-0 w-full h-full transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]
          ${props.agentViewVisible 
            ? 'translate-y-0 opacity-100 pointer-events-auto' 
            : '-translate-y-full opacity-0 pointer-events-none'
          }
        `}
      >
        <AgentView 
          isVisible={props.agentViewVisible}
          onClose={props.onAgentViewClose || (() => {})}
          onActionClick={props.onActionClick}
        />
      </div>

      {/* InteractionPreview - slides down from above, same as AgentView */}
      <div 
        className={`
          absolute inset-0 w-full h-full transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]
          ${(props.interactionPreviewVisible || false)
            ? 'translate-y-0 opacity-100 pointer-events-auto' 
            : '-translate-y-full opacity-0 pointer-events-none'
          }
        `}
      >
        <InteractionPreview
          isVisible={props.interactionPreviewVisible || false}
          onClose={props.onInteractionPreviewClose || (() => {})}
          onActionClick={props.onActionClick}
          previewText={props.interactionPreviewText || ''}
          isNodeSelected={props.isNodeSelected}
        />
      </div>

      {/* ChatView - Above Globe but below overlays (z-[400]) */}
      <div className={`absolute inset-0 z-[400] ${props.chatVisible ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <ChatView 
          isVisible={props.chatVisible}
          onClose={props.onChatClose}
          isOpening={props.chatOpening}
        />
      </div>

      {/* WebView - Above ChatView but below SphereWindow (z-[425]) */}
      <div className={`absolute inset-0 z-[425] ${props.webViewVisible ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <WebView 
          isVisible={props.webViewVisible}
          onClose={props.onWebViewClose}
          initialUrl={props.webViewUrl}
          isOpening={props.webViewOpening}
        />
      </div>

      {/* SphereWindow - Above chat but below interaction displays (z-[500]) */}
      <div className={`absolute inset-0 z-[500] ${props.sphereWindowVisible ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <SphereWindow 
          isVisible={props.sphereWindowVisible}
          sphereName={props.sphereWindowName}
          onClose={props.onSphereWindowClose}
        />
      </div>

      {/* InteractionDisplay - Above sphere window but below fixed elements (z-[550]) */}
      <div className={`absolute inset-0 z-[550] ${props.interactionDisplaySheetVisible ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div className="relative w-full h-full">
          <InteractionDisplay 
            isVisible={props.interactionDisplaySheetVisible}
            onClose={props.onInteractionDisplaySheetClose}
          />
        </div>
      </div>

      {/* Fixed bar at the bottom with NavButtons and SmartBar - Above all content (z-[800]) */}
      <div 
        className="z-[800] absolute left-1/2 -translate-x-1/2 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
        style={{
          bottom: props.interactionDisplaySheetVisible
            ? '14px'
            : `${(props.dynamicIslandInfo.totalHeight - 10) * (props.shouldScaleDownDynamicIsland ? 0.6 : 1)}px`
        }}
      >
        <div className="inline-flex flex-col justify-start items-center gap-3.5">
          {/* Show InteractionTabs when InteractionPreview is visible OR when a node is selected AND SmartBar is not collapsed, otherwise show NavButtons */}
          {(!props.interactionDisplaySheetVisible && (props.interactionPreviewVisible || (props.selectedNode && props.smartBarState !== 'collapsed'))) ? (
            <InteractionTabs
              isVisible={props.interactionPreviewVisible || (!!props.selectedNode && props.smartBarState !== 'collapsed')}
              onActionClick={props.onActionClick}
            />
          ) : null}
          {(!props.interactionDisplaySheetVisible && !(props.interactionPreviewVisible || (props.selectedNode && props.smartBarState !== 'collapsed'))) ? (
            <NavButtons
              isVisible={props.smartBarState === 'collapsed' && !props.agentViewVisible && !props.sphereWindowVisible && !props.interactionDisplayVisible && !props.newPopupVisible && !props.chatVisible && !props.webViewVisible && !props.interactionDisplaySheetVisible} 
              onPlusClick={props.onPlusClick}
            />
          ) : null}
          <SmartBar 
            onStateChange={props.onSmartBarStateChange} 
            onHoverChange={props.onSmartBarHoverChange}
            forceHidden={props.isDockHovered}
            onHover={props.onSmartBarHover}
            interactionPreviewVisible={props.interactionPreviewVisible}
          />
        </div>
      </div>

      {/* Separate fixed DynamicIsland at the very bottom - Highest z-index (z-[900]) */}
      {!props.interactionDisplaySheetVisible && (
        <div className="absolute bottom-[0px] left-[0px] right-[0px] z-[900] flex justify-center">
          <DynamicIsland 
            onStateChange={props.onDynamicIslandStateChange}
            onSphereClick={props.onSphereClick}
            onChatClick={props.onChatClick}
            selectedSphere={props.selectedNode}
            sphereWindowVisible={props.sphereWindowVisible}
            shouldScaleDown={props.shouldScaleDownDynamicIsland}
            chatVisible={props.chatVisible}
            webViewVisible={props.webViewVisible}
            webViewUrl={props.webViewUrl}
            onWebViewBack={props.onWebViewBack}
            onWebViewForward={props.onWebViewForward}
            onWebViewRefresh={props.onWebViewRefresh}
            onWebViewNewTab={props.onWebViewNewTab}
            smartBarState={props.smartBarState}
            webViewTabs={props.webViewTabs}
            activeTabId={props.activeTabId}
            onTabClose={props.onTabClose}
            onTabSwitch={props.onTabSwitch}
            onDockHoverChange={props.onDockHoverChange}
            onWebViewUrlChange={props.onWebViewUrlChange}
            displayTitle={props.displayTitle}
          />
        </div>
      )}
    </div>
  );
}; 