import { FC, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AgentIcon from './AgentIcon';
import ActionToolbar from './ActionToolbar';

interface AgentViewProps {
  isVisible: boolean;
  onClose: () => void;
  onActionClick?: (actionId: string) => void;
}

const AgentView: FC<AgentViewProps> = ({
  isVisible,
  onClose,
  onActionClick
}) => {
  // Handle ESC key press
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
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
          className="w-full h-full flex flex-col items-center justify-center"
          onClick={onClose}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Content container - prevent click propagation */}
          <motion.div 
            className="flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Large Agent Icon */}
            <AgentIcon 
              layoutId="main-agent-icon"
              className="mb-[100px]"
              style={{
                width: '45vh',
                height: '45vh',
              }}
            />

            {/* Action Toolbar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <ActionToolbar 
                isVisible={true}
                onActionClick={onActionClick}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AgentView; 