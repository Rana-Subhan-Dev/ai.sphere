import { FC, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InteractionPreviewProps {
  isVisible: boolean;
  onClose: () => void;
  onActionClick?: (actionId: string) => void;
  previewText: string;
  isNodeSelected?: boolean;
}

const InteractionPreview: FC<InteractionPreviewProps> = ({
  isVisible,
  onClose,
  onActionClick,
  previewText,
  isNodeSelected = false
}) => {
  // Handle ESC key press
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault(); // Prevent other ESC handlers
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isVisible, handleKeyDown]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 flex flex-col items-center ${
            isNodeSelected 
              ? 'justify-center bg-white/95 backdrop-blur-[50px]' 
              : 'justify-center bg-transparent'
          }`}
          onClick={onClose}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Content container - prevent click propagation */}
          <motion.div 
            className="w-[100vw] h-[100v] pb-16 flex flex-col justify-center items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* "What's on your mind?" text */}
            {/* <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-[17px] text-black/80"
              transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
            >
              What's on your mind?
            </motion.div> */}

            {/* Gray blocks */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="inline-flex justify-start items-center gap-10"
              transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {[...Array(5)].map((_, index) => (
                <motion.div
                  key={index}
                  className="w-32 h-20 bg-[#d9d9d9]"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ 
                    duration: 0.4,
                    delay: 0.1 + (index * 0.05),
                    ease: [0.25, 0.1, 0.25, 1]
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InteractionPreview; 