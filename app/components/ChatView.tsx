'use client';

import { useState, useEffect, useRef } from 'react';
import ChatHeader from './chat/ChatHeader';
import ChatMessage from './chat/ChatMessage';
import NewsCard from './chat/NewsCard';
import ChatInput from './chat/ChatInput';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp?: string;
  type: 'message' | 'news';
}

interface ChatViewProps {
  isVisible: boolean;
  onClose: () => void;
  isOpening?: boolean;
}

export default function ChatView({ isVisible, onClose, isOpening = false }: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'How would this impact my investments in companies that rely heavily on chips and other components manufactured in China?',
      isUser: true,
      type: 'message'
    },
    {
      id: '2',
      content: 'which of my holdings would be affected',
      isUser: true,
      type: 'message'
    },
    {
      id: '3',
      content: 'Well there are many companies that are heavily relying on Chinese companies as of today for many of their components...',
      isUser: false,
      type: 'message'
    },
    {
      id: '4',
      content: 'Wall Street plummets after China decides to take tariffs more seriously in order to increase its lev...',
      isUser: false,
      type: 'news',
      timestamp: 'Just Now'
    },
    {
      id: '5',
      content: 'How would this impact my investments in companies that rely heavily on chips and other components manufactured in China?',
      isUser: true,
      type: 'message'
    },
    {
      id: '6',
      content: 'which of my holdings would be affected',
      isUser: true,
      type: 'message'
    },
    {
      id: '7',
      content: 'Well there are many companies that are heavily relying on Chinese companies as of today for many of their components...',
      isUser: false,
      type: 'message'
    },
    {
      id: '8',
      content: 'Wall Street plummets after China decides to take tariffs more seriously in order to increase its lev...',
      isUser: false,
      type: 'news',
      timestamp: 'Just Now'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isVisible) {
      scrollToBottom();
    }
  }, [messages, isVisible]);

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      type: 'message'
    };
    setMessages(prev => [...prev, newMessage]);

    // Simulate AI response after a delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "That's a great question. Let me analyze your portfolio...",
        isUser: false,
        type: 'message'
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isVisible) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div 
      className={`
        absolute inset-0 w-full h-full flex flex-col
        bg-white/10 backdrop-blur-[100px]
        rounded-lg z-[400]
        transition-all duration-500 ease-out
        ${isOpening ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
      `}
      style={{ borderRadius: '8px' }}
    >
      {/* Finance Bro Icon - Only visible in chat */}
      <div 
        className={`
          absolute left-1/2 transform -translate-x-1/2 top-[18px] w-12 h-12 
          bg-gradient-to-br from-green-400 to-green-600 rounded-full 
          shadow-sm border border-black/5 flex items-center justify-center 
          z-[700] transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]
          ${isOpening 
            ? 'opacity-0 scale-50 transform -translate-y-4' 
            : 'opacity-100 scale-100 transform translate-y-0'
          }
        `}
      >
        <div className="w-4 h-4 bg-white/20 rounded-full transition-all duration-300" />
      </div>

      {/* Messages Container - Scrollable area */}
      <div 
        className={`
          flex-1 overflow-y-auto p-6 pt-28 pb-52
          transition-opacity duration-500 delay-300
          scrollbar-hide
          ${isOpening ? 'opacity-0' : 'opacity-100'}
        `}
      >
        <div className="flex flex-col gap-3.5 w-[50%] mx-auto min-h-full">
          {messages.map((message, idx) => {
            // Find the last user and AI message indices
            const lastUserIdx = [...messages].reverse().findIndex(m => m.type === 'message' && m.isUser);
            const lastUserIndex = lastUserIdx === -1 ? -1 : messages.length - 1 - lastUserIdx;
            const lastAiIdx = [...messages].reverse().findIndex(m => m.type === 'message' && !m.isUser);
            const lastAiIndex = lastAiIdx === -1 ? -1 : messages.length - 1 - lastAiIdx;
            return (
              <div key={message.id}>
                {message.type === 'message' ? (
                  message.isUser ? (
                    // User message (right-aligned)
                    <div className="flex justify-end">
                      <div className={`px-3 py-2.5 bg-white/80 flex flex-col justify-start items-end gap-2.5 ${idx === lastUserIndex ? 'rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl' : 'rounded-2xl'} ${message.content.length < 48 ? 'inline-flex max-w-[384px] min-w-0' : 'max-w-[384px] w-full'}`}>
                        <div className="justify-start text-black/90 text-base font-normal font-['SF_Pro_Rounded'] leading-snug break-words">{message.content}</div>
                      </div>
                    </div>
                  ) : (
                    // AI message (left-aligned)
                    <div className="flex justify-start">
                      <div className={`px-3 py-2.5 bg-white/20 inline-flex justify-start items-end gap-2.5 ${idx === lastAiIndex ? 'rounded-tl-2xl rounded-tr-2xl rounded-br-2xl' : 'rounded-2xl'} max-w-[384px] min-w-0`}>
                        <div className="justify-start text-black/60 text-base font-normal font-['SF_Pro_Rounded'] leading-snug break-words">{message.content}</div>
                      </div>
                    </div>
                  )
                ) : (
                  // Interaction Block
                  <div className="self-stretch h-48 opacity-50 bg-neutral-200 rounded-sm shadow-[0px_10px_40px_0px_rgba(0,0,0,0.05)] border-[0.50px] border-black/10" />
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
} 