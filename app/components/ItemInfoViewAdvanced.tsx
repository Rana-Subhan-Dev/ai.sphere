'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  FileText, 
  Folder, 
  Brain, 
  Globe, 
  Layout, 
  Calendar,
  User,
  Tag,
  Eye,
  Link,
  Settings,
  Share2,
  Archive,
  Zap,
  BarChart3,
  Network,
  Clock,
  Users,
  Palette,
  Grid3X3,
  ChevronRight,
  ExternalLink,
  Download,
  Edit3,
  Trash2,
  Star,
  MoreHorizontal
} from 'lucide-react';

export type ItemType = 'element' | 'cluster' | 'cell' | 'sphere' | 'space';

export interface ItemInfoViewProps {
  itemType: ItemType;
  title: string;
  onClose?: () => void;
  className?: string;
  onAction?: (action: string) => void;
  customData?: {
    preview: string;
    sections: { id: string; title: string; infoRows: InfoRow[] }[];
    actions: ActionButton[];
  };
}

interface InfoRow {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  isLink?: boolean;
  isAction?: boolean;
  action?: string;
}

interface ActionButton {
  label: string;
  icon: React.ReactNode;
  action: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

const ItemInfoViewAdvanced: React.FC<ItemInfoViewProps> = ({ 
  itemType, 
  title, 
  onClose, 
  className,
  onAction,
  customData
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['key-info']));
  
  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onClose) {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);
  
  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleAction = (action: string) => {
    onAction?.(action);
  };

  // Get mock data and actions based on item type
  const getMockData = (): { 
    preview: string; 
    sections: { id: string; title: string; infoRows: InfoRow[] }[];
    actions: ActionButton[];
  } => {
    switch (itemType) {
      case 'element':
        return {
          preview: 'PDF Document',
          sections: [
            {
              id: 'key-info',
              title: 'Key Information',
              infoRows: [
                { label: 'Type', value: 'PDF Document', icon: <FileText size={14} /> },
                { label: 'Source', value: 'Uploaded by user', icon: <User size={14} /> },
                { label: 'Size', value: '2.4 MB', icon: <BarChart3 size={14} /> },
                { label: 'Format', value: 'PDF', icon: <FileText size={14} /> }
              ]
            },
            {
              id: 'metadata',
              title: 'Metadata',
              infoRows: [
                { label: 'Created', value: 'Dec 15, 2024', icon: <Calendar size={14} /> },
                { label: 'Modified', value: 'Dec 15, 2024', icon: <Clock size={14} /> },
                { label: 'Author', value: 'John Doe', icon: <User size={14} /> },
                { label: 'Tags', value: 'research, finance, analysis', icon: <Tag size={14} /> }
              ]
            },
            {
              id: 'usage',
              title: 'Usage & Connections',
              infoRows: [
                { label: 'Views', value: '24', icon: <Eye size={14} /> },
                { label: 'Linked Items', value: '3 clusters, 2 spheres', icon: <Link size={14} /> },
                { label: 'Related Actions', value: 'Summarize, Extract data', icon: <Zap size={14} />, isAction: true, action: 'summarize' }
              ]
            }
          ],
          actions: [
            { label: 'Download', icon: <Download size={16} />, action: 'download', variant: 'primary' },
            { label: 'Edit', icon: <Edit3 size={16} />, action: 'edit', variant: 'secondary' },
            { label: 'Share', icon: <Share2 size={16} />, action: 'share', variant: 'secondary' },
            { label: 'Delete', icon: <Trash2 size={16} />, action: 'delete', variant: 'danger' }
          ]
        };
      
      case 'cluster':
        return {
          preview: 'Research Collection',
          sections: [
            {
              id: 'overview',
              title: 'Contents Overview',
              infoRows: [
                { label: 'Description', value: 'Collection of research papers and analysis on market trends', icon: <FileText size={14} /> },
                { label: 'Total Items', value: '47 elements', icon: <BarChart3 size={14} /> },
                { label: 'Types', value: 'PDFs, Images, Notes', icon: <Folder size={14} /> }
              ]
            },
            {
              id: 'contents',
              title: 'Contents',
              infoRows: [
                { label: 'Most Recent', value: 'Market Analysis Q4', icon: <Clock size={14} /> },
                { label: 'Pinned Items', value: '3 items', icon: <Star size={14} /> },
                { label: 'Tags', value: 'research, market, analysis', icon: <Tag size={14} /> }
              ]
            },
            {
              id: 'connections',
              title: 'Connections',
              infoRows: [
                { label: 'Associated Cells', value: '5 cells', icon: <Brain size={14} /> },
                { label: 'Linked Spheres', value: '2 spheres', icon: <Globe size={14} /> },
                { label: 'Owner', value: 'Research Team', icon: <Users size={14} /> }
              ]
            }
          ],
          actions: [
            { label: 'Summarize', icon: <Zap size={16} />, action: 'summarize', variant: 'primary' },
            { label: 'Convert to Cell', icon: <Brain size={16} />, action: 'convert-cell', variant: 'secondary' },
            { label: 'Share', icon: <Share2 size={16} />, action: 'share', variant: 'secondary' },
            { label: 'Archive', icon: <Archive size={16} />, action: 'archive', variant: 'secondary' }
          ]
        };
      
      case 'cell':
        return {
          preview: 'Vector Knowledge',
          sections: [
            {
              id: 'core',
              title: 'Core Information',
              infoRows: [
                { label: 'Core Idea', value: 'Market volatility patterns in tech sector', icon: <Brain size={14} /> },
                { label: 'Embedding Style', value: 'Semantic clustering', icon: <Network size={14} /> },
                { label: 'Vector Strength', value: '0.87', icon: <BarChart3 size={14} /> }
              ]
            },
            {
              id: 'associations',
              title: 'Associations',
              infoRows: [
                { label: 'Associated Elements', value: '12 items (high weight)', icon: <Link size={14} /> },
                { label: 'Derived From', value: 'Market research cluster', icon: <Folder size={14} /> },
                { label: 'Related Cells', value: '8 semantic connections', icon: <Network size={14} /> }
              ]
            },
            {
              id: 'usage',
              title: 'Usage & Applications',
              infoRows: [
                { label: 'Usage Count', value: '156 times', icon: <Eye size={14} /> },
                { label: 'Last Updated', value: '2 hours ago', icon: <Clock size={14} /> },
                { label: 'Topics', value: 'finance, technology, volatility', icon: <Tag size={14} /> }
              ]
            }
          ],
          actions: [
            { label: 'Use in AI', icon: <Brain size={16} />, action: 'use-ai', variant: 'primary' },
            { label: 'Add to Sphere', icon: <Globe size={16} />, action: 'add-sphere', variant: 'secondary' },
            { label: 'Modify Vector', icon: <Settings size={16} />, action: 'modify-vector', variant: 'secondary' },
            { label: 'Export', icon: <Download size={16} />, action: 'export', variant: 'secondary' }
          ]
        };
      
      case 'sphere':
        return {
          preview: 'Smart Context',
          sections: [
            {
              id: 'overview',
              title: 'Sphere Overview',
              infoRows: [
                { label: 'Type', value: 'Research Sphere', icon: <Globe size={14} /> },
                { label: 'Purpose', value: 'Market analysis and investment research', icon: <FileText size={14} /> },
                { label: 'Activity Level', value: 'High (daily updates)', icon: <Zap size={14} /> }
              ]
            },
            {
              id: 'contents',
              title: 'Contents',
              infoRows: [
                { label: 'Contained Items', value: '23 elements, 5 clusters, 3 cells', icon: <BarChart3 size={14} /> },
                { label: 'Depth', value: 'Advanced (level 3)', icon: <BarChart3 size={14} /> },
                { label: 'Parent Space', value: 'Investment Dashboard', icon: <Layout size={14} /> }
              ]
            },
            {
              id: 'automation',
              title: 'Automation & Agents',
              infoRows: [
                { label: 'Active Programs', value: 'Auto-summarization, Trend alerts', icon: <Zap size={14} /> },
                { label: 'Linked Agents', value: 'Market Analyst, Data Processor', icon: <Brain size={14} /> },
                { label: 'Custom Settings', value: 'Auto-update enabled', icon: <Settings size={14} /> }
              ]
            }
          ],
          actions: [
            { label: 'Configure', icon: <Settings size={16} />, action: 'configure', variant: 'primary' },
            { label: 'View Graph', icon: <Network size={16} />, action: 'view-graph', variant: 'secondary' },
            { label: 'Export Data', icon: <Download size={16} />, action: 'export-data', variant: 'secondary' },
            { label: 'Share', icon: <Share2 size={16} />, action: 'share', variant: 'secondary' }
          ]
        };
      
      case 'space':
        return {
          preview: 'Visual Canvas',
          sections: [
            {
              id: 'configuration',
              title: 'Space Configuration',
              infoRows: [
                { label: 'Type', value: 'Mind Map Layout', icon: <Layout size={14} /> },
                { label: 'Purpose', value: 'Strategic planning and idea organization', icon: <FileText size={14} /> },
                { label: 'Mode', value: 'Explorer', icon: <Grid3X3 size={14} /> }
              ]
            },
            {
              id: 'contents',
              title: 'Contents & Tools',
              infoRows: [
                { label: 'Embedded Items', value: '4 spheres, 12 widgets', icon: <BarChart3 size={14} /> },
                { label: 'Tools Enabled', value: 'Drawing, Linking, Notes', icon: <Zap size={14} /> },
                { label: 'Theme', value: 'Dark mode, Blue accent', icon: <Palette size={14} /> }
              ]
            },
            {
              id: 'settings',
              title: 'Settings & Collaboration',
              infoRows: [
                { label: 'Scaling', value: '100% (default)', icon: <BarChart3 size={14} /> },
                { label: 'Collaboration', value: 'Real-time sharing', icon: <Share2 size={14} /> },
                { label: 'View Modes', value: 'Overview, Detail, Timeline', icon: <Eye size={14} /> }
              ]
            }
          ],
          actions: [
            { label: 'Open Space', icon: <Layout size={16} />, action: 'open-space', variant: 'primary' },
            { label: 'Customize', icon: <Settings size={16} />, action: 'customize', variant: 'secondary' },
            { label: 'Share', icon: <Share2 size={16} />, action: 'share', variant: 'secondary' },
            { label: 'Export', icon: <Download size={16} />, action: 'export', variant: 'secondary' }
          ]
        };
      
      default:
        return {
          preview: 'Unknown Item',
          sections: [],
          actions: []
        };
    }
  };

  const { preview, sections, actions } = customData || getMockData();

  return (
    <div className={cn("w-full flex flex-col justify-start items-center", className)}>
      {/* Preview Section */}
      <div className="sticky top-0 w-full h-[50vh] flex flex-col justify-center items-center gap-7">
        <div className="relative flex flex-col justify-start items-center gap-7">
          {/* Preview Placeholder */}
          <div className="w-64 h-44 px-6 py-3.5 bg-white/40 shadow-[0px_10px_60px_0px_rgba(0,0,0,0.10)] outline outline-4 outline-offset-[-4px] outline-white inline-flex justify-center items-center">
            <div className="text-center text-black/60 text-sm font-normal font-['Neue_Montreal']">
              {preview}
            </div>
          </div>
          {/* Title */}
          <div className="absolute -bottom-10 text-center text-black/40 text-sm font-normal font-['Neue_Montreal']">
            {title}
          </div>
        </div>
      </div>

      {/* Information Section */}
      <div className="z-10 w-full min-h-[calc(100vh-20px)] bg-black/5 border-t-[0.50px] border-black/10 backdrop-blur-[100px] flex flex-col justify-start items-center">
        {/* Action Buttons */}
        {actions.length > 0 && (
          <div className="w-full p-3 bg-white/10 border-b-[0.50px] border-black/10 flex justify-center gap-2">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleAction(action.action)}
                className={cn(
                  "w-32 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center justify-center gap-1.5",
                  action.variant === 'primary' && "bg-white/20 text-black/50 hover:bg-white/30",
                  action.variant === 'secondary' && "bg-white/20 text-black/50 hover:bg-white/30", 
                  action.variant === 'danger' && "bg-white/20 text-black/50 hover:bg-white/30"
                )}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        )}

        {/* Sections */}
        <div className="w-[50%] border-l-[0.50px] border-r-[0.50px] border-black/10">
          {sections.map((section, sectionIndex) => (
            <div key={section.id} className="w-full border-b-[0.50px] border-black/10">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className={cn(
                  "w-full px-3 py-2 bg-white/5 border-b-[0.50px] flex justify-between items-center hover:bg-white/10 transition-colors",
                  expandedSections.has(section.id) ? "border-black/10" : "border-black/0"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="justify-start text-black/50 text-sm font-regular font-['Neue_Montreal']">
                    {section.title}
                  </div>
                </div>
                <ChevronRight 
                  size={16} 
                  className={cn(
                    "text-black/40 transition-transform duration-300 ease-in-out",
                    expandedSections.has(section.id) && "rotate-90"
                  )}
                />
              </button>

              {/* Section Content */}
              <div 
                className={cn(
                  "transition-all duration-300 ease-in-out origin-top",
                  expandedSections.has(section.id) 
                    ? "opacity-100 max-h-[1000px]" // Adjust max-height based on your content
                    : "opacity-0 max-h-0 overflow-hidden"
                )}
              >
                <div className="bg-white/0 flex flex-col justify-start items-start">
                  {section.infoRows.map((row, rowIndex) => (
                    <div 
                      key={rowIndex}
                      className={cn(
                        "px-3 py-2 w-full inline-flex justify-start items-center gap-2",
                        rowIndex % 2 === 0 ? "bg-white/0" : "bg-white/15"
                      )}
                    >
                      <div className="w-5 h-5 bg-white/0 text-black/20 rounded-[8px] flex items-center justify-center">
                        {row.icon}
                      </div>
                      <div className="flex-1 justify-start text-black/60 text-xs font-normal font-['Neue_Montreal']">
                        {row.label}
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="justify-end text-black/60 text-xs font-normal font-['Neue_Montreal']">
                          {row.value}
                        </div>
                        {row.isLink && <ExternalLink size={12} className="text-black/40" />}
                        {row.isAction && (
                          <button
                            onClick={() => handleAction(row.action || '')}
                            className="ml-1 p-0.5 hover:bg-white/20 rounded transition-colors"
                          >
                            <Zap size={12} className="text-black/40" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ItemInfoViewAdvanced; 