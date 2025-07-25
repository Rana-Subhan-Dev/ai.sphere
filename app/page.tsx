'use client';

import { useState, useCallback, useEffect } from 'react';
import Vortex from './components/Vortex';
import OnboardingFlow from './components/OnboardingFlow';
import AgentIcon from './components/AgentIcon';
import UploadModal from './components/UploadModal';
import { AnimatePresence } from 'framer-motion';
import { useRef } from 'react';
import ControlPanel from './components/NewPopup';
import { LogOut } from 'lucide-react';
import { getAuthData } from '../lib/api';

// Define a type for all the cases that can trigger hollow vortex
type HollowVortexTrigger = 
  | { type: 'AGENT_VIEW' }
  | { type: 'CHAT_EXPANDED' }
  | { type: 'GLOBE_EXPANDED' }
  | { type: 'CUSTOM', value: boolean }
  | { type: 'INTERACTION_PREVIEW' };

export default function Home() {
  const [isHovered, setIsHovered] = useState(false);
  const [interactionDisplayVisible, setInteractionDisplayVisible] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [webViewVisible, setWebViewVisible] = useState(false); // <-- Add this
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [agentViewVisible, setAgentViewVisible] = useState(false);
  const [hollowVortex, setHollowVortex] = useState(false);
  const [displayTitle, setDisplayTitle] = useState('Globe');
  const [interactionPreviewVisible, setInteractionPreviewVisible] = useState(false);
  const [interactionPreviewText, setInteractionPreviewText] = useState('');
  const [smartBarState, setSmartBarState] = useState<'collapsed' | 'normal' | 'expanded'>('collapsed');
  const [selectedNode, setSelectedNode] = useState<{ id: string; name: string } | null>(null);
  const [controlPanelVisible, setControlPanelVisible] = useState(false);
  const [controlPanelTab, setControlPanelTab] = useState('new');
  const [sphereWindowVisible, setSphereWindowVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [collectionUpdateTrigger, setCollectionUpdateTrigger] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status
  useEffect(() => {
    const authData = getAuthData();
    setIsAuthenticated(!!authData?.accessToken);
  }, [onboardingComplete]);

  // Centralized hollow vortex state management
  const updateHollowVortex = useCallback((trigger: HollowVortexTrigger) => {
    switch (trigger.type) {
      case 'AGENT_VIEW':
      case 'INTERACTION_PREVIEW':
        setHollowVortex(true);
        break;
      case 'CHAT_EXPANDED':
        setHollowVortex(true);
        break;
      case 'GLOBE_EXPANDED':
        setHollowVortex(true);
        break;
      case 'CUSTOM':
        setHollowVortex(trigger.value);
        break;
    }
  }, []);

  const handleAgentClick = useCallback(() => {
    setAgentViewVisible(true);
    updateHollowVortex({ type: 'AGENT_VIEW' });
    setDisplayTitle('Ayris');
  }, [updateHollowVortex]);

  const handleAgentViewClose = useCallback(() => {
    setAgentViewVisible(false);
    updateHollowVortex({ type: 'CUSTOM', value: false });
    setDisplayTitle('Globe');
  }, [updateHollowVortex]);

  const handleInteractionPreview = useCallback((text: string) => {
    // Only allow InteractionPreview when no node is selected (globe is visible)
    if (selectedNode !== null) {
      console.log('Cannot show InteractionPreview when a node is selected');
      return;
    }
    
    setInteractionPreviewVisible(true);
    setInteractionPreviewText(text);
    updateHollowVortex({ type: 'INTERACTION_PREVIEW' });
    setDisplayTitle('Preview');
    // Also expand SmartBar to normal state
    setSmartBarState('normal');
  }, [updateHollowVortex, selectedNode]);

  const handleInteractionPreviewClose = useCallback(() => {
    setInteractionPreviewVisible(false);
    setInteractionPreviewText('');
    updateHollowVortex({ type: 'CUSTOM', value: false });
    setDisplayTitle('Globe');
  }, [updateHollowVortex]);

  const handleActionClick = useCallback((actionId: string) => {
    console.log(`Action clicked: ${actionId}`);
    if (actionId === 'upload' || actionId === 'plus') {
      setUploadModalVisible(true);
    }
  }, []);

  const handleInteractionDisplayClose = useCallback(() => {
    setInteractionDisplayVisible(false);
  }, []);

  const handleChatStateChange = useCallback((isVisible: boolean) => {
    setChatVisible(isVisible);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    setOnboardingComplete(true);
  }, []);

  // Handler for Vortex to notify when web view is opened/closed
  const handleWebViewStateChange = useCallback((isVisible: boolean) => {
    setWebViewVisible(isVisible);
  }, []);

  const handleUploadSuccess = useCallback(() => {
    // Trigger collection data refresh
    setCollectionUpdateTrigger(prev => prev + 1);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('airis_auth');
    setIsAuthenticated(false);
    setOnboardingComplete(false);
    // Reset all states
    setAgentViewVisible(false);
    setHollowVortex(false);
    setDisplayTitle('Globe');
    setInteractionPreviewVisible(false);
    setSelectedNode(null);
    setControlPanelVisible(false);
    setSphereWindowVisible(false);
    setUploadModalVisible(false);
  }, []);

  // Developer helper: Reset onboarding with Cmd+Shift+R
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'R') {
        event.preventDefault();
        setOnboardingComplete(false);
        console.log('Onboarding reset for testing');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Handle spacebar press - separate from onboarding reset handler
  useEffect(() => {
    const handleSpaceBar = (event: KeyboardEvent) => {
      console.log('Space bar pressed', {
        onboardingComplete,
        interactionPreviewVisible,
        agentViewVisible,
        selectedNode,
        target: event.target
      });

      // Only trigger if not in any input field and onboarding is complete
      if (!onboardingComplete) {
        console.log('Onboarding not complete');
        return;
      }

      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement ||
          event.target instanceof HTMLSelectElement) {
        console.log('In input field, ignoring');
        return;
      }

      // Only allow when no node is selected (globe is visible)
      if (selectedNode !== null) {
        console.log('Node selected, cannot show InteractionPreview');
        return;
      }

      if (event.code === 'Space' && !interactionPreviewVisible && !agentViewVisible) {
        console.log('Triggering interaction preview');
        event.preventDefault();
        event.stopPropagation();
        handleInteractionPreview('What would you like to do?');
      }
    };

    document.addEventListener('keydown', handleSpaceBar, true);
    return () => {
      document.removeEventListener('keydown', handleSpaceBar, true);
    };
  }, [onboardingComplete, interactionPreviewVisible, agentViewVisible, selectedNode, handleInteractionPreview]);



  // Handle SmartBar hover
  const handleSmartBarHover = useCallback((isHovering: boolean) => {
    // Commented out: Only space bar should trigger InteractionPreview
    // if (isHovering && !interactionPreviewVisible && !agentViewVisible && selectedNode === null) {
    //   handleInteractionPreview('What would you like to do?');
    // }
  }, [interactionPreviewVisible, agentViewVisible, selectedNode, handleInteractionPreview]);

  // Handle node selection from Vortex
  const handleNodeClick = useCallback((nodeId: string, nodeName: string) => {
    setSelectedNode({ id: nodeId, name: nodeName });
  }, []);

  const handleCloseOverlay = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Global shortcut handler for opening ControlPanel with correct tab
  useEffect(() => {
    const handleGlobalShortcut = (event: KeyboardEvent) => {
      if (controlPanelVisible) return;
      if (event.shiftKey) {
        if (event.key.toLowerCase() === 'n') {
          setControlPanelTab('new');
          setControlPanelVisible(true);
        }
        if (event.key.toLowerCase() === 't') {
          setControlPanelTab('web');
          setControlPanelVisible(true);
        }
        if (event.key.toLowerCase() === 'i') {
          setControlPanelTab('feed');
          setControlPanelVisible(true);
        }
        if (event.key.toLowerCase() === 'f') {
          setControlPanelTab('spotlight');
          setControlPanelVisible(true);
        }
        if (event.key.toLowerCase() === 'p') {
          setControlPanelTab('settings');
          setControlPanelVisible(true);
        }
      }
    };
    document.addEventListener('keydown', handleGlobalShortcut);
    return () => document.removeEventListener('keydown', handleGlobalShortcut);
  }, [controlPanelVisible]);

  return (
    <div style={{ padding: '0px', height: '100vh', width: '100vw' }} className="relative bg-[#f5f5f5]">
      <div className="w-full h-full flex flex-col justify-between items-center">
        <div 
          className="w-full h-12 p-2.5 flex justify-between items-center"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
            <div className='w-7 h-7 bg-black/10 rounded-full inline-flex justify-center items-center'/>
            
            {/* Logout button - top right */}
            {isAuthenticated && onboardingComplete && (
              <button
                onClick={handleLogout}
                className="w-7 h-7 bg-black/10 hover:bg-black/20 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5 text-black/40" />
              </button>
            )}
            
            {!isAuthenticated && (
              <div className='w-7 h-7 bg-black/10 rounded-full inline-flex justify-center items-center'/>
            )}
        </div>

        {onboardingComplete && (
          <div className="h-2.5 flex justify-center items-center gap-1.5">
              <div className='w-1.5 h-1.5 bg-black/10 rounded-full inline-flex justify-center items-center'/>
              <div className='w-1.5 h-1.5 bg-white/80 rounded-full inline-flex justify-center items-center'/>
              <div className='w-1.5 h-1.5 bg-black/10 rounded-full inline-flex justify-center items-center'/>
          </div>
        )}
      </div>

      {/* Agent Icon - positioned at page level - only show after onboarding */}
      {onboardingComplete && !agentViewVisible && (
        <AgentIcon 
          layoutId="main-agent-icon"
          onClick={handleAgentClick}
          isMinimized={chatVisible || webViewVisible || sphereWindowVisible}
          className="fixed left-1/2 transform -translate-x-1/2 z-[700]"
          style={{
            top: (chatVisible || webViewVisible || sphereWindowVisible) ? '2px' : '28px',
          }}
        />
      )}
      
      <div className={`z-[2] absolute ${isHovered ? 'top-12' : 'top-2.5'} left-2.5 right-2.5 bottom-2.5 flex justify-center items-center transition-all duration-300 ease-in-out`}>
        {onboardingComplete ? (
          <Vortex 
            interactionDisplayVisible={interactionDisplayVisible}
            onInteractionDisplayClose={handleInteractionDisplayClose}
            onChatStateChange={handleChatStateChange}
            externalChatVisible={chatVisible}
            agentViewVisible={agentViewVisible}
            onAgentViewClose={handleAgentViewClose}
            onActionClick={handleActionClick}
            hollowVortex={hollowVortex}
            displayTitle={displayTitle}
            interactionPreviewVisible={interactionPreviewVisible}
            onInteractionPreviewClose={handleInteractionPreviewClose}
            interactionPreviewText={interactionPreviewText}
            onSmartBarHover={handleSmartBarHover}
            smartBarState={smartBarState}
            onSmartBarStateChange={setSmartBarState}
            selectedNode={selectedNode}
            onNodeClick={handleNodeClick}
            onCloseOverlay={handleCloseOverlay}
            onSphereWindowVisibleChange={setSphereWindowVisible}
            isNodeSelected={selectedNode !== null}
            onWebViewStateChange={handleWebViewStateChange}
            onPlusClick={() => setUploadModalVisible(true)}
            collectionUpdateTrigger={collectionUpdateTrigger}
          />
        ) : (
          <OnboardingFlow onComplete={handleOnboardingComplete} />
        )}
      </div>

      <ControlPanel
        isVisible={controlPanelVisible}
        onClose={() => setControlPanelVisible(false)}
        initialTab={controlPanelTab}
      />

      <UploadModal
        isVisible={uploadModalVisible}
        onClose={() => setUploadModalVisible(false)}
        onUploadSuccess={handleUploadSuccess}
        defaultCollectionName={selectedNode?.name}
      />
    </div>
  );
}
