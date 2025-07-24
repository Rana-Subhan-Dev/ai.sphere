import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, SoftShadows } from '@react-three/drei';
import * as THREE from 'three';
import SpaceCanvas from '../SpaceCanvas/SpaceCanvas';
import { GlobeDropZone, useDragDrop } from '../DragDrop';
import { getUserCollections, getAuthData, type UserCollection } from '../../../lib/api';

// Convert collection name to a node with position
interface CollectionNode {
  id: string;
  name: string;
  collectionName: string;
  lat: number;
  lon: number;
}

// Generate random position for nodes around the sphere
function generateRandomPosition(): { lat: number; lon: number } {
  const lat = (Math.random() - 0.5) * 160; // -80 to +80 degrees
  const lon = (Math.random() - 0.5) * 360; // -180 to +180 degrees
  return { lat, lon };
}

// Convert collection names to nodes
function createNodesFromCollections(collections: UserCollection[]): CollectionNode[] {
  return collections.map((collection) => {
    const position = generateRandomPosition();
    return {
      id: `collection_${collection.name}_${collection.document_count}`,
      name: `${collection.name} (${collection.document_count} items)`,
      collectionName: collection.name,
      lat: position.lat,
      lon: position.lon,
    };
  });
}

// Convert lat/lon to 3D position on sphere
function latLonToVec3(lat: number, lon: number, radius: number): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return [
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  ];
}

// Custom hook for bounce zoom effect
function useBounceZoom(controlsRef: React.RefObject<any>) {
  const { camera } = useThree();
  const minDistance = 0.1;
  const maxDistance = 6;
  const springStrength = 0.12;
  const dampening = 0.75;
  
  const velocity = useRef(0);
  const lastDistance = useRef(0);
  
  useFrame(() => {
    if (!controlsRef.current) return;
    
    const controls = controlsRef.current;
    const currentDistance = camera.position.distanceTo(controls.target);
    
    if (currentDistance < minDistance) {
      const overshoot = minDistance - currentDistance;
      const springForce = overshoot * springStrength;
      velocity.current += springForce;
    } else if (currentDistance > maxDistance) {
      const overshoot = currentDistance - maxDistance;
      const springForce = overshoot * springStrength;
      velocity.current -= springForce;
    }
    
    velocity.current *= dampening;
    
    if (Math.abs(velocity.current) > 0.001 || currentDistance < minDistance || currentDistance > maxDistance) {
      const newDistance = currentDistance + velocity.current;
      const direction = camera.position.clone().sub(controls.target).normalize();
      camera.position.copy(controls.target).add(direction.multiplyScalar(newDistance));
    } else {
      velocity.current = 0;
    }
    
    lastDistance.current = currentDistance;
  });
}

// Custom hook for trackpad and pinch gestures
function useCustomGestures(controlsRef: React.RefObject<any>) {
  const { camera } = useThree();
  
  useEffect(() => {
    if (!controlsRef.current) return;
    
    const controls = controlsRef.current;
    const domElement = controls.domElement;
    
    let initialDistance = 0;
    let initialCameraDistance = 0;
    let isZooming = false;
    
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      
      if (event.ctrlKey) {
        const zoomSpeed = 0.04;
        const currentDistance = camera.position.distanceTo(controls.target);
        const newDistance = currentDistance + event.deltaY * zoomSpeed;
        
        const direction = camera.position.clone().sub(controls.target).normalize();
        camera.position.copy(controls.target).add(direction.multiplyScalar(newDistance));
      } else {
        if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
          const rotationSpeed = 0.01;
          controls.object.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), -event.deltaX * rotationSpeed);
        }
      }
    };
    
    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length >= 1) {
        event.preventDefault();
        event.stopPropagation();
      }
      
      if (event.touches.length === 2) {
        isZooming = true;
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        initialDistance = Math.hypot(
          touch1.clientX - touch2.clientX,
          touch1.clientY - touch2.clientY
        );
        initialCameraDistance = camera.position.distanceTo(controls.target);
      }
    };
    
    const handleTouchMove = (event: TouchEvent) => {
      event.preventDefault();
      event.stopPropagation();
      
      if (event.touches.length === 2 && isZooming) {
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        const currentDistance = Math.hypot(
          touch1.clientX - touch2.clientX,
          touch1.clientY - touch2.clientY
        );
        
        const scale = Math.pow(initialDistance / currentDistance, 1.5);
        const newDistance = initialCameraDistance * scale;
        
        const direction = camera.position.clone().sub(controls.target).normalize();
        camera.position.copy(controls.target).add(direction.multiplyScalar(newDistance));
      }
    };
    
    const handleTouchEnd = (event: TouchEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.touches.length < 2) {
        isZooming = false;
      }
    };
    
    domElement.addEventListener('wheel', handleWheel, { passive: false });
    domElement.addEventListener('touchstart', handleTouchStart, { passive: false });
    domElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    domElement.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    document.addEventListener('touchstart', (e) => {
      if (domElement.contains(e.target as Node)) {
        e.preventDefault();
      }
    }, { passive: false });
    
    document.addEventListener('touchmove', (e) => {
      if (domElement.contains(e.target as Node)) {
        e.preventDefault();
      }
    }, { passive: false });
    
    return () => {
      domElement.removeEventListener('wheel', handleWheel);
      domElement.removeEventListener('touchstart', handleTouchStart);
      domElement.removeEventListener('touchmove', handleTouchMove);
      domElement.removeEventListener('touchend', handleTouchEnd);
    };
  }, [controlsRef, camera]);
}

