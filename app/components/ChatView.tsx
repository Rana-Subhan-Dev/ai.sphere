'use client';

import { useState, useEffect, useRef } from 'react';
import ChatHeader from './chat/ChatHeader';
import ChatMessage from './chat/ChatMessage';
import NewsCard from './chat/NewsCard';
import ChatInput from './chat/ChatInput';
import { queryDocuments, getAuthData } from '../../lib/api';
import { X } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp?: string;
  type: 'message' | 'news';
  sources?: Array<{
    content: string;
    data_type: string;
    collection_name: string;
    score: number;
  }>;
}

interface ChatViewProps {
  isVisible: boolean;
  onClose: () => void;
  isOpening?: boolean;
  selectedCollection?: string;
  pendingMessage?: string;
}

export default function ChatView({ 
  isVisible, 
  onClose, 
  isOpening = false, 
  selectedCollection,
  pendingMessage
}: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isVisible) {
      scrollToBottom();
    }
  }, [messages, isVisible]);

  // Handle pending message from SmartBar
  useEffect(() => {
    if (pendingMessage && isVisible) {
      handleSendMessage(pendingMessage);
    }
  }, [pendingMessage, isVisible]);

  const handleSendMessage = async (content: string) => {
    const authData = getAuthData();
    if (!authData?.user?.id) {
      console.error('User not authenticated');
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      type: 'message'
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Query the API
      const response = await queryDocuments(
        authData.user.id,
        content,
        selectedCollection || "",
        5
      );

      if (response) {
        // Add AI response
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response.answer,
          isUser: false,
          type: 'message',
          sources: response.sources.map(source => ({
            content: source.content,
            data_type: source.data_type,
            collection_name: source.collection_name,
            score: source.score,
          }))
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        // Add error message
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "Sorry, I couldn't process your request. Please try again.",
          isUser: false,
          type: 'message'
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, there was an error processing your request.",
        isUser: false,
        type: 'message'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
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
        fixed inset-0 w-full h-[calc(100vh-70px)] flex flex-col
        bg-white/10 backdrop-blur-[100px]
        rounded-lg z-[400]
        transition-all duration-500 ease-out
        ${isOpening ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
      `}
      style={{ borderRadius: '8px' }}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-[800] w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
        title="Close Chat"
      >
        <X className="w-4 h-4 text-black/60" />
      </button>

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

      {/* Messages Container */}
      <div 
        className={`
          flex-1 overflow-y-auto p-6 pt-28 pb-24
          transition-opacity duration-500 delay-300
          scrollbar-hide
          ${isOpening ? 'opacity-0' : 'opacity-100'}
        `}
      >
        <div className="flex flex-col gap-3.5 w-[50%] mx-auto min-h-full">
          {messages.length === 0 && (
            <div className="flex justify-center items-center h-32">
              <p className="text-black/40 text-sm">
                {selectedCollection 
                  ? `Ask questions about "${selectedCollection}" collection`
                  : "Ask questions about your documents"
                }
              </p>
            </div>
          )}
          
          {messages.map((message, idx) => {
            const lastUserIdx = [...messages].reverse().findIndex(m => m.type === 'message' && m.isUser);
            const lastUserIndex = lastUserIdx === -1 ? -1 : messages.length - 1 - lastUserIdx;
            const lastAiIdx = [...messages].reverse().findIndex(m => m.type === 'message' && !m.isUser);
            const lastAiIndex = lastAiIdx === -1 ? -1 : messages.length - 1 - lastAiIdx;
            
            return (
              <div key={message.id}>
                {message.isUser ? (
                  // User message (right-aligned)
                  <div className="flex justify-end">
                    <div className={`px-3 py-2.5 bg-white/80 flex flex-col justify-start items-end gap-2.5 ${idx === lastUserIndex ? 'rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl' : 'rounded-2xl'} ${message.content.length < 48 ? 'inline-flex max-w-[384px] min-w-0' : 'max-w-[384px] w-full'}`}>
                      <div className="justify-start text-black/90 text-base font-normal font-['SF_Pro_Rounded'] leading-snug break-words">{message.content}</div>
                    </div>
                  </div>
                ) : (
                  // AI message (left-aligned)
                  <div className="flex flex-col items-start gap-2">
                    <div className={`px-3 py-2.5 bg-white/20 inline-flex justify-start items-end gap-2.5 ${idx === lastAiIndex ? 'rounded-tl-2xl rounded-tr-2xl rounded-br-2xl' : 'rounded-2xl'} max-w-[384px] min-w-0`}>
                      <div className="justify-start text-black/60 text-base font-normal font-['SF_Pro_Rounded'] leading-snug break-words">{message.content}</div>
                    </div>
                    
                    {/* Sources */}
                    {message.sources && message.sources.length > 0 && (
                      <div className="max-w-[384px] space-y-1">
                        <p className="text-xs text-black/40 font-medium">Sources:</p>
                        {message.sources.slice(0, 3).map((source, sourceIdx) => (
                          <div key={sourceIdx} className="bg-white/10 rounded-lg p-2 border border-black/5">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-black/50 font-medium">{source.collection_name}</span>
                              <span className="text-xs text-black/30">•</span>
                              <span className="text-xs text-black/30">{source.data_type}</span>
                              <span className="text-xs text-black/30">•</span>
                              <span className="text-xs text-black/30">{Math.round(source.score * 100)}%</span>
                            </div>
                            <p className="text-xs text-black/50 line-clamp-2">{source.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="px-3 py-2.5 bg-white/20 rounded-2xl max-w-[384px]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-black/30 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-black/30 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-black/30 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat Input */}
      <div className="absolute bottom-6 left-6 right-6">
        <ChatInput 
          onSendMessage={handleSendMessage} 
          disabled={isLoading}
          placeholder={selectedCollection 
            ? `Ask about "${selectedCollection}"...`
            : "Ask about your documents..."
          }
        />
      </div>
    </div>
  );
} 