'use client';

import { X, MoreHorizontal } from 'lucide-react';

interface ChatHeaderProps {
  title?: string;
  onClose: () => void;
}

export default function ChatHeader({ title = "Finance Bro", onClose }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-5 bg-white/60 backdrop-blur-sm border-b border-black/8">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-sm border border-black/5 flex items-center justify-center">
          <div className="w-4 h-4 bg-white/20 rounded-full" />
        </div>
        <div className="text-black text-lg font-semibold font-['SF_Pro_Rounded']">
          {title}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="w-9 h-9 bg-black/5 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors"
        >
          <MoreHorizontal size={18} className="text-black/60" />
        </button>
        
        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 bg-black/5 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors"
        >
          <X size={18} className="text-black/60" />
        </button>
      </div>
    </div>
  );
} 