'use client';

import { useState } from 'react';
import { Plus, Home, Users, Link, MoreHorizontal, Globe, Search } from 'lucide-react';

interface NavButtonsProps {
  isVisible?: boolean;
  onPlusClick?: () => void;
}

export default function NavButtons({ isVisible = true, onPlusClick }: NavButtonsProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'users' | 'link' | 'web'>('home');

  const getButtonStyle = (isActive: boolean) => {
    return `w-7 h-7 p-1.5 rounded-lg backdrop-blur-[50px] flex justify-center items-center gap-2.5 cursor-pointer transition-all duration-200 ease-out ${
      isActive 
        ? 'bg-white/[1%]' 
        : 'bg-[#dddddd]/[1%] hover:bg-white/20'
    }`;
  };

  const getIconStyle = (isActive: boolean) => {
    return `transition-all duration-200 ease-out ${
      isActive 
        ? 'text-black/70' 
        : 'text-black/30 hover:text-black/60'
    }`;
  };

  return (
    <div 
      className={`inline-flex justify-start items-center gap-3.5 transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8 pointer-events-none'
      }`}
      style={{
        transformOrigin: 'center bottom',
      }}
    >
      <div 
        className="w-7 h-7 p-1.5 bg-[#dddddd]/[1%] rounded-lg backdrop-blur-[50px] flex justify-center items-center gap-2.5 cursor-pointer hover:bg-white/80 transition-all duration-200 ease-out"
        onClick={onPlusClick}
      >
        <Plus size={12} className="text-black/30 hover:text-black/60 transition-all duration-200 ease-out" />
      </div>
      <div className="w-0 h-3 outline outline-[0.50px] outline-black/10"></div>
      
      {/* Tab Buttons */}
      {/* <div 
        className={getButtonStyle(activeTab === 'home')}
        onClick={() => setActiveTab('home')}
      >
        <Home size={16} className={getIconStyle(activeTab === 'home')} />
      </div>
      
      <div 
        className={getButtonStyle(activeTab === 'users')}
        onClick={() => setActiveTab('users')}
      >
        <Users size={12} className={getIconStyle(activeTab === 'users')} />
      </div>
      
      <div 
        className={getButtonStyle(activeTab === 'link')}
        onClick={() => setActiveTab('link')}
      >
        <Link size={14} className={getIconStyle(activeTab === 'link')} />
      </div> */}

      <div 
        className={getButtonStyle(activeTab === 'web')}
        onClick={() => setActiveTab('web')}
      >
        <Globe size={14} className={getIconStyle(activeTab === 'web')} />
        {/* <p>Web</p> */}
      </div>
      
      <div className="w-0 h-3 outline outline-[0.50px] outline-black/10"></div>
      <div className="w-7 h-7 p-1.5 bg-[#dddddd]/[1%] rounded-lg backdrop-blur-[50px] flex justify-center items-center gap-2.5 cursor-pointer hover:bg-white/80 transition-all duration-200 ease-out">
        <Search size={14} className="text-black/30 hover:text-black/60 transition-all duration-200 ease-out" />
      </div>
    </div>
  );
} 