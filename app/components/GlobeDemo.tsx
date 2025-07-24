'use client';

import { useState } from 'react';
import Globe from './Globe/Globe';
import Globe3D from './Globe/Globe3D';

export default function GlobeDemo() {
  const [selectedNode, setSelectedNode] = useState<{ id: string; name: string } | null>(null);
  const [activeGlobe, setActiveGlobe] = useState<'2d' | '3d'>('2d');

  const handleNodeClick = (nodeId: string, nodeName: string) => {
    setSelectedNode({ id: nodeId, name: nodeName });
  };

  const handleCloseOverlay = () => {
    setSelectedNode(null);
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Toggle buttons */}
      <div className="flex gap-4 mb-6 justify-center">
        <button
          onClick={() => setActiveGlobe('2d')}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            activeGlobe === '2d'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          2D Globe
        </button>
        <button
          onClick={() => setActiveGlobe('3d')}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            activeGlobe === '3d'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          3D Globe
        </button>
      </div>

      {/* Globe container */}
      <div className="flex-1 flex justify-center items-center">
        {activeGlobe === '2d' ? (
          <Globe />
        ) : (
          <div className="w-96 h-96">
            <Globe3D
              selectedNode={selectedNode}
              onNodeClick={handleNodeClick}
              onCloseOverlay={handleCloseOverlay}
            />
          </div>
        )}
      </div>

      {/* Info text */}
      <div className="text-center text-gray-600 text-sm mt-4">
        {activeGlobe === '2d' 
          ? 'Hover over the mini nodes around the 2D globe' 
          : 'Click on the nodes on the 3D globe to open overlays'
        }
      </div>
    </div>
  );
} 