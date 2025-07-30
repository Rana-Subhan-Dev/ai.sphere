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
  createdAt: string;
}

// Generate random position for nodes around the sphere
function generateRandomPosition(): { lat: number; lon: number } {
  const lat = (Math.random() - 0.5) * 180; // -90 to +90 degrees (full vertical range)
  const lon = (Math.random() - 0.5) * 360; // -180 to +180 degrees
  return { lat, lon };
}

// Function to generate consistent position based on collection name with collision avoidance
function generateConsistentPosition(collectionName: string): { lat: number; lon: number } {
  // Create a simple hash from the collection name
  let hash = 0;
  for (let i = 0; i < collectionName.length; i++) {
    const char = collectionName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Use golden ratio spiral for better distribution
  const goldenRatio = 1.618033988749895;
  const goldenAngle = 2 * Math.PI / goldenRatio;
  
  // Use hash to generate a position on the spiral
  const spiralIndex = Math.abs(hash) % 1000; // Use modulo to get a reasonable range
  const angle = spiralIndex * goldenAngle;
  const radius = Math.sqrt(spiralIndex) * 0.1; // Gradually increase radius
  
  // Convert spiral coordinates to lat/lon
  // Use Fibonacci sphere distribution for better coverage
  const phi = Math.acos(1 - 2 * (spiralIndex % 1000) / 1000); // Latitude angle
  const theta = goldenAngle * spiralIndex; // Longitude angle
  
  // Convert to degrees and ensure proper ranges
  const lat = (90 - (phi * 180 / Math.PI)) * 0.8; // Scale down to avoid poles, -72 to +72
  const lon = ((theta * 180 / Math.PI) % 360) - 180; // -180 to +180
  
  return { lat, lon };
}

// Function to calculate distance between two points on a sphere
function calculateSphericalDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 1; // Unit sphere radius
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Function to check if a position is too close to existing positions
function isPositionValid(newLat: number, newLon: number, existingPositions: { lat: number; lon: number }[], minDistance: number = 0.3): boolean {
  for (const pos of existingPositions) {
    const distance = calculateSphericalDistance(newLat, newLon, pos.lat, pos.lon);
    if (distance < minDistance) {
      return false;
    }
  }
  return true;
}

// Convert collection names to nodes with collision avoidance
function createNodesFromCollections(collections: UserCollection[]): CollectionNode[] {
  const nodes: CollectionNode[] = [];
  const existingPositions: { lat: number; lon: number }[] = [];
  
  for (const collection of collections) {
    let position = generateConsistentPosition(collection.name);
    let attempts = 0;
    const maxAttempts = 10;
    
    // Try to find a valid position that doesn't collide with existing nodes
    while (!isPositionValid(position.lat, position.lon, existingPositions) && attempts < maxAttempts) {
      // Add some randomness to the base position
      const randomOffset = (Math.random() - 0.5) * 20; // ±10 degrees
      position = {
        lat: position.lat + randomOffset,
        lon: position.lon + randomOffset
      };
      
      // Ensure lat/lon are within valid ranges
      position.lat = Math.max(-72, Math.min(72, position.lat));
      position.lon = ((position.lon + 180) % 360) - 180;
      
      attempts++;
    }
    
    // If we still can't find a good position, use the original but with some offset
    if (attempts >= maxAttempts) {
      position = {
        lat: position.lat + (Math.random() - 0.5) * 30,
        lon: position.lon + (Math.random() - 0.5) * 30
      };
      position.lat = Math.max(-72, Math.min(72, position.lat));
      position.lon = ((position.lon + 180) % 360) - 180;
    }
    
    const node: CollectionNode = {
      id: `node_${collection.name}`,
      name: collection.name,
      collectionName: collection.name,
      lat: position.lat,
      lon: position.lon,
      createdAt: collection.created_at,
    };
    
    nodes.push(node);
    existingPositions.push(position);
  }
  
  return nodes;
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

// Function to focus camera on a specific lat/lon position
function useFocusOnPosition(controlsRef: React.RefObject<any>) {
  const { camera } = useThree();
  
  return useCallback((lat: number, lon: number) => {
    if (!controlsRef.current) return;
    
    const controls = controlsRef.current;
    const [targetX, targetY, targetZ] = latLonToVec3(lat, lon, 1.3);
    
    // Calculate the angle to rotate the camera
    const targetAngleY = Math.atan2(targetX, targetZ);
    const targetAngleX = Math.atan2(targetY, Math.sqrt(targetX * targetX + targetZ * targetZ));
    
    const startRotationY = Math.atan2(camera.position.x, camera.position.z);
    const startRotationX = Math.atan2(camera.position.y, Math.sqrt(camera.position.x * camera.position.x + camera.position.z * camera.position.z));
    
    // Keep track of start position
    const startPos = camera.position.clone();
    const distance = startPos.length();
    
    // Animate to new position
    let startTime = Date.now();
    const duration = 1000; // 1 second animation
    
    function animate() {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeProgress = progress < .5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress; // Smooth easing
      
      // Interpolate angles
      const currentRotY = startRotationY + (targetAngleY - startRotationY) * easeProgress;
      const currentRotX = startRotationX + (targetAngleX - startRotationX) * easeProgress;
      
      // Convert angles back to position
      const sinY = Math.sin(currentRotY);
      const cosY = Math.cos(currentRotY);
      const sinX = Math.sin(currentRotX);
      const cosX = Math.cos(currentRotX);
      
      camera.position.set(
        distance * cosX * sinY,
        distance * sinX,
        distance * cosX * cosY
      );
      
      camera.lookAt(0, 0, 0);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }
    
    animate();
  }, []);
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
  }, []);
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
  focusOnLatestNode?: boolean;
}> = ({ onNodeClick, hoveredNode, setHoveredNode, nodes, focusOnLatestNode }) => {
  const controlsRef = useRef<any>(null);
  
  useBounceZoom(controlsRef);
  useCustomGestures(controlsRef);
  const focusOnPosition = useFocusOnPosition(controlsRef);
  
  // Focus on latest node when requested
  useEffect(() => {
    if (focusOnLatestNode && nodes.length > 0) {
      // Find the most recently created node by sorting by creation date
      const sortedNodes = [...nodes].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const latestNode = sortedNodes[0];
      focusOnPosition(latestNode.lat, latestNode.lon);
    }
  }, [focusOnLatestNode, nodes, focusOnPosition]);

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
      
      {/* Collection Nodes - Improved Visual Design with Original Gray Color */}
      {nodes.map((node) => {
        const [x, y, z] = latLonToVec3(node.lat, node.lon, 1.3);
        const isHovered = hoveredNode === node.id;
        
        return (
          <group key={node.id} position={[x, y, z]}>
            {/* Main node sphere */}
            <mesh 
              castShadow 
              receiveShadow
              onClick={() => handleNodeClick(node)}
              onPointerEnter={() => setHoveredNode(node.id)}
              onPointerLeave={() => setHoveredNode(null)}
            >
              <sphereGeometry args={[isHovered ? 0.12 : 0.08, 16, 16]} />
              <meshStandardMaterial 
                color="#bdbdbd" 
                emissive="#bdbdbd"
                emissiveIntensity={isHovered ? 0.5 : 0.1}
                roughness={0.2}
                metalness={0.1}
              />
            </mesh>
            
            {/* Glow effect when hovered */}
            {isHovered && (
              <mesh>
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshBasicMaterial 
                  color="#bdbdbd"
                  transparent
                  opacity={0.3}
                />
              </mesh>
            )}
            
            {/* Connection line to globe surface */}
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.01, 0.01, 0.1, 8]} />
              <meshBasicMaterial 
                color="#d1d5db"
                transparent
                opacity={0.6}
              />
            </mesh>
          </group>
        );
      })}
      
      <OrbitControls
        ref={controlsRef}
        enableZoom={true}
        enablePan={false}
        enableRotate={true}
        minDistance={2}
        maxDistance={6}
        rotateSpeed={0.5}
        zoomSpeed={0.5}
        minPolarAngle={0}
        maxPolarAngle={Math.PI}
        target={[0, 0, 0]} // Fix target to center
        enableDamping={true}
        dampingFactor={0.05}
        screenSpacePanning={false}
      />

      {/* Focus animation overlay */}
      {focusOnLatestNode && (
        <group position={[0, 0, 0]}>
          <mesh>
            <sphereGeometry args={[1.35, 32, 32]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.1}
            />
          </mesh>
        </group>
      )}
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
  const [shouldFocusLatest, setShouldFocusLatest] = useState(false);
  const previousCollectionsRef = useRef<UserCollection[]>([]);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFetchingRef = useRef(false);

  // Get global drag state for scaling animation
  const { isDragging } = useDragDrop();

  // Debounced fetch collections data
  const fetchCollections = useCallback(async () => {
    if (isFetchingRef.current) {
      return;
    }

    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    fetchTimeoutRef.current = setTimeout(async () => {
      isFetchingRef.current = true;
      const authData = getAuthData();
      if (!authData?.user?.id) {
        console.log('No user authenticated');
        isFetchingRef.current = false;
        return;
      }

      setIsLoading(true);
      try {
        const collections = await getUserCollections(authData.user.id);
        if (collections && collections.length > 0) {
          // Sort collections by creation date to find the latest
          const sortedCollections = [...collections].sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          
          // Get the latest collection
          const latestCollection = sortedCollections[0];
          
          // Create nodes with consistent positions
          const collectionNodes = createNodesFromCollections(collections);
          setNodes(collectionNodes);
          
          // Check if we have new collections compared to previous fetch
          const previousCollectionNames = previousCollectionsRef.current.map(c => c.name);
          console.log('Previous collections:', previousCollectionNames);
          console.log('Current collections:', sortedCollections.map(c => c.name));
          
          const newCollections = sortedCollections.filter(
            collection => !previousCollectionNames.includes(collection.name)
          );
          
          console.log('New collections found:', newCollections.map(c => c.name));
          
          // If there are new collections, focus on the most recent one
          if (newCollections.length > 0) {
            const newestCollection = newCollections[0]; // Already sorted by date
            const nodeToFocus = collectionNodes.find(
              node => node.name === newestCollection.name
            );
            
            console.log('Looking for node with name:', newestCollection.name);
            console.log('Available nodes:', collectionNodes.map(n => n.name));
            console.log('Found node to focus:', nodeToFocus);
            
            if (nodeToFocus) {
              console.log('🎯 FOCUSING ON:', newestCollection.name, 'at position:', nodeToFocus.lat, nodeToFocus.lon);
              // Set focus immediately and highlight the node
              setShouldFocusLatest(true);
              setHoveredNode(nodeToFocus.id);
              
              // Clear hover after animation completes
              setTimeout(() => {
                setHoveredNode(null);
              }, 3000); // Keep highlight longer for better visibility
            }
          } else {
            console.log('No new collections to focus on');
          }

          // Update previous collections reference
          previousCollectionsRef.current = sortedCollections;
          console.log(`Loaded ${collectionNodes.length} collection nodes`);
        } else {
          setNodes([]);
          previousCollectionsRef.current = [];
        }
      } catch (error) {
        console.error('Error fetching collections:', error);
        setNodes([]);
        previousCollectionsRef.current = [];
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    }, 300);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  // Initial load of collections
  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  // Refresh collections when update is triggered
  useEffect(() => {
    if (onCollectionUpdate) {
      fetchCollections();
    }
  }, [onCollectionUpdate, fetchCollections]);

  // Reset focus flag after animation
  useEffect(() => {
    if (shouldFocusLatest) {
      const timer = setTimeout(() => {
        setShouldFocusLatest(false);
      }, 2500); // Give more time for the focus animation to complete
      return () => clearTimeout(timer);
    }
  }, [shouldFocusLatest]);
  
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
              focusOnLatestNode={shouldFocusLatest}
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