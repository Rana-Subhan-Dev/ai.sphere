import { FC } from 'react';
import { Download, Search, Wand2, Play, Network } from 'lucide-react';

interface ActionButton {
  id: string;
  icon: typeof Download;
  label: string;
  onClick?: () => void;
}

interface ActionToolbarProps {
  isVisible?: boolean;
  onActionClick?: (actionId: string) => void;
  className?: string;
}

const defaultActions: ActionButton[] = [
  {
    id: 'import',
    icon: Download,
    label: 'Import'
  },
  {
    id: 'search',
    icon: Search,
    label: 'Search'
  },
  {
    id: 'create',
    icon: Wand2,
    label: 'Create'
  },
  {
    id: 'execute',
    icon: Play,
    label: 'Execute'
  },
  {
    id: 'connect',
    icon: Network,
    label: 'Connect'
  }
];

const ActionToolbar: FC<ActionToolbarProps> = ({ 
  isVisible = true, 
  onActionClick,
  className = ''
}) => {
  const handleActionClick = (actionId: string) => {
    onActionClick?.(actionId);
  };

  return (
    <div 
      className={`
        justify-center items-center flex flex-col 
        transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] 
        will-change-transform will-change-opacity
        ${isVisible 
          ? 'opacity-100 scale-100' 
          : 'opacity-0 scale-95 pointer-events-none'
        }
        ${className}
      `}
    >
      <div className="inline-flex justify-center items-start gap-0.5 group hover:cursor-pointer">
        {defaultActions.map((action) => (
          <div 
            key={action.id}
            className="w-20 p-2.5 inline-flex flex-col justify-start items-center gap-3 group/item"
            onClick={() => handleActionClick(action.id)}
          >
            <div className="w-11 h-11 p-2.5 rounded-xl inline-flex justify-center items-center gap-1.5 transition-all duration-200 hover:outline hover:outline-[0.50px] hover:outline-black/15">
              <div className="w-4 h-4 relative overflow-hidden">
                <action.icon className="w-4 h-4 text-black/40 absolute left-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <div className="w-2 h-2 rounded-full bg-black/[7.5%] absolute left-1 top-1 group-hover:opacity-0 transition-opacity duration-200" />
              </div>
            </div>
            <div className="self-stretch text-center text-black/40 text-xs font-normal opacity-0 group-hover/item:opacity-100 transition-opacity duration-200">
              {action.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActionToolbar; 