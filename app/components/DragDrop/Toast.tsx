import React, { useEffect, useState } from 'react';
import { X, Undo2, CheckCircle } from 'lucide-react';

interface ToastProps {
  isVisible: boolean;
  fileName: string;
  onUndo: () => void;
  onDismiss: () => void;
  autoHideDuration?: number;
}

const Toast: React.FC<ToastProps> = ({ 
  isVisible, 
  fileName, 
  onUndo, 
  onDismiss, 
  autoHideDuration = 4000 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      
      // Auto-hide after duration
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, autoHideDuration]);

  const handleDismiss = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onDismiss();
    }, 300);
  };

  const handleUndo = () => {
    onUndo();
    handleDismiss();
  };

  if (!isVisible && !isAnimating) {
    return null;
  }

  return (
    <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[1200] pointer-events-auto">
      <div
        className={`
          transform transition-all duration-200 spring-animation
          ${isAnimating && isVisible 
            ? 'translate-y-0 opacity-100 scale-100' 
            : 'translate-y-[60px] opacity-0 scale-95'
          }
        `}
      >
        <div 
          className="bg-black/[3.5%] backdrop-blur-md rounded-full py-1.5 pl-2.5 pr-2.5 max-w-96"
          style={{
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05), 0 2px 8px rgba(0, 0, 0, 0.03)',
          }}
        >
          <div className="flex items-center justify-center gap-1.5">
            {/* Icon and content */}
            <div className="flex items-center gap-1.5 flex-1">
              <div className="rounded-md bg-white/95 h-[18px] w-[18px] flex-shrink-0 mt-0.5">
                {/* <CheckCircle size={20} className="text-green-500" /> */}
              </div>
              <div className="flex-1 min-w-0">
                {/* <p className="text-sm font-medium text-gray-900 mb-1">
                  File imported successfully
                </p> */}
                <p className="text-sm text-black/50 capitalized truncate">
                  {fileName}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            {/* <button
              onClick={handleUndo}
              className="flex-shrink-0 w-[14px] h-[14px] rounded-full flex items-center justify-center hover:bg-white/20 transition-colors duration-150"
            >
              <Undo2 size={14} className="text-black/40"/>
              
            </button> */}

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 w-[18px] h-[18px] rounded-full flex items-center justify-center bg-black/[3.5%] hover:bg-black/5 transition-colors duration-150"
            >
              <X size={14} className="text-black/20" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast; 