'use client';

import { useState } from 'react';
import { Send, Mic, Plus } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function ChatInput({ 
  onSendMessage, 
  placeholder = "Send a message...", 
  disabled = false 
}: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !disabled) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className={`flex items-center gap-3 p-4 bg-white/90 backdrop-blur-sm rounded-2xl border border-black/10 shadow-lg ${disabled ? 'opacity-50' : ''}`}>
          <button
            type="button"
            disabled={disabled}
            className="flex-shrink-0 w-9 h-9 bg-black/5 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors disabled:cursor-not-allowed disabled:hover:bg-black/5"
          >
            <Plus size={18} className="text-black/60" />
          </button>
          
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? "Processing..." : placeholder}
            disabled={disabled}
            className="flex-1 bg-transparent text-[15px] font-normal font-['SF_Pro_Rounded'] text-black placeholder:text-black/50 outline-none py-1 disabled:cursor-not-allowed"
          />
          
          <button
            type="button"
            disabled={disabled}
            className="flex-shrink-0 w-9 h-9 bg-black/5 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors disabled:cursor-not-allowed disabled:hover:bg-black/5"
          >
            <Mic size={18} className="text-black/60" />
          </button>
          
          <button
            type="submit"
            disabled={!message.trim() || disabled}
            className={`
              flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200
              ${message.trim() && !disabled
                ? 'bg-[#007aff] hover:bg-[#0056cc] text-white shadow-md' 
                : 'bg-black/5 text-black/30 cursor-not-allowed'
              }
            `}
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
} 