'use client';

import { useState } from 'react';
import { X, MoreHorizontal, Minimize2, GitBranch, BookOpen, Edit3, Maximize } from 'lucide-react';
import BlurEffect from 'react-progressive-blur';

interface SmartPanelProps {
  onClose: () => void;
  isBackground?: boolean;
}

export default function SmartPanel({ onClose, isBackground = false }: SmartPanelProps) {

  return (
    <div className="h-full w-full relative">
      {/* Panel Container - full height, no height controls */}
      <div 
        className="w-full h-full relative bg-transparent rounded-none flex flex-col justify-end items-center overflow-hidden"
      >
        {/* Top Bar */}
        <div className="w-full p-3.5 left-0 top-0 absolute bg-gradient-to-b from-white/5 to-white/0 rounded-tl-3xl rounded-tr-3xl backdrop-blur-[0px] inline-flex justify-between items-center">
          {/* Progressive blur effect */}
          <BlurEffect
            className="absolute top-0 h-[60px] w-full rounded-tl-3xl rounded-tr-3xl"
            position="top"
            intensity={30}
          />
          
          <button className="w-8 h-8 p-2 bg-white/1 rounded-[100px] backdrop-blur-2xl outline outline-[0.50px] outline-offset-[-0.50px] outline-black/10 backdrop-blur-xl flex justify-center items-center gap-2.5 z-10 transition-all duration-150 hover:bg-white/10 active:scale-95">
            <BookOpen size={16} className="text-black/40" />
          </button>
          
          <div className="h-8 px-3 py-2 bg-white/1 rounded-[100px] backdrop-blur-2xl outline outline-[0.50px] outline-offset-[-0.50px] outline-black/10 backdrop-blur-[50px] flex justify-center items-center gap-2 z-10">
            <Maximize size={16} className="text-black/40" />
            <div className="justify-start text-black/40 text-xs font-normal font-['Neue_Montreal']">Full Window</div>
          </div>

          <button className="w-8 h-8 p-2 bg-white/1 rounded-[100px] backdrop-blur-2xl outline outline-[0.50px] outline-offset-[-0.50px] outline-black/10 backdrop-blur-xl flex justify-center items-center gap-2.5 z-10 transition-all duration-150 hover:bg-white/10 active:scale-95">
            <Edit3 size={16} className="text-black/40" />
          </button>
        </div>

        {/* Content Area - scrollable with new chat layout */}
        <div 
          className="w-full items-center self-stretch flex-1 overflow-y-auto overflow-x-hidden flex flex-col-reverse"
          style={{
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none', // IE and Edge
          }}
        >
          {/* Hide webkit scrollbar */}
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {/* New chat layout */}
          <div className="w-full max-w-[60%] min-w-[400px] pt-32 pb-36 rounded-3xl inline-flex flex-col justify-end items-center gap-7">
            {/* Other Threads */}
            <div className="flex flex-col justify-start items-start gap-3.5">
              <div className="w-[470px] p-4 bg-white rounded-3xl flex flex-col justify-end items-start gap-2.5">
                <div className="self-stretch inline-flex justify-start items-center gap-2">
                  <div className="w-6 h-6 bg-black/5 rounded-full" />
                  <div className="justify-start text-black text-lg font-medium font-['SF_Pro_Rounded'] leading-normal">Healthcare Talk</div>
                </div>
              </div>
              <div className="w-[470px] p-4 bg-white rounded-3xl flex flex-col justify-end items-start gap-2.5">
                <div className="self-stretch inline-flex justify-start items-center gap-2">
                  <div className="w-6 h-6 bg-black/5 rounded-full" />
                  <div className="justify-start text-black text-lg font-medium font-['SF_Pro_Rounded'] leading-normal">Financial Planning</div>
                </div>
              </div>
              <div className="w-[470px] p-4 bg-white rounded-3xl flex flex-col justify-end items-start gap-2.5">
                <div className="self-stretch inline-flex justify-start items-center gap-2">
                  <div className="w-6 h-6 bg-black/5 rounded-full" />
                  <div className="justify-start text-black text-lg font-medium font-['SF_Pro_Rounded'] leading-normal">Political News</div>
                </div>
              </div>
              <div className="w-[470px] p-4 bg-white rounded-3xl flex flex-col justify-end items-start gap-2.5">
                <div className="self-stretch inline-flex justify-start items-center gap-2">
                  <div className="w-6 h-6 bg-black/5 rounded-full" />
                  <div className="justify-start text-black text-lg font-medium font-['SF_Pro_Rounded'] leading-normal">Business Ideas</div>
                </div>
              </div>
              <div className="w-[470px] p-4 bg-white rounded-3xl flex flex-col justify-end items-start gap-2.5">
                <div className="self-stretch inline-flex justify-start items-center gap-2">
                  <div className="w-6 h-6 bg-black/5 rounded-full" />
                  <div className="justify-start text-black text-lg font-medium font-['SF_Pro_Rounded'] leading-normal">Healthcare Talk</div>
                </div>
              </div>
              <div className="w-[470px] p-4 bg-white rounded-3xl flex flex-col justify-end items-start gap-2.5">
                <div className="self-stretch inline-flex justify-start items-center gap-2">
                  <div className="w-6 h-6 bg-black/5 rounded-full" />
                  <div className="justify-start text-black text-lg font-medium font-['SF_Pro_Rounded'] leading-normal">Financial Planning</div>
                </div>
              </div>
              <div className="w-[470px] p-4 bg-white rounded-3xl flex flex-col justify-end items-start gap-2.5">
                <div className="self-stretch inline-flex justify-start items-center gap-2">
                  <div className="w-6 h-6 bg-black/5 rounded-full" />
                  <div className="justify-start text-black text-lg font-medium font-['SF_Pro_Rounded'] leading-normal">Political News</div>
                </div>
              </div>
              <div className="w-[470px] p-4 bg-white rounded-3xl flex flex-col justify-end items-start gap-2.5">
                <div className="self-stretch inline-flex justify-start items-center gap-2">
                  <div className="w-6 h-6 bg-black/5 rounded-full" />
                  <div className="justify-start text-black text-lg font-medium font-['SF_Pro_Rounded'] leading-normal">Business Ideas</div>
                </div>
              </div>
            </div>

            {/* Current Thread */}
            <div className="mt-10 self-stretch flex flex-col justify-start items-center gap-5">
              <div className="-mb-[36px] w-full h-0 outline outline-[0.50px] outline-offset-[-0.25px] outline-black/10"></div>

              {/* Thread Title */}
              <div className="w-full inline-flex justify-center items-center gap-2">
                <button className="w-8 h-8 px-3 py-2 bg-white/40 rounded-[100px] outline outline-[0.50px] outline-offset-[-0.50px] outline-black/10 inline-flex flex-col justify-center items-center transition-all duration-150 hover:bg-white/60 active:scale-95">
                  <Minimize2 size={14} className="text-black/50" />
                </button>
                <div className="w-52 h-8 px-3 py-2 bg-white/40 rounded-[100px] outline outline-[0.50px] outline-offset-[-0.50px] outline-black/10 inline-flex justify-center items-center">
                  <div className="justify-start text-black/50 text-sm font-normal font-['SF_Pro_Rounded'] leading-tight">Market Analysis</div>
                </div>
                <button className="w-8 h-8 px-3 py-2 bg-white/40 rounded-[100px] outline outline-[0.50px] outline-offset-[-0.50px] outline-black/10 inline-flex flex-col justify-center items-center transition-all duration-150 hover:bg-white/60 active:scale-95">
                  <GitBranch size={14} className="text-black/50" />
                </button>
              </div>

              {/* User Question */}
              <div className="self-stretch px-3.5 flex flex-col justify-start items-end gap-2.5">
                <div className="w-96 px-3 py-2.5 bg-white/80 rounded-2xl flex flex-col justify-start items-end gap-2.5">
                  <div className="self-stretch justify-start text-black/90 text-base font-normal font-['SF_Pro_Rounded'] leading-snug">How would this impact my investments in companies that rely heavily on chips and other components manufactured in China?</div>
                </div>
                <div className="px-3 py-2.5 bg-white/80 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl flex flex-col justify-start items-end gap-2.5">
                  <div className="justify-start text-black/90 text-base font-normal font-['SF_Pro_Rounded'] leading-snug">which of my holdings would be affected </div>
                </div>
              </div>

              {/* AI Response */}
              <div className="self-stretch px-6 py-2.5 flex flex-col justify-start items-start gap-2.5">
                {/* AI Response Text Bubble */}
                <div className="px-3 py-2.5 bg-white/20 rounded-tl-2xl rounded-tr-2xl rounded-br-2xl inline-flex justify-start items-end gap-2.5">
                  <div className="w-96 justify-start text-black/60 text-base font-normal font-['SF_Pro_Rounded'] leading-snug">Well there are many companies that are heavily relying on Chinese companies as of today for many of their components...</div>
                </div>
                
                {/* AI Response Interaction Block */}
                <div className="self-stretch h-48 opacity-50 bg-neutral-200 rounded-sm shadow-[0px_10px_40px_0px_rgba(0,0,0,0.05)] border-[0.50px] border-black/10" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 