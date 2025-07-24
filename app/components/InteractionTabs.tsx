import React, { useState } from 'react';
import { MessageCircle, Search, Plus, Play, Command } from 'lucide-react';

interface InteractionTabsProps {
  isVisible: boolean;
  onActionClick?: (actionId: string) => void;
}

const InteractionTabs: React.FC<InteractionTabsProps> = ({ isVisible, onActionClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  if (!isVisible) return null;

  const handleTabClick = (actionId: string) => {
    onActionClick?.(actionId);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div 
      className="-mb-1.5 max-w-[530px] p-1.5  rounded-3xl  inline-flex justify-center items-center gap-1 overflow-x-auto transition-all duration-300"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isHovered ? (
        // Expanded state with full options
        <>
          <div className="inline-flex flex-col justify-start items-center gap-3">
            <div 
              className="px-2.5 py-1.5 rounded-xl inline-flex justify-center items-center gap-1.5 cursor-pointer hover:bg-black/[3.5%] hover:backdrop-blur-2xl transition-colors"
              onClick={() => handleTabClick('chat')}
            >
              <MessageCircle size={12} className="text-black/30" />
              <div className="text-center justify-start text-black/30 text-xs font-normal font-['Neue_Montreal']">Chat</div>
            </div>
          </div>
          <div className="inline-flex flex-col justify-start items-center gap-3">
            <div 
              className="px-2.5 py-1.5 rounded-xl inline-flex justify-center items-center gap-1.5 cursor-pointer hover:bg-black/[3.5%] hover:backdrop-blur-2xl transition-colors"
              onClick={() => handleTabClick('search')}
            >
              <Search size={12} className="text-black/30" />
              <div className="text-center justify-start text-black/30 text-xs font-normal font-['Neue_Montreal']">Search</div>
            </div>
          </div>
          <div className="inline-flex flex-col justify-start items-center gap-3">
            <div 
              className="px-2.5 py-1.5 rounded-xl inline-flex justify-center items-center gap-1.5 cursor-pointer hover:bg-black/[3.5%] hover:backdrop-blur-2xl transition-colors"
              onClick={() => handleTabClick('create')}
            >
              <Plus size={12} className="text-black/30" />
              <div className="text-center justify-start text-black/30 text-xs font-normal font-['Neue_Montreal']">Create</div>
            </div>
          </div>
          <div className="inline-flex flex-col justify-start items-center gap-3">
            <div 
              className="px-2.5 py-1.5 rounded-xl inline-flex justify-center items-center gap-1.5 cursor-pointer hover:bg-black/[3.5%] hover:backdrop-blur-2xl transition-colors"
              onClick={() => handleTabClick('execute')}
            >
              <Play size={12} className="text-black/30" />
              <div className="text-center justify-start text-black/30 text-xs font-normal font-['Neue_Montreal']">Execute</div>
            </div>
          </div>
          <div className="inline-flex flex-col justify-start items-center gap-3">
            <div 
              className="px-2.5 py-1.5 rounded-xl inline-flex justify-center items-center gap-1.5 cursor-pointer hover:bg-black/[3.5%] hover:backdrop-blur-2xl transition-colors"
              onClick={() => handleTabClick('instruct')}
            >
              <Command size={12} className="text-black/30" />
              <div className="text-center justify-start text-black/30 text-xs font-normal font-['Neue_Montreal']">Instruct</div>
            </div>
          </div>
        </>
      ) : (
        // Idle state with small circles
        <div className="inline-flex justify-center items-center gap-5">
          <div className="w-[7px] h-[7px] bg-black/10 backdrop-blur-xl rounded-full"></div>
          <div className="w-[7px] h-[7px] bg-black/10 backdrop-blur-xl rounded-full"></div>
          <div className="w-[7px] h-[7px] bg-black/10 backdrop-blur-xl rounded-full"></div>
          <div className="w-[7px] h-[7px] bg-black/10 backdrop-blur-xl rounded-full"></div>
          <div className="w-[7px] h-[7px] bg-black/10 backdrop-blur-xl rounded-full"></div>
        </div>
      )}
    </div>
  );
};

export default InteractionTabs; 