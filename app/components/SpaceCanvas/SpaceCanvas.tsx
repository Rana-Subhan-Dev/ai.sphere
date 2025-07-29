'use client';

import React, { useCallback, useState, useEffect, useRef, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  useReactFlow,
  ReactFlowProvider,
  BackgroundVariant,
  SelectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { X } from 'lucide-react';
import TextWidget from './widgets/TextWidget';
import NoteWidget from './widgets/NoteWidget';
import ShapeWidget from './widgets/ShapeWidget';
import URLWidget from './widgets/URLWidget';
import ObjectWidget from './widgets/ObjectWidget';
import AppWidget from './widgets/AppWidget';
import FileWidget from './widgets/FileWidget';
import TaskWidget from './widgets/TaskWidget';
import InfoActionWidget from './widgets/InfoActionWidget';
import AgentWidget from './widgets/AgentWidget';
import SphereWidget from './widgets/SphereWidget';
import SpaceWidget from './widgets/SpaceWidget';
import SmartBar from '../SmartBar';
import ChatView from '../ChatView';
import ControlPanel from '../NewPopup';

import { CanvasDropZone } from '../DragDrop';
import { useDragDrop } from '../DragDrop';
import SpaceCanvasContextMenu from './SpaceCanvasContextMenu';
import { getUserCollectionData, getAuthData } from '../../../lib/api';

// Register custom node types
const nodeTypes = {
  text: TextWidget,
  note: NoteWidget,
  shape: ShapeWidget,
  url: URLWidget,
  object: ObjectWidget,
  app: AppWidget,
  file: FileWidget,
  task: TaskWidget,
  infoaction: InfoActionWidget,
  agent: AgentWidget,
  sphere: SphereWidget,
  space: SpaceWidget,
} as any;

interface SpaceCanvasProps {
  spaceName: string;
  onClose: () => void;
}

// Convert collection files to nodes
const createNodesFromFiles = (files: any[]): Node[] => {
  return files.map((file, index) => {
    // Calculate grid position
    const columns = 6;
    const spacing = 120;
    const x = (index % columns) * spacing;
    const y = Math.floor(index / columns) * spacing;

    // Create node based on file type
    const baseNode = {
      id: `file-${file.file_id}`,
      position: { x, y },
      data: {
        fileName: file.fileName,
        fileType: file.fileType,
        fileSize: `${(file.file_size / 1024).toFixed(1)} KB`,
        fileURL: file.fileURL,
        createdAt: new Date(file.created_at).toLocaleDateString(),
        contentType: file.content_type,
      },
    };

    // Determine node type based on file type
    switch (file.fileType) {
      case 'image':
        return {
          ...baseNode,
          type: 'file',
          data: {
            ...baseNode.data,
            thumbnail: file.fileURL,
          },
        };
      case 'pdf':
        return {
          ...baseNode,
          type: 'file',
        };
      case 'text':
        return {
          ...baseNode,
          type: 'file',
        };
      case 'url':
        return {
          ...baseNode,
          type: 'url',
          data: {
            ...baseNode.data,
            url: file.fileURL,
          },
        };
      default:
        return {
          ...baseNode,
          type: 'file',
        };
    }
  });
};

const SpaceCanvasInner: React.FC<SpaceCanvasProps> = ({ spaceName, onClose }) => {
  const initialNodes: Node[] = [];
  const initialEdges: Edge[] = [];
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [smartBarState, setSmartBarState] = useState<'collapsed' | 'normal' | 'expanded'>('normal');
  const [chatVisible, setChatVisible] = useState(false);
  const [chatOpening, setChatOpening] = useState(false);
  const [controlPanelVisible, setControlPanelVisible] = useState(false);
  
  // Get global drag state for widget opacity
  const { isDragging, isOverDropZone, dropZone } = useDragDrop();
  
  // Fetch collection data
  useEffect(() => {
    const fetchCollectionData = async () => {
      const authData = getAuthData();
      if (!authData?.user?.id) {
        setError('User not authenticated');
        setIsLoading(false);
        return;
      }

      try {
        const data = await getUserCollectionData(authData.user.id, spaceName);
        if (data) {
          const fileNodes = createNodesFromFiles(data.files);
          setNodes(fileNodes);
        } else {
          setNodes([]);
        }
      } catch (error) {
        console.error('Error fetching collection data:', error);
        setError('Failed to load collection data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollectionData();
  }, [spaceName, setNodes]);

  // Handle node connections
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Handle chat state changes
  const handleChatStateChange = useCallback((isVisible: boolean) => {
    if (isVisible) {
      setChatOpening(true);
      setChatVisible(true);
      setTimeout(() => {
        setChatOpening(false);
      }, 500);
    } else {
      setChatVisible(false);
    }
  }, []);

  // Handle SmartBar hover to show chat
  const handleSmartBarHover = useCallback((isHovering: boolean) => {
    console.log('SpaceCanvas: SmartBar hover:', isHovering, 'Chat visible:', chatVisible);
    if (isHovering && !chatVisible) {
      // Add small delay to prevent rapid state changes
      setTimeout(() => {
        console.log('SpaceCanvas: Opening chat on hover');
        handleChatStateChange(true);
      }, 100);
    }
    // Don't close chat on mouse leave - let user close it manually
  }, [chatVisible, handleChatStateChange]);

  // Custom SmartBar state handler that prevents auto-collapse
  const handleSmartBarStateChange = useCallback((newState: 'collapsed' | 'normal' | 'expanded') => {
    // Prevent collapsing to 'collapsed' state in collection view
    if (newState === 'collapsed') {
      setSmartBarState('normal');
    } else {
      setSmartBarState(newState);
    }
  }, []);

  // Handle control panel success
  const handleControlPanelSuccess = useCallback(() => {
    // Refresh the collection data when new content is added
    const authData = getAuthData();
    if (authData?.user?.id) {
      getUserCollectionData(authData.user.id, spaceName).then((data) => {
        if (data) {
          const fileNodes = createNodesFromFiles(data.files);
          setNodes(fileNodes);
        }
      });
    }
  }, [spaceName, setNodes]);

  return (
    <div 
      style={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative',
        backgroundColor: '#fafbfc',
        overflow: 'hidden',
      }}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-[1000] w-8 h-8 bg-white/80 hover:bg-white/90 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-sm border border-black/5"
        title="Close and return to sphere"
      >
        <X className="w-4 h-4 text-black/60" />
      </button>

      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-black/10 border-t-black/30 rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-red-500">{error}</p>
        </div>
      ) : (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          selectionMode={SelectionMode.Partial}
          deleteKeyCode="Delete"
          multiSelectionKeyCode={null}
          selectionKeyCode={null}
          panOnDrag={[1, 2]}
          panOnScroll={true}
          zoomOnScroll={false}
          zoomOnPinch={true}
          zoomOnDoubleClick={false}
          preventScrolling={false}
          proOptions={{ hideAttribution: true }}
          style={{
            backgroundColor: '#fafbfc',
          }}
        >
          <Background
            variant={BackgroundVariant.Lines}
            gap={60}
            size={1}
            color="#f3f4f6"
            style={{
              backgroundColor: '#fafbfc',
              opacity: 1,
            }}
          />
          <Controls />
        </ReactFlow>
      )}

      {/* Smart Bar */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center">
        <SmartBar
          onStateChange={handleSmartBarStateChange}
          onHoverChange={handleSmartBarHover}
          forceHidden={false}
          interactionPreviewVisible={false}
          collectionName={spaceName}
          onSendMessage={(message) => {
            // Send message to chat API with collection context
            console.log('Sending message to chat:', message, 'Collection:', spaceName);
            // The chat will handle the API call with collection_name parameter
            handleChatStateChange(true);
          }}
          onPlusClick={() => setControlPanelVisible(true)}
        />
      </div>

      {/* Chat View */}
      <ChatView
        isVisible={chatVisible}
        onClose={() => handleChatStateChange(false)}
        isOpening={chatOpening}
        selectedCollection={spaceName}
      />

      {/* Control Panel */}
      <ControlPanel
        isVisible={controlPanelVisible}
        onClose={() => setControlPanelVisible(false)}
        initialTab="feed"
        collectionName={spaceName}
        onSuccess={handleControlPanelSuccess}
      />
    </div>
  );
};

const SpaceCanvas: React.FC<SpaceCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <SpaceCanvasInner {...props} />
    </ReactFlowProvider>
  );
};

export default SpaceCanvas; 