// Tooltip component
const Tooltip: React.FC<{ nodeName: string; position: { x: number; y: number } }> = ({ nodeName, position }) => {
  return (
    <div
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y - 60,
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        pointerEvents: 'none',
        zIndex: 1000,
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        animation: 'tooltipFadeIn 0.2s ease-out',
      }}
    >
      {nodeName}
      <div
        style={{
          position: 'absolute',
          bottom: '-4px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '4px solid transparent',
          borderRight: '4px solid transparent',
          borderTop: '4px solid rgba(0, 0, 0, 0.85)',
        }}
      />
      <style>{`
        @keyframes tooltipFadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-4px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
};

const GlobeScene: React.FC<{ 
  onNodeClick: (collectionName: string, displayName: string) => void;
  hoveredNode: string | null;
  setHoveredNode: (nodeId: string | null) => void;
  nodes: CollectionNode[];
}> = ({ onNodeClick, hoveredNode, setHoveredNode, nodes }) => {
  const controlsRef = useRef<any>(null);
  
  useBounceZoom(controlsRef);
  useCustomGestures(controlsRef);
  
  const handleNodeClick = (node: CollectionNode) => {
    // Pass collection name to open collection view
    onNodeClick(node.collectionName, node.name);
  };
  
  return (
    <>
      <ambientLight intensity={2} />
      <directionalLight
        position={[5, 0, 0]}
        intensity={2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        color="#fff"
      />
      <SoftShadows size={20} samples={16} focus={0.95} />
      
      {/* Globe */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[1.3, 96, 96]} />
        <meshStandardMaterial
          color="#f8f8f8"
          roughness={0.75}
          metalness={0.02}
        />
      </mesh>
      
      {/* Latitude and Longitude Grid Lines */}
      <mesh>
        <sphereGeometry args={[1.302, 32, 16]} />
        <meshBasicMaterial 
          color="#000000" 
          wireframe={true} 
          transparent 
          opacity={0.075}
        />
      </mesh>
      
      {/* Collection Nodes - All Gray */}
      {nodes.map((node) => {
        const pos = latLonToVec3(node.lat, node.lon, 1.31);
        
        return (
          <mesh 
            key={node.id} 
            position={pos} 
            castShadow 
            receiveShadow
            onClick={() => handleNodeClick(node)}
            onPointerEnter={() => setHoveredNode(node.id)}
            onPointerLeave={() => setHoveredNode(null)}
          >
            <sphereGeometry args={[0.11, 32, 32]} />
            <meshStandardMaterial 
              color="#bdbdbd" 
              metalness={0.1} 
              roughness={0.3} 
            />
          </mesh>
        );
      })}
      
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan={false}
        enableZoom={false}
        enableRotate={true}
        minDistance={0.1}
        maxDistance={8.8}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.8}
        zoomSpeed={0}
        zoomToCursor={false}
        autoRotateSpeed={0}
        screenSpacePanning={false}
        minPolarAngle={Math.PI / 2}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  );
};

// Collection overlay component that fetches real data
const CollectionOverlay: React.FC<{
  collectionName: string;
  onClose: () => void;
}> = ({ collectionName, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  
  useEffect(() => {
    // Smooth zoom-in animation with slight delay
    const timer = setTimeout(() => setIsVisible(true), 30);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setIsVisible(false);
    setTimeout(onClose, 300);
  };
  
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#f8f9fa',
        zIndex: 500,
        opacity: isVisible ? 1 : 0,
        transform: isVisible 
          ? 'scale(1) translateZ(0)' 
          : isClosing 
            ? 'scale(0.9) translateZ(0)' 
            : 'scale(0.8) translateZ(0)',
        transformOrigin: 'center center',
        transition: isVisible 
          ? 'all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1)'
          : 'all 0.25s cubic-bezier(0.4, 0, 0.6, 1)',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '13px',
        overflow: 'hidden',
        boxShadow: isVisible 
          ? '0 20px 40px -10px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.05)' 
          : '0 8px 20px -5px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(20px)',
        willChange: 'transform, opacity',
      }}
    >
      {/* Collection Content */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          transform: isVisible ? 'translateY(0)' : 'translateY(15px)',
          transition: 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) 0.05s',
        }}
      >
        {/* Collection View - will show real files from the collection */}
        <SpaceCanvas 
          spaceName={collectionName}
          onClose={handleClose}
        />
      </div>
    </div>
  );
};

const Globe3D: React.FC<{
  selectedNode: { id: string; name: string } | null;
  onNodeClick: (nodeId: string, nodeName: string) => void;
  onCloseOverlay: () => void;
  newPopupVisible?: boolean;
  onCollectionUpdate?: () => void;
}> = ({ selectedNode, onNodeClick, onCloseOverlay, newPopupVisible = false, onCollectionUpdate }) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [nodes, setNodes] = useState<CollectionNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get global drag state for scaling animation
  const { isDragging } = useDragDrop();
  
  // Fetch collections data
  const fetchCollections = useCallback(async () => {
    const authData = getAuthData();
    if (!authData?.user?.id) {
      console.log('No user authenticated');
      return;
    }

    setIsLoading(true);
    try {
      const collections = await getUserCollections(authData.user.id);
      if (collections && collections.length > 0) {
        const collectionNodes = createNodesFromCollections(collections);
        setNodes(collectionNodes);
        console.log(`Loaded ${collectionNodes.length} collection nodes`);
      } else {
        setNodes([]);
        console.log('No collections found');
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
      setNodes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  // Refresh when onCollectionUpdate is called
  useEffect(() => {
    if (onCollectionUpdate) {
      fetchCollections();
    }
  }, [onCollectionUpdate, fetchCollections]);
  
  // Throttled mouse position update to prevent excessive re-renders
  const updateMousePosition = useCallback((x: number, y: number) => {
    setMousePosition(prev => {
      // Only update if position has changed significantly (at least 5px)
      if (Math.abs(prev.x - x) > 5 || Math.abs(prev.y - y) > 5) {
        return { x, y };
      }
      return prev;
    });
  }, []);
  
  useEffect(() => {
    let animationFrameId: number;
    
    const handleMouseMove = (e: MouseEvent) => {
      // Use requestAnimationFrame to throttle updates
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        updateMousePosition(e.clientX, e.clientY);
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [updateMousePosition]);
  
  const handleNodeClickInternal = useCallback((collectionName: string, displayName: string) => {
    // Pass the collection name as the node ID and display name
    onNodeClick(collectionName, displayName);
  }, [onNodeClick]);
  
  const handleCloseOverlayInternal = useCallback(() => {
    onCloseOverlay();
  }, [onCloseOverlay]);

  const handleGlobeDrop = useCallback((item: any) => {
    console.log('Item dropped on globe:', item);
    // Trigger the node click to open the overlay
    if (item.name) {
      handleNodeClickInternal('any', item.name);
    }
  }, [handleNodeClickInternal]);
  
  const hoveredNodeData = hoveredNode ? nodes.find(n => n.id === hoveredNode) : null;
  
  // Determine if globe should scale down when dragging
  const shouldScaleForDrag = isDragging;
  
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <GlobeDropZone onDrop={handleGlobeDrop}>
        <div
          style={{
            width: '100%',
            height: '100%',
            transform: shouldScaleForDrag 
              ? 'scale(0.9)' 
              : 'scale(1)',
            opacity: 1,
            transition: 'all 0.8s cubic-bezier(0.25,0.46,0.45,0.94)',
            transformOrigin: 'center center',
            pointerEvents: 'auto',
          }}
        >
          <Canvas
            shadows
            camera={{ position: [0, 0, 5], fov: 45 }}
            style={{ width: '100%', height: '100%', background: 'transparent' }}
          >
            <GlobeScene 
              onNodeClick={handleNodeClickInternal}
              hoveredNode={hoveredNode}
              setHoveredNode={setHoveredNode}
              nodes={nodes}
            />
          </Canvas>
        </div>
      </GlobeDropZone>
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/10 rounded-lg px-3 py-2">
          <div className="w-3 h-3 border border-black/20 border-t-black/40 rounded-full animate-spin" />
          <span className="text-black/60 text-sm">Loading collections...</span>
        </div>
      )}
      
      {/* Empty state */}
      {!isLoading && nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-black/40 text-lg mb-2">No collections yet</div>
            <div className="text-black/30 text-sm">Click the + button to add your first file</div>
          </div>
        </div>
      )}
      
      {/* Tooltip */}
      {hoveredNodeData && (
        <Tooltip 
          nodeName={hoveredNodeData.name}
          position={mousePosition}
        />
      )}
      
      {/* Full screen overlay - shows collection content */}
      {selectedNode && (
        <CollectionOverlay
          collectionName={selectedNode.id}
          onClose={handleCloseOverlayInternal}
        />
      )}
    </div>
  );
};

export default Globe3D; 