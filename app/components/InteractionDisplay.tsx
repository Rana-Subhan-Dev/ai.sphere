'use client';

import { X, MessageCircle, Globe, SlidersHorizontal } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from './ui/drawer';

interface InteractionDisplayProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function InteractionDisplay({ isVisible, onClose }: InteractionDisplayProps) {
  return (
    <Drawer open={isVisible} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="h-full bg-white/80 backdrop-blur-[50px] border-t-[0.5px] border-black/10 rounded-t-none">
        {/* Header */}
        {/* <div className="w-full p-3 bg-black/5 border-b-[0.5px] border-black/10 backdrop-blur-lg flex justify-between items-center">
          <div className="w-36 flex justify-start items-center gap-2">
            <div className="pl-1.5 pr-2.5 py-1.5 bg-black/5 rounded-[100px] flex flex-col justify-start items-center gap-2">
              <div className="flex justify-start items-center gap-1">
                <img className="w-4 h-4" src="https://placehold.co/16x16" />
                <div className="text-black/40 text-sm font-normal font-['Neue_Montreal']">Finance Agent</div>
                <div className="text-black/40 text-sm font-normal font-['Neue_Montreal']">3</div>
              </div>
            </div>
          </div>
          <div className="h-7 px-2 py-1.5 rounded-[100px] backdrop-blur-[50px] flex flex-col justify-center items-center gap-2">
            <div className="flex justify-start items-center gap-1.5">
              <div className="w-3.5 h-3.5 relative overflow-hidden">
                <div className="w-3.5 h-3.5 left-0 top-0 absolute opacity-0 bg-black/40" />
                <div className="w-3.5 h-3.5 left-0 top-0 absolute bg-black/40" />
              </div>
              <div className="text-black/50 text-sm font-normal font-['Neue_Montreal']">Accommodations in SF</div>
            </div>
          </div>
          <div className="w-36 flex justify-end items-center gap-2.5">
          <button
              onClick={onClose}
              className="w-7 h-7 p-1.5 bg-black/5 rounded-[100px] backdrop-blur-[50px] flex flex-col justify-center items-center gap-2"
              style={{ outline: 'none' }}
          >
            <X size={16} className="text-black/30" />
          </button>
          </div>
        </div> */}
        
        {/* Scrollable Content */}
        <div className="w-full h-full overflow-y-auto scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {/* Main Display Area */}
          <div className="sticky top-0 w-full h-[87.5vh] px-10 py-20 bg-black/5 flex flex-col justify-center items-center gap-24">
            <div className="flex justify-start items-center gap-10">
              <div className="w-24 h-24 bg-black/5 rounded-3xl" />
              <div className="w-28 h-28 bg-black/5 rounded-full" />
              <div className="w-48 h-24 bg-black/5 rounded-3xl" />
              <div className="w-28 h-32 bg-black/5 rounded-xl" />
              <div className="w-24 h-24 bg-black/5 rounded-3xl" />
            </div>
          </div>
          
          {/* Extra Detail/Discovery Section */}
          <div className="w-full relative border-b-[0.5px] flex flex-col justify-start items-center">
            {/* Header as Tooltips */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-12 flex justify-start items-start gap-2">
              {/* Message bubble icon */}
              <div className="w-7 h-7 p-1.5 bg-black/5 rounded-[100px] backdrop-blur-[50px] flex flex-col justify-center items-center gap-2">
                <MessageCircle size={14} className="text-black/40" />
              </div>
              {/* Globe icon */}
              <div className="h-7 px-2 py-1.5 bg-black/5 rounded-[100px] backdrop-blur-[50px] flex flex-col justify-center items-center gap-2">
                <div className="flex justify-start items-center gap-1.5">
                  <Globe size={14} className="text-black/40" />
                  <div className="text-black/50 text-sm font-normal font-['Neue_Montreal']">Accommodations in SF</div>
                </div>
              </div>
              {/* Filter/slider icon */}
              <div className="w-7 h-7 p-1.5 bg-black/5 rounded-[100px] backdrop-blur-[50px] flex flex-col justify-center items-center gap-2">
                <SlidersHorizontal size={12} className="text-black/40" />
              </div>
            </div>
            <div className="w-full bg-white/0 shadow-[0px_-40px_60px_0px_rgba(0,0,0,0.01)] backdrop-blur-[50px] flex flex-col justify-start items-start">
              {/* Tabs */}
              <div className="sticky top-0 w-full px-3 py-3 bg-[#eeeeee]/40 border-y-[0.5px] border-black/10 flex justify-center items-center">
                <div className="flex justify-center items-center gap-3.5">
                  <div className="rounded-[100px] flex flex-col justify-center items-center gap-2.5">
                    <div className="text-black text-sm font-normal font-['Neue_Montreal']">All</div>
                  </div>
                  <div className="rounded-[100px] flex justify-center items-center gap-2.5">
                    <div className="text-black/40 text-sm font-normal font-['Neue_Montreal']">Productivity</div>
                  </div>
                  <div className="rounded-[100px] flex justify-center items-center gap-2.5">
                    <div className="text-black/40 text-sm font-normal font-['Neue_Montreal']">Social Media</div>
                  </div>
                  <div className="rounded-[100px] flex justify-center items-center gap-2.5">
                    <div className="text-black/40 text-sm font-normal font-['Neue_Montreal']">Finance</div>
                  </div>
                  <div className="rounded-[100px] flex justify-center items-center gap-2.5">
                    <div className="text-black/40 text-sm font-normal font-['Neue_Montreal']">Shopping</div>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="w-full px-16 pb-12 bg-white/20 flex justify-center items-start gap-10 flex-wrap content-start">
                <div className="w-[960px] flex justify-start items-start flex-wrap content-start">
                  <div className="w-60 h-44 bg-black/0 border-[0.25px] border-black/10" />
                  <div className="w-[480px] h-44 p-6 bg-black/0 outline outline-[0.25px] outline-offset-[-0.25px] outline-black/10 flex flex-col justify-between items-start">
                    <div className="flex justify-start items-center gap-2">
                      <img className="w-7 h-7 rounded-lg" src="https://placehold.co/30x30" />
                      <div className="flex flex-col justify-center items-start">
                        <div className="text-black/80 text-xs font-normal font-['Neue_Montreal']">Wimbledon</div>
                        <div className="text-black/40 text-xs font-normal font-['Neue_Montreal']">wimbledon.com</div>
                      </div>
                    </div>
                    <div className="text-black/80 text-base font-normal font-['Neue_Montreal'] underline">Home – The Championships, Wimbledon</div>
                    <div className="text-black/40 text-xs font-normal font-['Neue_Montreal'] leading-tight">WIMBLEDON. 30 June TO 13 July 2025. LOGIN. IBM logo · Order of Play · Draws · The Wimbledon Shop · Queuing For Tickets. Djokovic eases through for 100th ...</div>
                    <div className="text-black/50 text-xs font-normal font-['Neue_Montreal']">10 days ago</div>
                  </div>
                  <div className="w-60 h-44 bg-black/0 border-[0.25px] border-black/10" />
                  <div className="w-60 h-44 bg-black/0 border-[0.25px] border-black/10" />
                  <div className="w-[480px] h-44 p-6 bg-black/0 outline outline-[0.25px] outline-offset-[-0.25px] outline-black/10 flex flex-col justify-between items-start">
                    <div className="flex justify-start items-center gap-2">
                      <img className="w-7 h-7 rounded-lg" src="https://placehold.co/30x30" />
                      <div className="flex flex-col justify-center items-start">
                        <div className="text-black/80 text-xs font-normal font-['Neue_Montreal']">Wimbledon</div>
                        <div className="text-black/40 text-xs font-normal font-['Neue_Montreal']">wimbledon.com</div>
                      </div>
                    </div>
                    <div className="text-black/80 text-base font-normal font-['Neue_Montreal'] underline">Home – The Championships, Wimbledon</div>
                    <div className="text-black/40 text-xs font-normal font-['Neue_Montreal'] leading-tight">WIMBLEDON. 30 June TO 13 July 2025. LOGIN. IBM logo · Order of Play · Draws · The Wimbledon Shop · Queuing For Tickets. Djokovic eases through for 100th ...</div>
                    <div className="text-black/50 text-xs font-normal font-['Neue_Montreal']">10 days ago</div>
                  </div>
                  {/* Add more content to make it scrollable */}
                  {Array.from({ length: 10 }, (_, i) => (
                    <div key={i} className="w-[480px] h-44 p-6 bg-black/0 outline outline-[0.25px] outline-offset-[-0.25px] outline-black/10 flex flex-col justify-between items-start">
                      <div className="flex justify-start items-center gap-2">
                        <img className="w-7 h-7 rounded-lg" src="https://placehold.co/30x30" />
                        <div className="flex flex-col justify-center items-start">
                          <div className="text-black/80 text-xs font-normal font-['Neue_Montreal']">Item {i + 1}</div>
                          <div className="text-black/40 text-xs font-normal font-['Neue_Montreal']">example.com</div>
                        </div>
                      </div>
                      <div className="text-black/80 text-base font-normal font-['Neue_Montreal'] underline">Sample Content {i + 1}</div>
                      <div className="text-black/40 text-xs font-normal font-['Neue_Montreal'] leading-tight">This is sample content to make the sheet scrollable. You can drag down to dismiss this sheet or scroll through the content.</div>
                      <div className="text-black/50 text-xs font-normal font-['Neue_Montreal']">{i + 1} days ago</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
} 