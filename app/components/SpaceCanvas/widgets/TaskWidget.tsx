import React, { useState, useRef, useEffect } from 'react';
import { NodeProps, NodeResizer } from '@xyflow/react';

export interface TaskWidgetData {
  title: string;
  description?: string;
  type: 'task' | 'workflow' | 'project' | 'milestone' | 'reminder';
  status: 'pending' | 'in_progress' | 'waiting' | 'completed' | 'failed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: 'user' | 'agent' | 'team' | string;
  dueDate?: string;
  createdDate?: string;
  completedDate?: string;
  estimatedTime?: string;
  actualTime?: string;
  progress?: number; // 0-100
  tags?: string[];
  dependencies?: string[];
  subtasks?: Array<{
    id: string;
    title: string;
    status: 'pending' | 'completed';
  }>;
  context?: string;
  instructions?: string;
  resources?: Array<{
    type: 'file' | 'url' | 'app' | 'object';
    name: string;
    url?: string;
  }>;
  agentNotes?: string;
  isRecurring?: boolean;
  recurringPattern?: string;
  lastExecuted?: string;
  nextExecution?: string;
}

interface TaskWidgetProps extends Omit<NodeProps, 'data'> {
  data: TaskWidgetData;
}

const TaskWidget: React.FC<TaskWidgetProps> = ({ data, selected }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: data?.title || '',
    description: data?.description || '',
    instructions: data?.instructions || '',
  });
  const inputRef = useRef<HTMLInputElement>(null);

  // Ensure data has required fields
  const safeData = {
    ...data,
    type: data.type || 'task' as const,
    title: data.title || 'Untitled Task',
    status: data.status || 'pending' as const,
    priority: data.priority || 'medium' as const,
    assignee: data.assignee || 'user' as const,
    progress: data.progress !== undefined ? data.progress : 0,
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    // Update the data object
    Object.assign(data, editData);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setIsEditing(false);
      Object.assign(data, editData);
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditData({
        title: data?.title || '',
        description: data?.description || '',
        instructions: data?.instructions || '',
      });
    }
  };

  const handleTaskAction = () => {
    if (safeData.status === 'pending') {
      console.log(`Starting task: ${safeData.title}`);
      // Could trigger agent execution here
    } else if (safeData.status === 'in_progress') {
      console.log(`Viewing task details: ${safeData.title}`);
      // Could show detailed task view
    } else {
      console.log(`Reviewing task: ${safeData.title}`);
      // Could show task history/results
    }
  };

  const getTypeIcon = () => {
    const icons = {
      task: '✅',
      workflow: '🔄',
      project: '📋',
      milestone: '🎯',
      reminder: '⏰',
    };
    return icons[safeData.type] || icons.task;
  };

  const getTypeColor = () => {
    const colors = {
      task: '#3b82f6',
      workflow: '#8b5cf6',
      project: '#10b981',
      milestone: '#f59e0b',
      reminder: '#ef4444',
    };
    return colors[safeData.type] || colors.task;
  };

  const getStatusColor = () => {
    const colors = {
      pending: '#9ca3af',
      in_progress: '#3b82f6',
      waiting: '#f59e0b',
      completed: '#10b981',
      failed: '#ef4444',
      cancelled: '#6b7280',
    };
    return colors[safeData.status] || colors.pending;
  };

  const getStatusIcon = () => {
    const icons = {
      pending: '⏳',
      in_progress: '🔄',
      waiting: '⏸️',
      completed: '✅',
      failed: '❌',
      cancelled: '🚫',
    };
    return icons[safeData.status] || icons.pending;
  };

  const getPriorityColor = () => {
    const colors = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#f97316',
      urgent: '#ef4444',
    };
    return colors[safeData.priority] || colors.medium;
  };

  const getPriorityIcon = () => {
    const icons = {
      low: '🔽',
      medium: '➖',
      high: '🔼',
      urgent: '🚨',
    };
    return icons[safeData.priority] || icons.medium;
  };

  const getAssigneeIcon = () => {
    const icons = {
      user: '👤',
      agent: '🤖',
      team: '👥',
    };
    return icons[safeData.assignee as keyof typeof icons] || '👤';
  };

  const formatDate = (date?: string) => {
    if (!date) return null;
    try {
      return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return date;
    }
  };

  const formatTime = (time?: string) => {
    if (!time) return null;
    return time;
  };

  const renderProgressBar = () => {
    if (safeData.progress === undefined) return null;
    
    return (
      <div style={{
        width: '100%',
        height: '6px',
        backgroundColor: '#f3f4f6',
        borderRadius: '3px',
        overflow: 'hidden',
        marginTop: '8px',
      }}>
        <div
          style={{
            width: `${safeData.progress}%`,
            height: '100%',
            backgroundColor: getStatusColor(),
            borderRadius: '3px',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    );
  };

  const renderSubtasks = () => {
    if (!safeData.subtasks || safeData.subtasks.length === 0) return null;

    const completedCount = safeData.subtasks.filter(t => t.status === 'completed').length;
    const totalCount = safeData.subtasks.length;

    return (
      <div style={{ marginTop: '8px' }}>
        <div style={{
          fontSize: '11px',
          color: '#6b7280',
          fontWeight: '500',
          marginBottom: '4px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}>
          Subtasks ({completedCount}/{totalCount})
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {safeData.subtasks.slice(0, 3).map((subtask, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '10px',
                color: subtask.status === 'completed' ? '#10b981' : '#9ca3af',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              <span>{subtask.status === 'completed' ? '✅' : '⭕'}</span>
              <span style={{
                textDecoration: subtask.status === 'completed' ? 'line-through' : 'none',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {subtask.title}
              </span>
            </div>
          ))}
          {safeData.subtasks.length > 3 && (
            <div style={{
              fontSize: '10px',
              color: '#9ca3af',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}>
              +{safeData.subtasks.length - 3} more
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderResources = () => {
    if (!safeData.resources || safeData.resources.length === 0) return null;

    return (
      <div style={{ marginTop: '8px' }}>
        <div style={{
          fontSize: '11px',
          color: '#6b7280',
          fontWeight: '500',
          marginBottom: '4px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}>
          Resources
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {safeData.resources.slice(0, 3).map((resource, index) => {
            const resourceIcons = {
              file: '📄',
              url: '🌐',
              app: '📱',
              object: '📦',
            };
            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  padding: '2px 6px',
                  backgroundColor: `${getTypeColor()}15`,
                  borderRadius: '8px',
                  fontSize: '9px',
                  color: getTypeColor(),
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
              >
                <span>{resourceIcons[resource.type]}</span>
                <span>{resource.name}</span>
              </div>
            );
          })}
          {safeData.resources.length > 3 && (
            <span style={{
              fontSize: '9px',
              color: '#9ca3af',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}>
              +{safeData.resources.length - 3}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        width: '280px',
        minWidth: '280px',
        backgroundColor: '#ffffff',
        border: 'none',
        borderRadius: '20px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
        padding: '16px',
      }}
      onDoubleClick={handleDoubleClick}
      onClick={!isEditing ? handleTaskAction : undefined}
    >
      {/* <NodeResizer
        color={getTypeColor()}
        isVisible={selected}
        minWidth={250}
        minHeight={200}
        maxWidth={400}
        maxHeight={600}
      /> */}

      {/* Header with type, status, and priority */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '12px',
      }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{
            fontSize: '16px',
            color: getTypeColor(),
          }}>
            {getTypeIcon()}
          </div>
          <div style={{
            fontSize: '12px',
            color: getTypeColor(),
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}>
            {safeData.type}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <div style={{
            fontSize: '10px',
            color: getPriorityColor(),
          }}>
            {getPriorityIcon()}
          </div>
          <div style={{
            fontSize: '12px',
            color: getStatusColor(),
          }}>
            {getStatusIcon()}
          </div>
        </div>
      </div>

      {/* Task title */}
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editData.title}
          onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={{
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            padding: '6px 8px',
            fontSize: '16px',
            fontWeight: '600',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            outline: 'none',
            width: '100%',
            marginBottom: '8px',
          }}
        />
      ) : (
        <div
          style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#1f2937',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            lineHeight: '1.3',
            marginBottom: '8px',
          }}
        >
          {safeData.title}
        </div>
      )}

      {/* Description */}
      {safeData.description && (
        <div
          style={{
            fontSize: '13px',
            color: '#6b7280',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            lineHeight: '1.4',
            marginBottom: '12px',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {safeData.description}
        </div>
      )}

      {/* Progress bar */}
      {renderProgressBar()}

      {/* Status and assignee info */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '12px',
        marginBottom: '8px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <div style={{
            fontSize: '10px',
            color: getStatusColor(),
            fontWeight: '500',
            textTransform: 'capitalize',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}>
            {safeData.status.replace('_', ' ')}
          </div>
          {safeData.progress !== undefined && (
            <div style={{
              fontSize: '10px',
              color: '#9ca3af',
              fontFamily: 'SF Mono, Monaco, monospace',
            }}>
              {safeData.progress}%
            </div>
          )}
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          <div style={{ fontSize: '10px' }}>
            {getAssigneeIcon()}
          </div>
          <div style={{
            fontSize: '10px',
            color: '#9ca3af',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            textTransform: 'capitalize',
          }}>
            {safeData.assignee}
          </div>
        </div>
      </div>

      {/* Due date and time estimates */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '8px',
      }}>
        {safeData.dueDate && (
          <div style={{
            fontSize: '10px',
            color: '#9ca3af',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}>
            Due: {formatDate(safeData.dueDate)}
          </div>
        )}
        {safeData.estimatedTime && (
          <div style={{
            fontSize: '10px',
            color: '#9ca3af',
            fontFamily: 'SF Mono, Monaco, monospace',
          }}>
            Est: {formatTime(safeData.estimatedTime)}
          </div>
        )}
      </div>

      {/* Subtasks */}
      {renderSubtasks()}

      {/* Resources */}
      {renderResources()}

      {/* Tags */}
      {safeData.tags && safeData.tags.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px',
          marginTop: '8px',
        }}>
          {safeData.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              style={{
                backgroundColor: `${getTypeColor()}15`,
                color: getTypeColor(),
                padding: '2px 6px',
                borderRadius: '10px',
                fontSize: '9px',
                fontWeight: '500',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              {tag}
            </span>
          ))}
          {safeData.tags.length > 3 && (
            <span style={{
              color: '#9ca3af',
              fontSize: '9px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}>
              +{safeData.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Recurring indicator */}
      {safeData.isRecurring && (
        <div style={{
          position: 'absolute',
          bottom: '8px',
          right: '8px',
          fontSize: '10px',
          color: '#9ca3af',
        }}>
          🔄
        </div>
      )}

      {/* Agent notes indicator */}
      {safeData.agentNotes && (
        <div style={{
          position: 'absolute',
          bottom: '8px',
          right: safeData.isRecurring ? '28px' : '8px',
          fontSize: '10px',
          color: '#6366f1',
        }}>
          🤖
        </div>
      )}

      {/* Hover effect overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.03)',
          opacity: 0,
          transition: 'opacity 0.2s ease',
          borderRadius: 'inherit',
          pointerEvents: 'none',
        }}
        onMouseEnter={(e) => {
          if (!isEditing) e.currentTarget.style.opacity = '1';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0';
        }}
      />
    </div>
  );
};

export default TaskWidget; 