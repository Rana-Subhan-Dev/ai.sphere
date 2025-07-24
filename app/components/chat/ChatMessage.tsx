'use client';

interface ChatMessageProps {
  content: string;
  isUser: boolean;
  timestamp?: string;
}

export default function ChatMessage({ content, isUser, timestamp }: ChatMessageProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
      <div className={`
        px-4 py-3 flex flex-col gap-2.5 max-w-80
        ${isUser 
          ? 'bg-[#007aff] text-white' 
          : 'bg-black/5 text-black'
        }
        ${isUser 
          ? 'rounded-2xl rounded-br-md' 
          : 'rounded-2xl rounded-bl-md'
        }
      `}>
        <div className="text-[15px] font-normal font-['SF_Pro_Rounded'] leading-tight">
          {content}
        </div>
      </div>
      {timestamp && (
        <div className="px-2.5 flex items-center gap-1.5">
          <div className="w-4 h-4 bg-[#d9d9d9] rounded-full" />
          <div className="text-black/40 text-xs font-medium font-['SF_Pro_Rounded']">
            {timestamp}
          </div>
        </div>
      )}
    </div>
  );
} 