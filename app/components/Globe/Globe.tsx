import React from 'react';
import { Briefcase, Home } from 'lucide-react';

const miniNodes = [
  {
    id: 'work',
    angle: 210, // degrees, left side
    label: 'Work',
    icon: <Briefcase size={20} strokeWidth={1.5} />,
  },
  {
    id: 'personal',
    angle: 330, // degrees, right side
    label: 'Personal',
    icon: <Home size={20} strokeWidth={1.5} />,
  },
];

const RADIUS = 240; // px, for positioning mini nodes

function polarToCartesian(angle: number, radius: number) {
  const rad = (angle - 90) * (Math.PI / 180);
  return {
    x: radius * Math.cos(rad),
    y: radius * Math.sin(rad),
  };
}

const Globe: React.FC = () => {
  return (
    <div className="relative w-full h-full flex justify-center items-center">
      <div className="absolute left-0 top-0 w-full h-full rounded-full bg-gradient-to-br from-white via-white to-slate-50 shadow-globe flex justify-center items-center border-1.5 border-globe-border transition-shadow duration-200">
        {miniNodes.map((node) => {
          const pos = polarToCartesian(node.angle, RADIUS * 0.48);
          return (
            <React.Fragment key={node.id}>
              <div
                className="absolute w-3.5 h-3.5 bg-globe-bg rounded-full shadow-mini-node border-1.5 border-gray-300 z-[2] -translate-x-1/2 -translate-y-1/2 transition-shadow duration-200 hover:shadow-mini-node-hover"
                style={{
                  left: `calc(50% + ${pos.x}px)`,
                  top: `calc(50% + ${pos.y}px)`,
                }}
              />
              <div
                className="absolute min-w-9 min-h-9 p-0 bg-tooltip-bg rounded-xl shadow-tooltip flex items-center justify-center text-base text-gray-800 font-medium backdrop-blur-10 z-[3] -translate-x-1/2 -translate-y-full border-1.2 border-tooltip-border transition-shadow duration-200"
                style={{
                  left: `calc(50% + ${pos.x}px)`,
                  top: `calc(50% + ${pos.y - 48}px)`,
                }}
              >
                <span className="flex items-center justify-center text-gray-500 text-xl">{node.icon}</span>
                {/* <span className="text-sm font-medium">{node.label}</span> */}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default Globe; 