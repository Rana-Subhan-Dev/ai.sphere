import { FC } from 'react';
import { motion } from 'framer-motion';

interface AgentIconProps {
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  isMinimized?: boolean;
  layoutId?: string;
}

const AgentIcon: FC<AgentIconProps> = ({ 
  onClick, 
  className = '',
  style = {},
  isMinimized = false,
  layoutId
}) => {
  return (
    <motion.div 
      layoutId={layoutId}
      className={`
        bg-[rgba(255,255,255,0.1)] rounded-full 
        shadow-[0_0_39.71px_0_rgba(0,0,0,0.10),inset_-3.97px_3.97px_24px_0_rgba(255,255,255,1),inset_3.97px_-3.97px_24px_0_rgba(0,0,0,0.10)] 
        backdrop-blur-[49.64px] flex items-center justify-center cursor-pointer 
        transition-[background,box-shadow] duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]
        hover:bg-[rgba(255,255,255,0.18)] hover:shadow-[0_0_45px_0_rgba(0,0,0,0.15),inset_-3.97px_3.97px_28px_0_rgba(255,255,255,1),inset_3.97px_-3.97px_28px_0_rgba(0,0,0,0.15)] 
        ${className}
      `}
      onClick={onClick}
      style={{
        width: isMinimized ? '6px' : '48px',
        height: isMinimized ? '6px' : '48px',
        ...style
      }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <motion.img 
        layoutId={`${layoutId}-image`}
        src="/airis-figure-1.png" 
        alt="Airis Agent"
        className={`
          w-[58.33%] h-[58.33%] object-contain
          ${isMinimized ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}
        `}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      />
    </motion.div>
  );
};

export default AgentIcon; 