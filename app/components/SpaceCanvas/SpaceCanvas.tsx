import React, { useCallback, useState, useEffect, useRef, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  useReactFlow,
  ReactFlowProvider,
  BackgroundVariant,
  SelectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import TextWidget from './widgets/TextWidget';
import NoteWidget from './widgets/NoteWidget';
import ShapeWidget from './widgets/ShapeWidget';
import URLWidget from './widgets/URLWidget';
import ObjectWidget from './widgets/ObjectWidget';
import AppWidget from './widgets/AppWidget';
import FileWidget from './widgets/FileWidget';
import TaskWidget from './widgets/TaskWidget';
import InfoActionWidget from './widgets/InfoActionWidget';
import AgentWidget from './widgets/AgentWidget';
import SphereWidget from './widgets/SphereWidget';
import SpaceWidget from './widgets/SpaceWidget';

import { CanvasDropZone } from '../DragDrop';
import { useDragDrop } from '../DragDrop';
import SpaceCanvasContextMenu from './SpaceCanvasContextMenu';

// Register custom node types
const nodeTypes = {
  text: TextWidget,
  note: NoteWidget,
  shape: ShapeWidget,
  url: URLWidget,
  object: ObjectWidget,
  app: AppWidget,
  file: FileWidget,
  task: TaskWidget,
  infoaction: InfoActionWidget,
  agent: AgentWidget,
  sphere: SphereWidget,
  space: SpaceWidget,
} as any; // Temporary type assertion to bypass TS errors

// Function to get widgets based on sphere/space name
const getWidgetsForSpace = (spaceName: string): Node[] => {
  switch (spaceName) {
    case 'Work Space':
      return getWorkSpaceWidgets();
    case 'Personal Space':
      return getPersonalSpaceWidgets();
    case 'Creative Hub':
      return getCreativeHubWidgets();
    case 'Learning Center':
      return getLearningCenterWidgets();
    case 'Project Vault':
      return getProjectVaultWidgets();
    case 'Social Network':
      return getSocialNetworkWidgets();
    case 'Health & Wellness':
      return getHealthWellnessWidgets();
    case 'Financial Planning':
      return getFinancialPlanningWidgets();
    default:
      return getWorkSpaceWidgets(); // Default fallback
  }
};

// WORK SPACE - Development, productivity, and professional tools
const getWorkSpaceWidgets = (): Node[] => [
    {
    id: 'work-1',
    type: 'app',
    position: { x: 200, y: 150 },
    data: {
      name: 'VS Code',
      description: 'Code editor',
      category: 'development' as const,
      iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg',
      url: 'https://code.visualstudio.com',
      isInstalled: true,
      isRunning: false,
      version: '1.85.1',
      developer: 'Microsoft',
      rating: 4.8,
      size: 'medium' as const,
    },
  },
  {
    id: 'work-2',
    type: 'app',
    position: { x: 600, y: 200 },
    data: {
      name: 'Slack',
      description: 'Team communication',
      category: 'communication' as const,
      iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/slack/slack-original.svg',
      url: 'https://slack.com',
      isInstalled: true,
      isRunning: true,
      version: '4.35.131',
      developer: 'Slack Technologies',
      rating: 4.4,
      size: 'small' as const,
    },
  },
  {
    id: 'work-3',
    type: 'task',
    position: { x: 350, y: 300 },
    data: {
      title: 'Complete project proposal',
      description: 'Finalize the Q1 project proposal and submit to stakeholders',
      priority: 'high' as const,
      status: 'in_progress' as const,
      dueDate: '2024-01-15',
      category: 'work',
      estimatedTime: '4 hours',
      assignee: 'John Doe',
      tags: ['proposal', 'q1', 'urgent'],
      progress: 75,
    },
  },
  {
    id: 'work-4',
    type: 'app',
    position: { x: 800, y: 150 },
    data: {
      name: 'Jira',
      description: 'Project management',
      category: 'productivity' as const,
      icon: '🎯',
      url: 'https://atlassian.com/jira',
      isInstalled: true,
      isRunning: true,
      version: '9.4.2',
      developer: 'Atlassian',
      rating: 4.3,
      size: 'large' as const,
    },
  },
  {
    id: 'work-5',
    type: 'task',
    position: { x: 1000, y: 250 },
    data: {
      title: 'Code review session',
      description: 'Review pull requests from team members',
      priority: 'medium' as const,
      status: 'pending' as const,
      dueDate: '2024-01-12',
      category: 'development',
      estimatedTime: '2 hours',
      tags: ['review', 'code', 'team'],
    },
  },
  {
    id: 'work-6',
    type: 'url',
    position: { x: 150, y: 450 },
    data: { 
      url: 'github.com/user/project',
      title: 'GitHub Repository',
      favicon: 'https://www.google.com/s2/favicons?domain=github.com&sz=32',
      description: 'Code repository and collaboration',
      status: 'loaded' as const,
      category: 'development' as const,
      lastVisited: new Date('2024-01-10'),
    },
  },
  {
    id: 'work-7',
    type: 'file',
    position: { x: 500, y: 400 },
    data: {
      fileName: 'sprint-planning.md',
      fileType: 'md' as const,
      fileSize: '28 KB',
      lastModified: '2024-01-09',
      content: '# Sprint Planning\n\n## Goals\n- Complete user authentication\n- Implement dashboard UI\n- Fix critical bugs\n\n## Timeline\n**Week 1**: Auth system\n**Week 2**: Dashboard\n**Week 3**: Bug fixes',
    },
  },
  {
    id: 'work-11',
    type: 'file',
    position: { x: 1200, y: 150 },
    data: {
      fileName: 'config.json',
      fileType: 'json' as const,
      fileSize: '4.2 KB',
      lastModified: '2024-01-10',
      content: '{\n  "name": "airis-app",\n  "version": "1.0.0",\n  "scripts": {\n    "dev": "next dev",\n    "build": "next build"\n  },\n  "dependencies": {\n    "react": "^18.0.0",\n    "next": "^14.0.0"\n  }\n}',
    },
  },
  {
    id: 'work-12',
    type: 'file',
    position: { x: 1400, y: 300 },
    data: {
      fileName: 'styles.css',
      fileType: 'css' as const,
      fileSize: '12.8 KB',
      lastModified: '2024-01-09',
      content: '.container {\n  display: flex;\n  flex-direction: column;\n  padding: 20px;\n  border-radius: 8px;\n  background: white;\n  box-shadow: 0 2px 8px rgba(0,0,0,0.1);\n}\n\n.header {\n  font-size: 24px;\n  font-weight: bold;\n  margin-bottom: 16px;\n}',
    },
  },
  {
    id: 'work-13',
    type: 'url',
    position: { x: 1600, y: 150 },
    data: { 
      url: 'figma.com/design/project',
      title: 'Design System - Airis',
      favicon: 'https://www.google.com/s2/favicons?domain=figma.com&sz=32',
      description: 'Design and prototyping tool',
      status: 'loaded' as const,
      category: 'productivity' as const,
      lastVisited: new Date('2024-01-08'),
    },
  },
  {
    id: 'work-14',
    type: 'file',
    position: { x: 800, y: 600 },
    data: {
      fileName: 'presentation.pdf',
      fileType: 'pdf' as const,
      fileSize: '2.4 MB',
      lastModified: '2024-01-07',
      description: 'Q1 Project Roadmap',
    },
  },
  {
    id: 'work-15',
    type: 'file',
    position: { x: 450, y: 500 },
    data: {
      fileName: 'Project Brief.bloc',
      fileType: 'bloc' as const,
      fileSize: '15 KB',
      lastModified: '2024-01-10',
      content: '# Airis Project Brief\n\nComplete workspace platform for modern productivity and collaboration.\n\n## Project Overview\nBuilding an innovative digital workspace that combines the flexibility of canvas-based organization with intelligent AI assistance.\n\n## Key Features\n- Multi-space organization\n- Drag & drop interface\n- AI agent integration\n- Real-time collaboration\n- Cross-platform support\n\n## Development Phases\n- [x] Core architecture\n- [x] Widget system\n- [ ] AI integration\n- [ ] Collaboration features\n- [ ] Mobile support\n\n## Team\n- **Lead Developer**: Full-stack development\n- **UI/UX Designer**: Interface design\n- **AI Specialist**: Agent integration\n\n> This project aims to revolutionize how teams organize and collaborate on complex projects.',
    },
  },
  {
    id: 'work-8',
    type: 'app',
    position: { x: 750, y: 400 },
    data: {
      name: 'Docker',
      description: 'Container platform',
      category: 'development' as const,
      icon: '🐳',
      url: 'https://docker.com',
      isInstalled: true,
      isRunning: false,
      version: '24.0.6',
      developer: 'Docker Inc.',
      rating: 4.6,
      size: 'large' as const,
    },
  },
  {
    id: 'work-9',
    type: 'task',
    position: { x: 200, y: 600 },
    data: {
      title: 'Update documentation',
      description: 'Update API documentation for new endpoints',
      priority: 'low' as const,
      status: 'pending' as const,
      dueDate: '2024-01-20',
      category: 'documentation',
      estimatedTime: '3 hours',
      tags: ['docs', 'api', 'update'],
    },
  },
  {
    id: 'work-10',
    type: 'infoaction',
    position: { x: 950, y: 500 },
    data: {
      type: 'tracker',
      category: 'productivity',
      title: 'Weekly Goals',
      description: '6/8 goals completed this week',
      status: 'active',
      progress: 75,
      lastUpdated: '2024-01-10T17:00:00Z',
      source: 'Productivity Tracker'
    },
  },
  {
    id: 'work-agent-1',
    type: 'agent',
    position: { x: 1500, y: 150 },
    data: {
      name: 'Code Assistant',
      type: 'specialist' as const,
      status: 'active' as const,
      description: 'AI assistant specialized in code review and debugging',
      capabilities: ['code-review', 'debugging', 'optimization'],
      model: 'GPT-4',
      lastActive: '2024-01-10T16:30:00Z',
    },
  },
  {
    id: 'work-sphere-1',
    type: 'sphere',
    position: { x: 1300, y: 450 },
    data: {
      name: 'Development Team',
      type: 'collaboration' as const,
      agentCount: 3,
      appCount: 5,
      isActive: true,
      description: 'Collaborative development environment with team agents and tools',
      lastActivity: '2024-01-10T17:00:00Z',
    },
  },
  {
    id: 'work-space-1',
    type: 'space',
    position: { x: 1600, y: 300 },
    data: {
      name: 'Project Alpha',
      type: 'workspace' as const,
      widgetCount: 12,
      isShared: true,
      lastModified: '2024-01-10T16:45:00Z',
      widgets: [
        { type: 'file', position: { x: 0, y: 0 } },
        { type: 'url', position: { x: 1, y: 0 } },
        { type: 'agent', position: { x: 2, y: 0 } },
        { type: 'task', position: { x: 0, y: 1 } },
        { type: 'note', position: { x: 1, y: 1 } },
        { type: 'app', position: { x: 2, y: 1 } },
      ],
    },
  },
];

// Initial edges for connections
const initialEdges: Edge[] = [];

// PERSONAL SPACE - Personal notes, reminders, and life organization
const getPersonalSpaceWidgets = (): Node[] => [
  {
    id: 'personal-1',
    type: 'text',
    position: { x: 300, y: 100 },
    data: { text: 'Welcome to your personal space!' },
  },
  {
    id: 'personal-2',
    type: 'note',
    position: { x: 700, y: 150 },
    data: { text: 'Remember to:\n• Call mom this weekend\n• Buy groceries\n• Plan weekend trip' },
  },
  {
    id: 'personal-3',
    type: 'infoaction',
    position: { x: 150, y: 300 },
    data: {
      type: 'reminder',
      category: 'personal',
      title: 'Daily Reflection',
      description: 'Take 10 minutes to reflect on the day',
      status: 'active',
      lastUpdated: '2024-01-10T10:30:00Z',
      source: 'Personal Assistant'
    },
  },
  {
    id: 'personal-4',
    type: 'task',
    position: { x: 500, y: 250 },
    data: {
      title: 'Plan weekend getaway',
      description: 'Research and book accommodation for weekend trip',
      priority: 'medium' as const,
      status: 'pending' as const,
      dueDate: '2024-01-15',
      category: 'personal',
      estimatedTime: '2 hours',
      tags: ['travel', 'weekend', 'planning'],
    },
  },
  {
    id: 'personal-5',
    type: 'note',
    position: { x: 900, y: 200 },
    data: { text: 'Grocery List:\n• Milk\n• Bread\n• Eggs\n• Vegetables\n• Fruits' },
  },
  {
    id: 'personal-6',
    type: 'app',
    position: { x: 250, y: 450 },
    data: {
      name: 'Calendar',
      description: 'Personal calendar & events',
      category: 'productivity' as const,
      icon: '📅',
      url: 'https://calendar.google.com',
      isInstalled: true,
      isRunning: true,
      version: '2024.01',
      developer: 'Google',
      rating: 4.6,
      size: 'medium' as const,
    },
  },
  {
    id: 'personal-7',
    type: 'file',
    position: { x: 650, y: 400 },
    data: {
      fileName: 'personal-goals.md',
      fileType: 'md' as const,
      fileSize: '12 KB',
      lastModified: '2024-01-08',
      content: '# 2024 Personal Goals\n\n## Health & Fitness\n- [ ] Exercise 3x per week\n- [ ] Drink 8 glasses of water daily\n- [x] Start morning routine\n\n## Learning\n- [ ] Complete online course\n- [ ] Read 24 books this year\n- [ ] Learn Spanish\n\n## Relationships\n- [ ] Call family weekly\n- [ ] Plan monthly friend meetups',
    },
  },
  {
    id: 'personal-11',
    type: 'url',
    position: { x: 1000, y: 300 },
    data: { 
      url: 'youtube.com/watch?v=example',
      title: 'Morning Yoga Routine',
      favicon: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=32',
      description: 'Video sharing platform',
      status: 'loaded' as const,
      category: 'entertainment' as const,
      lastVisited: new Date('2024-01-09'),
    },
  },
  {
    id: 'personal-12',
    type: 'file',
    position: { x: 1200, y: 200 },
    data: {
      fileName: 'vacation-photos.zip',
      fileType: 'zip' as const,
      fileSize: '145 MB',
      lastModified: '2024-01-05',
      description: 'Hawaii trip photos',
    },
  },
  {
    id: 'personal-13',
    type: 'file',
    position: { x: 850, y: 450 },
    data: {
      fileName: 'Life Plan.bloc',
      fileType: 'bloc' as const,
      fileSize: '8 KB',
      lastModified: '2024-01-09',
      content: '# Life Plan 2024\n\nThis is my structured approach to personal growth and goal achievement.\n\n## Core Values\n- Health and wellness\n- Continuous learning\n- Meaningful relationships\n- Professional growth\n\n## Monthly Objectives\n- [ ] Complete fitness challenge\n- [ ] Read 2 books\n- [ ] Connect with old friends\n- [x] Start meditation practice\n\n> Focus on progress, not perfection.',
    },
  },
  {
    id: 'personal-14',
    type: 'file',
    position: { x: 450, y: 700 },
    data: {
      fileName: 'favorite-recipes.docx',
      fileType: 'docx' as const,
      fileSize: '2.8 MB',
      lastModified: '2024-01-06',
      description: 'Collection of family recipes',
    },
  },
  {
    id: 'personal-14',
    type: 'url',
    position: { x: 1100, y: 500 },
    data: { 
      url: 'instagram.com/user',
      title: 'Instagram',
      favicon: 'https://www.google.com/s2/favicons?domain=instagram.com&sz=32',
      description: 'Photo and video sharing social networking service',
      status: 'loaded' as const,
      category: 'social' as const,
      lastVisited: new Date('2024-01-10'),
    },
  },
  {
    id: 'personal-8',
    type: 'task',
    position: { x: 800, y: 450 },
    data: {
      title: 'Read 30 minutes',
      description: 'Daily reading habit - fiction book',
      priority: 'low' as const,
      status: 'completed' as const,
      dueDate: '2024-01-10',
      category: 'self-improvement',
      estimatedTime: '30 minutes',
      tags: ['reading', 'habit', 'daily'],
    },
  },
  {
    id: 'personal-9',
    type: 'infoaction',
    position: { x: 400, y: 550 },
    data: {
      type: 'tracker',
      category: 'personal',
      title: 'Water Intake',
      description: '6/8 glasses today',
      status: 'active',
      progress: 75,
      lastUpdated: '2024-01-10T15:30:00Z',
      source: 'Health Tracker'
    },
  },
  {
    id: 'personal-10',
    type: 'note',
    position: { x: 100, y: 600 },
    data: { text: 'Ideas & Thoughts:\n• Start morning routine\n• Learn a new skill\n• Connect with old friends' },
  },
  {
    id: 'personal-agent-1',
    type: 'agent',
    position: { x: 1300, y: 150 },
    data: {
      name: 'Life Coach AI',
      type: 'assistant' as const,
      status: 'active' as const,
      description: 'Personal assistant for life organization and goal tracking',
      capabilities: ['scheduling', 'goal-tracking', 'habit-formation'],
      model: 'Claude',
      lastActive: '2024-01-10T18:00:00Z',
    },
  },
  {
    id: 'personal-sphere-1',
    type: 'sphere',
    position: { x: 1200, y: 400 },
    data: {
      name: 'Family Circle',
      type: 'collaboration' as const,
      agentCount: 2,
      appCount: 4,
      isActive: false,
      description: 'Family coordination and shared activities',
      lastActivity: '2024-01-09T20:30:00Z',
    },
  },
  {
    id: 'personal-space-1',
    type: 'space',
    position: { x: 1400, y: 300 },
    data: {
      name: 'Daily Routine',
      type: 'workspace' as const,
      widgetCount: 8,
      isShared: false,
      lastModified: '2024-01-10T07:00:00Z',
      widgets: [
        { type: 'task', position: { x: 0, y: 0 } },
        { type: 'note', position: { x: 1, y: 0 } },
        { type: 'file', position: { x: 2, y: 0 } },
        { type: 'agent', position: { x: 0, y: 1 } },
      ],
    },
  },
];

// CREATIVE HUB - Design, art, and creative projects
const getCreativeHubWidgets = (): Node[] => [
  {
    id: 'creative-1',
    type: 'app',
    position: { x: 200, y: 150 },
    data: {
      name: 'Figma',
      description: 'Collaborative design tool',
      category: 'design' as const,
      iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg',
      url: 'https://figma.com',
      isInstalled: true,
      isRunning: true,
      version: '116.15.5',
      developer: 'Figma Inc.',
      rating: 4.7,
      size: 'medium' as const,
    },
  },
  {
    id: 'creative-2',
    type: 'app',
    position: { x: 600, y: 200 },
    data: {
      name: 'Photoshop',
      description: 'Photo editing software',
      category: 'design' as const,
      icon: '🎨',
      url: 'https://adobe.com/photoshop',
      isInstalled: true,
      isRunning: false,
      version: '2024',
      developer: 'Adobe',
      rating: 4.5,
      size: 'large' as const,
    },
  },
  {
    id: 'creative-3',
    type: 'shape',
    position: { x: 400, y: 300 },
    data: { shapeType: 'rectangle', color: '#3b82f6', text: 'Design Ideas' },
  },
  {
    id: 'creative-4',
    type: 'object',
    position: { x: 800, y: 250 },
    data: {
      type: 'media' as const,
      title: 'Creative Inspiration Board',
      subtitle: 'Mood Board Collection',
      description: 'A curated collection of visual inspiration for upcoming projects.',
      image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400&h=300&fit=crop',
      tags: ['design', 'inspiration', 'mood-board'],
      metadata: { items: '24 images', category: 'Visual Design' },
      status: 'active' as const,
    },
  },
  {
    id: 'creative-5',
    type: 'shape',
    position: { x: 300, y: 500 },
    data: { shapeType: 'circle', color: '#ef4444', text: 'Color Palette' },
  },
  {
    id: 'creative-6',
    type: 'file',
    position: { x: 150, y: 400 },
    data: {
      fileName: 'brand-guidelines.pdf',
      fileType: 'pdf' as const,
      fileSize: '2.3 MB',
      lastModified: '2024-01-09',
      status: 'synced' as const,
    },
  },
  {
    id: 'creative-7',
    type: 'app',
    position: { x: 700, y: 450 },
    data: {
      name: 'Sketch',
      description: 'Vector graphics editor',
      category: 'design' as const,
      icon: '💎',
      url: 'https://sketch.com',
      isInstalled: false,
      isRunning: false,
      version: '99.1',
      developer: 'Sketch B.V.',
      rating: 4.4,
      size: 'medium' as const,
    },
  },
  {
    id: 'creative-8',
    type: 'task',
    position: { x: 950, y: 400 },
    data: {
      title: 'Logo design concepts',
      description: 'Create 3 logo variations for client project',
      priority: 'high' as const,
      status: 'in_progress' as const,
      dueDate: '2024-01-13',
      category: 'design',
      estimatedTime: '4 hours',
      tags: ['logo', 'branding', 'client'],
      progress: 60,
    },
  },
  {
    id: 'creative-9',
    type: 'url',
    position: { x: 500, y: 600 },
    data: {
      url: 'dribbble.com',
      title: 'Dribbble - Design Inspiration',
      favicon: 'https://www.google.com/s2/favicons?domain=dribbble.com&sz=32',
      description: 'Design community and inspiration',
      status: 'loaded' as const,
    },
  },
  {
    id: 'creative-10',
    type: 'object',
    position: { x: 100, y: 250 },
    data: {
      type: 'project' as const,
      title: 'Website Redesign',
      subtitle: 'Portfolio Project',
      description: 'Complete redesign of personal portfolio website',
      image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400&h=300&fit=crop',
      tags: ['web', 'portfolio', 'redesign'],
      metadata: { status: 'In Progress', completion: '40%' },
      status: 'active' as const,
    },
  },
  {
    id: 'creative-agent-1',
    type: 'agent',
    position: { x: 1100, y: 150 },
    data: {
      name: 'Design Assistant',
      type: 'specialist' as const,
      status: 'active' as const,
      description: 'AI assistant specialized in design critique and color theory',
      capabilities: ['design-critique', 'color-theory', 'typography'],
      model: 'Claude',
      lastActive: '2024-01-10T16:45:00Z',
    },
  },
  {
    id: 'creative-sphere-1',
    type: 'sphere',
    position: { x: 1200, y: 350 },
    data: {
      name: 'Creative Studio',
      type: 'workspace' as const,
      agentCount: 1,
      appCount: 6,
      isActive: true,
      description: 'Creative workspace with design tools and inspiration',
      lastActivity: '2024-01-10T17:30:00Z',
    },
  },
  {
    id: 'creative-space-1',
    type: 'space',
    position: { x: 1000, y: 500 },
    data: {
      name: 'Brand Project',
      type: 'workspace' as const,
      widgetCount: 15,
      isShared: true,
      lastModified: '2024-01-10T14:20:00Z',
      widgets: [
        { type: 'file', position: { x: 0, y: 0 } },
        { type: 'app', position: { x: 1, y: 0 } },
        { type: 'agent', position: { x: 2, y: 0 } },
        { type: 'url', position: { x: 0, y: 1 } },
        { type: 'task', position: { x: 1, y: 1 } },
        { type: 'note', position: { x: 2, y: 1 } },
      ],
    },
  },
];

// LEARNING CENTER - Educational content, courses, and research
const getLearningCenterWidgets = (): Node[] => [
  {
    id: 'learning-1',
    type: 'url',
    position: { x: 300, y: 150 },
    data: {
      url: 'coursera.org',
      title: 'Machine Learning Course',
      favicon: 'https://www.google.com/s2/favicons?domain=coursera.org&sz=32',
      description: 'Andrew Ng\'s Machine Learning Course',
      status: 'loaded' as const,
    },
  },
  {
    id: 'learning-2',
    type: 'object',
    position: { x: 650, y: 200 },
    data: {
      type: 'paper' as const,
      title: 'Attention Is All You Need',
      subtitle: 'Vaswani et al., 2017',
      description: 'The foundational paper that introduced the Transformer architecture.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
      url: 'https://arxiv.org/abs/1706.03762',
      tags: ['transformer', 'attention', 'NLP'],
      metadata: { citations: '89,000+', year: '2017', venue: 'NIPS' },
      status: 'active' as const,
    },
  },
  {
    id: 'learning-3',
    type: 'app',
    position: { x: 150, y: 300 },
    data: {
      name: 'Khan Academy',
      description: 'Free online courses',
      category: 'education' as const,
      icon: '🎓',
      url: 'https://khanacademy.org',
      isInstalled: false,
      isRunning: false,
      version: '7.3.2',
      developer: 'Khan Academy',
      rating: 4.8,
      size: 'medium' as const,
    },
  },
  {
    id: 'learning-4',
    type: 'file',
    position: { x: 800, y: 350 },
    data: {
      fileName: 'research-notes.md',
      fileType: 'markdown' as const,
      fileSize: '45 KB',
      lastModified: '2024-01-10',
      status: 'synced' as const,
    },
  },
  {
    id: 'learning-5',
    type: 'task',
    position: { x: 450, y: 400 },
    data: {
      title: 'Complete Python course',
      description: 'Finish remaining chapters of Python fundamentals',
      priority: 'medium' as const,
      status: 'in_progress' as const,
      dueDate: '2024-01-25',
      category: 'learning',
      estimatedTime: '10 hours',
      tags: ['python', 'programming', 'course'],
      progress: 65,
    },
  },
  {
    id: 'learning-6',
    type: 'url',
    position: { x: 200, y: 500 },
    data: {
      url: 'youtube.com',
      title: 'Educational YouTube Playlist',
      favicon: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=32',
      description: 'Curated learning videos',
      status: 'loaded' as const,
    },
  },
  {
    id: 'learning-7',
    type: 'app',
    position: { x: 700, y: 500 },
    data: {
      name: 'Anki',
      description: 'Spaced repetition flashcards',
      category: 'education' as const,
      icon: '🗂️',
      url: 'https://apps.ankiweb.net',
      isInstalled: true,
      isRunning: false,
      version: '2.1.66',
      developer: 'Ankitects Pty Ltd',
      rating: 4.6,
      size: 'small' as const,
    },
  },
  {
    id: 'learning-8',
    type: 'note',
    position: { x: 900, y: 150 },
    data: { text: 'Learning Goals 2024:\n• Master React hooks\n• Learn TypeScript\n• Study data structures\n• Practice algorithms' },
  },
  {
    id: 'learning-9',
    type: 'object',
    position: { x: 550, y: 600 },
    data: {
      type: 'course' as const,
      title: 'Advanced JavaScript',
      subtitle: 'Frontend Masters',
      description: 'Deep dive into JavaScript concepts and patterns',
      price: '$39/month',
      rating: 4.9,
      tags: ['javascript', 'advanced', 'frontend'],
      metadata: { duration: '8 hours', difficulty: 'Advanced' },
      status: 'enrolled' as const,
    },
  },
  {
    id: 'learning-10',
    type: 'file',
    position: { x: 350, y: 250 },
    data: {
      fileName: 'algorithms-cheatsheet.pdf',
      fileType: 'pdf' as const,
      fileSize: '1.2 MB',
      lastModified: '2024-01-07',
      status: 'synced' as const,
    },
  },
];

// PROJECT VAULT - Project files, specifications, and development resources
const getProjectVaultWidgets = (): Node[] => [
  {
    id: 'project-1',
    type: 'file',
    position: { x: 200, y: 150 },
    data: {
      fileName: 'project-specs.md',
      fileType: 'markdown' as const,
      fileSize: '45 KB',
      lastModified: '2024-01-10',
      status: 'synced' as const,
    },
  },
  {
    id: 'project-2',
    type: 'object',
    position: { x: 600, y: 200 },
    data: {
      type: 'project' as const,
      title: 'AI Assistant Platform',
      subtitle: 'Q1 2024 Initiative',
      description: 'Comprehensive platform for building intelligent AI assistants with natural language processing.',
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop',
      tags: ['ai', 'platform', 'nlp', 'assistant'],
      metadata: { status: 'In Development', team: '8 members', progress: '65%' },
      status: 'active' as const,
    },
  },
  {
    id: 'project-3',
    type: 'app',
    position: { x: 350, y: 350 },
    data: {
      name: 'Notion',
      description: 'Project documentation',
      category: 'productivity' as const,
      icon: '📝',
      url: 'https://notion.so',
      isInstalled: true,
      isRunning: true,
      version: '2.28.0',
      developer: 'Notion Labs',
      rating: 4.7,
      size: 'medium' as const,
    },
  },
  {
    id: 'project-4',
    type: 'file',
    position: { x: 800, y: 300 },
    data: {
      fileName: 'architecture-diagram.png',
      fileType: 'image' as const,
      fileSize: '850 KB',
      lastModified: '2024-01-09',
      status: 'synced' as const,
    },
  },
  {
    id: 'project-5',
    type: 'task',
    position: { x: 150, y: 450 },
    data: {
      title: 'Database schema design',
      description: 'Design and implement database schema for user management',
      priority: 'high' as const,
      status: 'pending' as const,
      dueDate: '2024-01-16',
      category: 'backend',
      estimatedTime: '6 hours',
      tags: ['database', 'schema', 'backend'],
    },
  },
  {
    id: 'project-6',
    type: 'url',
    position: { x: 500, y: 500 },
    data: { 
      url: 'figma.com/project-wireframes',
      title: 'Project Wireframes',
      favicon: 'https://www.google.com/s2/favicons?domain=figma.com&sz=32',
      description: 'UI/UX wireframes and mockups',
      status: 'loaded' as const,
    },
  },
  {
    id: 'project-7',
    type: 'app',
    position: { x: 750, y: 450 },
    data: {
      name: 'Postman',
      description: 'API development tool',
      category: 'development' as const,
      icon: '🚀',
      url: 'https://postman.com',
      isInstalled: true,
      isRunning: false,
      version: '10.20.0',
      developer: 'Postman Inc.',
      rating: 4.5,
      size: 'large' as const,
    },
  },
  {
    id: 'project-8',
    type: 'file',
    position: { x: 900, y: 200 },
    data: {
      fileName: 'api-documentation.json',
      fileType: 'json' as const,
      fileSize: '156 KB',
      lastModified: '2024-01-11',
      status: 'synced' as const,
    },
  },
  {
    id: 'project-9',
    type: 'task',
    position: { x: 300, y: 600 },
    data: {
      title: 'Set up CI/CD pipeline',
      description: 'Configure automated testing and deployment pipeline',
      priority: 'medium' as const,
      status: 'in_progress' as const,
      dueDate: '2024-01-18',
      category: 'devops',
      estimatedTime: '4 hours',
      tags: ['ci/cd', 'automation', 'deployment'],
      progress: 30,
    },
  },
  {
    id: 'project-10',
    type: 'object',
    position: { x: 650, y: 550 },
    data: {
      type: 'milestone' as const,
      title: 'MVP Release',
      subtitle: 'Version 1.0',
      description: 'First public release of the platform with core features',
      tags: ['mvp', 'release', 'milestone'],
      metadata: { target_date: '2024-02-15', features: '12 core features' },
      status: 'upcoming' as const,
    },
  },
];

// SOCIAL NETWORK - Communication, collaboration, and social apps
const getSocialNetworkWidgets = (): Node[] => [
  {
    id: 'social-1',
    type: 'app',
    position: { x: 200, y: 150 },
    data: {
      name: 'Discord',
      description: 'Voice, video and text communication',
      category: 'communication' as const,
      icon: '🎮',
      url: 'https://discord.com',
      isInstalled: true,
      isRunning: false,
      version: '1.0.9032',
      developer: 'Discord Inc.',
      rating: 4.5,
      size: 'large' as const,
    },
  },
  {
    id: 'social-2',
    type: 'infoaction',
    position: { x: 550, y: 200 },
    data: {
      type: 'feed',
      category: 'social',
      title: 'Social Updates',
      description: 'Latest posts from your network',
      status: 'active',
      lastUpdated: '2024-01-10T14:30:00Z',
      source: 'Social Feed'
    },
  },
  {
    id: 'social-3',
    type: 'app',
    position: { x: 350, y: 350 },
    data: {
      name: 'Teams',
      description: 'Microsoft Teams collaboration',
      category: 'communication' as const,
      icon: '👥',
      url: 'https://teams.microsoft.com',
      isInstalled: true,
      isRunning: true,
      version: '1.6.00.4472',
      developer: 'Microsoft',
      rating: 4.2,
      size: 'large' as const,
    },
  },
  {
    id: 'social-4',
    type: 'app',
    position: { x: 800, y: 250 },
    data: {
      name: 'Twitter',
      description: 'Social media platform',
      category: 'social' as const,
      icon: '🐦',
      url: 'https://twitter.com',
      isInstalled: false,
      isRunning: false,
      version: '9.95.0',
      developer: 'Twitter Inc.',
      rating: 3.8,
      size: 'medium' as const,
    },
  },
  {
    id: 'social-5',
    type: 'task',
    position: { x: 150, y: 450 },
    data: {
      title: 'Team standup meeting',
      description: 'Daily team sync and progress updates',
      priority: 'high' as const,
      status: 'scheduled' as const,
      dueDate: '2024-01-11',
      category: 'meeting',
      estimatedTime: '30 minutes',
      tags: ['standup', 'team', 'daily'],
    },
  },
  {
    id: 'social-6',
    type: 'url',
    position: { x: 700, y: 400 },
    data: { 
      url: 'linkedin.com',
      title: 'LinkedIn Professional Network',
      favicon: 'https://www.google.com/s2/favicons?domain=linkedin.com&sz=32',
      description: 'Professional networking platform',
      status: 'loaded' as const,
    },
  },
  {
    id: 'social-7',
    type: 'infoaction',
    position: { x: 450, y: 500 },
    data: {
      type: 'notification',
      category: 'social',
      title: 'Team Messages',
      description: '5 unread messages in #general',
      status: 'active',
      lastUpdated: '2024-01-10T16:15:00Z',
      source: 'Slack Workspace'
    },
  },
  {
    id: 'social-8',
    type: 'app',
    position: { x: 900, y: 450 },
    data: {
      name: 'Zoom',
      description: 'Video conferencing',
      category: 'communication' as const,
      icon: '📹',
      url: 'https://zoom.us',
      isInstalled: true,
      isRunning: false,
      version: '5.16.10',
      developer: 'Zoom Video Communications',
      rating: 4.4,
      size: 'large' as const,
    },
  },
  {
    id: 'social-9',
    type: 'task',
    position: { x: 250, y: 600 },
    data: {
      title: 'Network with industry peers',
      description: 'Reach out to 3 professionals on LinkedIn',
      priority: 'low' as const,
      status: 'pending' as const,
      dueDate: '2024-01-20',
      category: 'networking',
      estimatedTime: '1 hour',
      tags: ['networking', 'linkedin', 'professional'],
    },
  },
  {
    id: 'social-10',
    type: 'note',
    position: { x: 600, y: 550 },
    data: { text: 'Community Contacts:\n• Tech meetup organizer\n• Design community leader\n• Startup mentor\n• Alumni network' },
  },
  {
    id: 'social-agent-1',
    type: 'agent',
    position: { x: 1000, y: 150 },
    data: {
      name: 'Social Media Manager',
      type: 'specialist' as const,
      status: 'active' as const,
      description: 'AI assistant for managing social media presence and engagement',
      capabilities: ['content-scheduling', 'engagement-tracking', 'trend-analysis'],
      model: 'GPT-4',
      lastActive: '2024-01-10T17:15:00Z',
    },
  },
  {
    id: 'social-sphere-1',
    type: 'sphere',
    position: { x: 1100, y: 350 },
    data: {
      name: 'Community Hub',
      type: 'collaboration' as const,
      agentCount: 4,
      appCount: 7,
      isActive: true,
      description: 'Social networking and community management sphere',
      lastActivity: '2024-01-10T18:00:00Z',
    },
  },
  {
    id: 'social-space-1',
    type: 'space',
    position: { x: 950, y: 500 },
    data: {
      name: 'Team Workspace',
      type: 'collaboration' as const,
      widgetCount: 20,
      isShared: true,
      lastModified: '2024-01-10T17:45:00Z',
      widgets: [
        { type: 'agent', position: { x: 0, y: 0 } },
        { type: 'sphere', position: { x: 1, y: 0 } },
        { type: 'app', position: { x: 2, y: 0 } },
        { type: 'task', position: { x: 0, y: 1 } },
        { type: 'url', position: { x: 1, y: 1 } },
        { type: 'note', position: { x: 2, y: 1 } },
      ],
    },
  },
];

// HEALTH & WELLNESS - Fitness, health tracking, and wellness activities
const getHealthWellnessWidgets = (): Node[] => [
  {
    id: 'health-1',
    type: 'infoaction',
    position: { x: 200, y: 150 },
    data: {
      type: 'tracker',
      category: 'health',
      title: 'Daily Steps',
      description: '8,247 steps today',
      status: 'active',
      progress: 82,
      lastUpdated: '2024-01-10T16:45:00Z',
      source: 'Health App'
    },
  },
  {
    id: 'health-2',
    type: 'task',
    position: { x: 550, y: 200 },
    data: {
      title: 'Morning meditation',
      description: '15-minute mindfulness session',
      priority: 'medium' as const,
      status: 'completed' as const,
      dueDate: '2024-01-10',
      category: 'wellness',
      estimatedTime: '15 minutes',
      tags: ['meditation', 'mindfulness', 'morning'],
    },
  },
  {
    id: 'health-3',
    type: 'app',
    position: { x: 350, y: 350 },
    data: {
      name: 'MyFitnessPal',
      description: 'Calorie & nutrition tracking',
      category: 'health' as const,
      icon: '🍎',
      url: 'https://myfitnesspal.com',
      isInstalled: true,
      isRunning: false,
      version: '23.24.0',
      developer: 'MyFitnessPal Inc.',
      rating: 4.3,
      size: 'medium' as const,
    },
  },
  {
    id: 'health-4',
    type: 'infoaction',
    position: { x: 800, y: 250 },
    data: {
      type: 'tracker',
      category: 'health',
      title: 'Sleep Quality',
      description: '7.5 hours last night',
      status: 'good',
      progress: 94,
      lastUpdated: '2024-01-10T07:30:00Z',
      source: 'Sleep Tracker'
    },
  },
  {
    id: 'health-5',
    type: 'task',
    position: { x: 150, y: 450 },
    data: {
      title: 'Gym workout',
      description: 'Upper body strength training session',
      priority: 'high' as const,
      status: 'scheduled' as const,
      dueDate: '2024-01-11',
      category: 'fitness',
      estimatedTime: '1 hour',
      tags: ['gym', 'strength', 'upper-body'],
    },
  },
  {
    id: 'health-6',
    type: 'app',
    position: { x: 700, y: 400 },
    data: {
      name: 'Headspace',
      description: 'Meditation & mindfulness',
      category: 'wellness' as const,
      icon: '🧘',
      url: 'https://headspace.com',
      isInstalled: true,
      isRunning: false,
      version: '4.104.0',
      developer: 'Headspace Inc.',
      rating: 4.7,
      size: 'medium' as const,
    },
  },
  {
    id: 'health-7',
    type: 'infoaction',
    position: { x: 450, y: 500 },
    data: {
      type: 'reminder',
      category: 'health',
      title: 'Take Vitamins',
      description: 'Daily vitamin D and multivitamin',
      status: 'pending',
      lastUpdated: '2024-01-10T08:00:00Z',
      source: 'Health Reminders'
    },
  },
  {
    id: 'health-8',
    type: 'note',
    position: { x: 900, y: 450 },
    data: { text: 'Health Goals:\n• Exercise 4x/week\n• 8 hours sleep\n• 10k steps daily\n• Meditate 15min\n• Drink 8 glasses water' },
  },
  {
    id: 'health-9',
    type: 'task',
    position: { x: 250, y: 600 },
    data: {
      title: 'Meal prep Sunday',
      description: 'Prepare healthy meals for the week',
      priority: 'medium' as const,
      status: 'pending' as const,
      dueDate: '2024-01-14',
      category: 'nutrition',
      estimatedTime: '2 hours',
      tags: ['meal-prep', 'nutrition', 'weekly'],
    },
  },
  {
    id: 'health-10',
    type: 'object',
    position: { x: 600, y: 550 },
    data: {
      type: 'metrics' as const,
      title: 'Weekly Health Report',
      subtitle: 'January Week 2',
      description: 'Summary of health metrics and wellness activities',
      tags: ['health', 'weekly', 'metrics'],
      metadata: { avg_steps: '9,200', sleep_score: '85', workout_days: '4' },
      status: 'excellent' as const,
    },
  },
];

// FINANCIAL PLANNING - Financial tools, budgeting, and money management
const getFinancialPlanningWidgets = (): Node[] => [
  {
    id: 'finance-1',
    type: 'url',
    position: { x: 200, y: 150 },
    data: { 
      url: 'dashboard.stripe.com',
      title: 'Stripe Dashboard',
      favicon: 'https://www.google.com/s2/favicons?domain=dashboard.stripe.com&sz=32',
      description: 'Manage your Stripe account & payments',
      status: 'loaded' as const,
    },
  },
  {
    id: 'finance-2',
    type: 'app',
    position: { x: 600, y: 200 },
    data: {
      name: 'Analytics',
      description: 'Financial data insights',
      category: 'analytics' as const,
      icon: '📊',
      url: 'https://analytics.google.com',
      isInstalled: false,
      isRunning: false,
      version: '2.4.1',
      developer: 'Google',
      rating: 4.3,
      size: 'large' as const,
    },
  },
  {
    id: 'finance-3',
    type: 'object',
    position: { x: 350, y: 300 },
    data: {
      type: 'financial' as const,
      title: 'Monthly Budget Overview',
      subtitle: 'January 2024',
      description: 'Track spending across categories and monitor savings goals',
      price: '$3,247 spent / $4,500 budget',
      rating: 4.2,
      tags: ['budget', 'spending', 'savings'],
      metadata: { remaining: '$1,253', categories: '8', savings_rate: '22%' },
      status: 'on_track' as const,
    },
  },
  {
    id: 'finance-4',
    type: 'app',
    position: { x: 800, y: 250 },
    data: {
      name: 'Mint',
      description: 'Personal finance management',
      category: 'finance' as const,
      icon: '💰',
      url: 'https://mint.com',
      isInstalled: true,
      isRunning: true,
      version: '8.23.0',
      developer: 'Intuit Inc.',
      rating: 4.1,
      size: 'medium' as const,
    },
  },
  {
    id: 'finance-5',
    type: 'task',
    position: { x: 150, y: 450 },
    data: {
      title: 'Review investment portfolio',
      description: 'Quarterly review of investment performance and rebalancing',
      priority: 'medium' as const,
      status: 'pending' as const,
      dueDate: '2024-01-31',
      category: 'investments',
      estimatedTime: '2 hours',
      tags: ['investments', 'portfolio', 'review'],
    },
  },
  {
    id: 'finance-6',
    type: 'url',
    position: { x: 500, y: 450 },
    data: {
      url: 'robinhood.com',
      title: 'Robinhood Trading',
      favicon: 'https://www.google.com/s2/favicons?domain=robinhood.com&sz=32',
      description: 'Stock trading and investment platform',
      status: 'loaded' as const,
    },
  },
  {
    id: 'finance-7',
    type: 'file',
    position: { x: 750, y: 400 },
    data: {
      fileName: 'tax-documents-2024.pdf',
      fileType: 'pdf' as const,
      fileSize: '3.2 MB',
      lastModified: '2024-01-10',
      status: 'synced' as const,
    },
  },
  {
    id: 'finance-8',
    type: 'infoaction',
    position: { x: 900, y: 500 },
    data: {
      type: 'tracker',
      category: 'finance',
      title: 'Savings Goal',
      description: '$15,200 / $20,000 emergency fund',
      status: 'active',
      progress: 76,
      lastUpdated: '2024-01-10T18:00:00Z',
      source: 'Savings Tracker'
    },
  },
  {
    id: 'finance-9',
    type: 'task',
    position: { x: 250, y: 600 },
    data: {
      title: 'Pay monthly bills',
      description: 'Review and pay all recurring monthly expenses',
      priority: 'high' as const,
      status: 'pending' as const,
      dueDate: '2024-01-15',
      category: 'bills',
      estimatedTime: '30 minutes',
      tags: ['bills', 'monthly', 'recurring'],
    },
  },
  {
    id: 'finance-10',
    type: 'note',
    position: { x: 450, y: 550 },
    data: { text: 'Financial Goals 2024:\n• Build 6-month emergency fund\n• Max out 401k contribution\n• Increase investment portfolio\n• Reduce monthly expenses by 10%' },
  },
];

interface SpaceCanvasProps {
  spaceName: string;
  onClose: () => void;
}

const SpaceCanvasInner: React.FC<SpaceCanvasProps> = ({ spaceName, onClose }) => {
  // Get widgets for the current space
  const initialNodes = getWidgetsForSpace(spaceName);
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [clipboard, setClipboard] = useState<Node[]>([]); // Clipboard for copy/paste
  const { zoomIn, zoomOut, setViewport: setReactFlowViewport, getViewport, screenToFlowPosition } = useReactFlow();
  
  // Get drag state for widget opacity
  const { isDragging, isOverDropZone, dropZone } = useDragDrop();
  
  // History management for undo/redo
  const [history, setHistory] = useState<Node[][]>([initialNodes]); // History stack
  const [historyIndex, setHistoryIndex] = useState(0); // Current position in history

  // Custom selection state
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{ x: number; y: number } | null>(null);
  const [selectionBox, setSelectionBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());
  const [isZooming, setIsZooming] = useState(false);

  // Calculate initial viewport to center widgets
  const [initialViewport, setInitialViewport] = useState({ x: 0, y: 0, zoom: 0.6 });
  const [reactFlowKey, setReactFlowKey] = useState(0);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number }>({ visible: false, x: 0, y: 0 });

  // Calculate center of widgets only once when component mounts
  useEffect(() => {
    const calculateCenter = () => {
      if (initialNodes.length === 0) return { x: 0, y: 0, zoom: 0.6 };
      
      const positions = initialNodes.map(node => node.position);
      const minX = Math.min(...positions.map(p => p.x));
      const maxX = Math.max(...positions.map(p => p.x + 250)); // Add widget width
      const minY = Math.min(...positions.map(p => p.y));
      const maxY = Math.max(...positions.map(p => p.y + 150)); // Add widget height
      
      const widgetsCenterX = (minX + maxX) / 2;
      const widgetsCenterY = (minY + maxY) / 2;
      const zoom = 0.6;
      
      // Center widgets in viewport
      const x = window.innerWidth / 2 - widgetsCenterX * zoom;
      const y = window.innerHeight / 2 - widgetsCenterY * zoom;
      
      return { x, y, zoom };
    };

    const newViewport = calculateCenter();
    setInitialViewport(newViewport);
    
    // Set the ReactFlow viewport immediately to center on mount
    setTimeout(() => {
      setReactFlowViewport(newViewport);
    }, 0);
  }, [spaceName, setReactFlowViewport]); // Only depend on spaceName, not initialNodes

  // Handle window resize to maintain relative viewport position
  useEffect(() => {
    let previousWindowSize = { width: window.innerWidth, height: window.innerHeight };
    
    const handleResize = () => {
      const currentViewport = getViewport();
      const newWindowSize = { width: window.innerWidth, height: window.innerHeight };
      
      // Calculate the center point in flow coordinates
      const centerFlowX = (previousWindowSize.width / 2 - currentViewport.x) / currentViewport.zoom;
      const centerFlowY = (previousWindowSize.height / 2 - currentViewport.y) / currentViewport.zoom;
      
      // Calculate new viewport position to keep the same center point
      const newX = newWindowSize.width / 2 - centerFlowX * currentViewport.zoom;
      const newY = newWindowSize.height / 2 - centerFlowY * currentViewport.zoom;
      
      setReactFlowViewport({
        x: newX,
        y: newY,
        zoom: currentViewport.zoom
      });
      
      previousWindowSize = newWindowSize;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getViewport, setReactFlowViewport]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Custom selection logic
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    // Only start selection if clicking on the background (not on a node)
    const target = event.target as HTMLElement;
    const isBackground = target.classList.contains('react-flow__pane') || 
                        target.classList.contains('react-flow__background') ||
                        target.closest('.react-flow__background');
    
    if (isBackground && event.button === 0) { // Left mouse button
      event.preventDefault();
      const rect = event.currentTarget.getBoundingClientRect();
      const startPos = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
      
      setIsSelecting(true);
      setSelectionStart(startPos);
      setSelectionEnd(startPos);
      setSelectionBox({ x: startPos.x, y: startPos.y, width: 0, height: 0 });
      
      // Clear existing selection unless Cmd/Ctrl is held
      if (!event.metaKey && !event.ctrlKey) {
        setSelectedNodeIds(new Set());
        setNodes(nds => nds.map(node => ({ ...node, selected: false })));
      }
    }
  }, [setNodes]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (isSelecting && selectionStart) {
      const rect = event.currentTarget.getBoundingClientRect();
      const currentPos = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
      
      setSelectionEnd(currentPos);
      
      // Calculate selection box
      const box = {
        x: Math.min(selectionStart.x, currentPos.x),
        y: Math.min(selectionStart.y, currentPos.y),
        width: Math.abs(currentPos.x - selectionStart.x),
        height: Math.abs(currentPos.y - selectionStart.y)
      };
      setSelectionBox(box);
      
      // Convert screen coordinates to flow coordinates for node intersection
      const flowStart = screenToFlowPosition(selectionStart);
      const flowEnd = screenToFlowPosition(currentPos);
      
      const selectionBounds = {
        left: Math.min(flowStart.x, flowEnd.x),
        right: Math.max(flowStart.x, flowEnd.x),
        top: Math.min(flowStart.y, flowEnd.y),
        bottom: Math.max(flowStart.y, flowEnd.y)
      };
      
      // Update node selection based on intersection with selection box
      const newSelectedIds = new Set<string>();
      setNodes(nds => nds.map(node => {
        const nodeRight = node.position.x + (node.width || 200);
        const nodeBottom = node.position.y + (node.height || 100);
        
        const isIntersecting = !(
          node.position.x > selectionBounds.right ||
          nodeRight < selectionBounds.left ||
          node.position.y > selectionBounds.bottom ||
          nodeBottom < selectionBounds.top
        );
        
        if (isIntersecting) {
          newSelectedIds.add(node.id);
        }
        
        return { ...node, selected: isIntersecting };
      }));
      
      setSelectedNodeIds(newSelectedIds);
    }
  }, [isSelecting, selectionStart, screenToFlowPosition, setNodes]);

  // Handle mouse up for selection - now defined after saveToHistory
  const handleMouseUp = useCallback(() => {
    if (isSelecting) {
      // Clear selection UI but maintain the selected state
      setIsSelecting(false);
      setSelectionStart(null);
      setSelectionEnd(null);
      setSelectionBox(null);
      
      // The selectedNodeIds and node.selected states should persist
      console.log('Selection complete. Selected nodes:', Array.from(selectedNodeIds));
    }
  }, [isSelecting, selectedNodeIds]);

  // Custom onNodesChange with performance optimizations
  const handleNodesChange = useCallback((changes: any[]) => {
    // Batch position changes to reduce re-renders
    const positionChanges = changes.filter(change => change.type === 'position');
    const otherChanges = changes.filter(change => change.type !== 'position');
    
    // Filter out selection changes that would clear our custom selections
    const filteredChanges = [...otherChanges, ...positionChanges].filter(change => {
      if (change.type === 'select' && selectedNodeIds.has(change.id)) {
        // Prevent deselection of our custom selected nodes unless explicitly deselecting
        return change.selected !== false;
      }
      return true;
    });
    
    // Use requestAnimationFrame for position updates to smooth out movement
    if (positionChanges.length > 0) {
      requestAnimationFrame(() => {
        onNodesChange(filteredChanges);
      });
    } else {
      onNodesChange(filteredChanges);
    }
  }, [onNodesChange, selectedNodeIds]);

  // Save current state to history
  const saveToHistory = useCallback((newNodes: Node[]) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newNodes);
      return newHistory.slice(-50); // Keep last 50 states
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex, history, setNodes]);

  // Add global mouse up listener to handle mouse up outside the canvas
  useEffect(() => {
    if (isSelecting) {
      const handleGlobalMouseUp = () => handleMouseUp();
      document.addEventListener('mouseup', handleGlobalMouseUp);
      return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
    }
  }, [isSelecting, handleMouseUp]);

  // Handle canvas drop
  const handleCanvasDrop = useCallback((item: any, position: { x: number; y: number }) => {
    console.log('Item dropped on canvas:', item, 'at position:', position);
    
    // Convert screen position to ReactFlow position
    const reactFlowBounds = document.querySelector('.react-flow')?.getBoundingClientRect();
    if (!reactFlowBounds) return;
    
    // Calculate the position relative to the ReactFlow viewport
    const viewport = getViewport();
    const reactFlowPosition = {
      x: (position.x - reactFlowBounds.left - viewport.x) / viewport.zoom - 100, // Offset for widget center
      y: (position.y - reactFlowBounds.top - viewport.y) / viewport.zoom - 50,
    };
    
    // Create appropriate widget based on item type
    let newNode: Node;
    
    if (item.type === 'file') {
      const fileExtension = item.name.split('.').pop()?.toLowerCase() || 'file';
      newNode = {
        id: `file-${Date.now()}`,
        type: 'file',
        position: reactFlowPosition,
        data: {
          fileName: item.name,
          fileType: fileExtension as any,
          fileSize: item.data?.size ? `${(item.data.size / 1024 / 1024).toFixed(1)} MB` : 'Unknown size',
          filePath: item.data?.path || item.name,
          lastModified: item.data?.lastModified ? new Date(item.data.lastModified).toLocaleDateString() : 'Unknown',
          isDirectory: false,
          thumbnail: null,
          tags: [],
          status: 'ready' as const,
        },
      };
    } else {
      // Default to text widget for other items
      newNode = {
        id: `widget-${Date.now()}`,
        type: 'text',
        position: reactFlowPosition,
        data: {
          text: item.name || 'New Widget',
        },
      };
    }
    
    setNodes((nds) => {
      const newNodes = [...nds, newNode];
    saveToHistory(newNodes);
      return newNodes;
    });
  }, [setNodes, getViewport]);

  // Undo function
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setNodes(history[newIndex]);
    }
  }, [historyIndex, history, setNodes]);

  // Redo function
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setNodes(history[newIndex]);
    }
  }, [historyIndex, history, setNodes]);

  // Delete selected nodes
  const deleteSelectedNodes = () => {
    const selectedNodeIds = nodes
      .filter(node => node.selected)
      .map(node => node.id);
    
    if (selectedNodeIds.length > 0) {
      const newNodes = nodes.filter(node => !selectedNodeIds.includes(node.id));
      setNodes(newNodes);
      saveToHistory(newNodes);
      console.log(`Deleted ${selectedNodeIds.length} widget(s)`);
    }
  };

  // Copy selected nodes to clipboard
  const copySelectedNodes = useCallback(() => {
    const selectedNodes = nodes.filter(node => node.selected);
    if (selectedNodes.length > 0) {
      setClipboard(selectedNodes);
      console.log(`Copied ${selectedNodes.length} widget(s)`);
    }
  }, [nodes]);

  // Paste nodes from clipboard
  const pasteNodes = useCallback(() => {
    if (clipboard.length === 0) return;

    const pastedNodes = clipboard.map(node => ({
      ...node,
      id: `${node.type}-${Date.now()}-${Math.random()}`,
      position: {
        x: node.position.x + 20, // Offset to avoid overlap
        y: node.position.y + 20,
      },
      selected: true, // Select pasted nodes
    }));

    setNodes((nds) => {
      const newNodes = [
        ...nds.map(node => ({ ...node, selected: false })), // Deselect existing
        ...pastedNodes
      ];
      saveToHistory(newNodes); // Save to history
      return newNodes;
    });
    
    console.log(`Pasted ${pastedNodes.length} widget(s)`);
  }, [clipboard, setNodes, saveToHistory]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't handle shortcuts if user is typing in an input
      if ((event.target as HTMLElement)?.tagName === 'INPUT' || 
          (event.target as HTMLElement)?.tagName === 'TEXTAREA' ||
          (event.target as HTMLElement)?.contentEditable === 'true') {
        return;
      }

      // Cmd/Ctrl + Z for undo
      if ((event.metaKey || event.ctrlKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
        return;
      }

      // Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y for redo
      if (((event.metaKey || event.ctrlKey) && event.key === 'z' && event.shiftKey) ||
          ((event.metaKey || event.ctrlKey) && event.key === 'y')) {
        event.preventDefault();
        redo();
        return;
      }

      // Cmd/Ctrl + C for copy
      if ((event.metaKey || event.ctrlKey) && event.key === 'c') {
        event.preventDefault();
        copySelectedNodes();
        return;
      }

      // Cmd/Ctrl + V for paste
      if ((event.metaKey || event.ctrlKey) && event.key === 'v') {
        event.preventDefault();
        pasteNodes();
        return;
      }

      // Cmd/Ctrl + A for select all
      if ((event.metaKey || event.ctrlKey) && event.key === 'a') {
        event.preventDefault();
        setNodes(nds => nds.map(node => ({ ...node, selected: true })));
        return;
      }

      // Delete or Backspace for deleting selected nodes
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        deleteSelectedNodes();
        return;
      }

      // Cmd/Ctrl + Plus for zoom in
      if ((event.metaKey || event.ctrlKey) && (event.key === '=' || event.key === '+')) {
        event.preventDefault();
        setIsZooming(true);
        requestAnimationFrame(() => {
          zoomIn({ duration: 50 });
          setTimeout(() => setIsZooming(false), 100);
        });
        return;
      }

      // Cmd/Ctrl + Minus for zoom out
      if ((event.metaKey || event.ctrlKey) && event.key === '-') {
        event.preventDefault();
        setIsZooming(true);
        requestAnimationFrame(() => {
          zoomOut({ duration: 50 });
          setTimeout(() => setIsZooming(false), 100);
        });
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, copySelectedNodes, pasteNodes, deleteSelectedNodes, setNodes, zoomIn, zoomOut]);

  // Handle wheel events for zooming with improved smoothness and state tracking
  useEffect(() => {
    let zoomTimeout: NodeJS.Timeout;
    
    const handleWheel = (event: WheelEvent) => {
      if (event.metaKey || event.ctrlKey) {
        event.preventDefault();
        
        // Set zooming state
        setIsZooming(true);
        
        // Clear existing timeout
        if (zoomTimeout) clearTimeout(zoomTimeout);
        
        // Reset zooming state after zoom completes
        zoomTimeout = setTimeout(() => {
          setIsZooming(false);
        }, 150);
        
        const zoomDirection = event.deltaY > 0 ? 'out' : 'in';
        
        // Use requestAnimationFrame to ensure smooth rendering
        requestAnimationFrame(() => {
          if (zoomDirection === 'in') {
            zoomIn({ duration: 50 }); // Shorter duration for responsiveness
          } else {
            zoomOut({ duration: 50 });
          }
        });
      }
    };
    
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      if (zoomTimeout) clearTimeout(zoomTimeout);
    };
  }, [zoomIn, zoomOut]);

  // Modified nodes with conditional opacity - no transitions during interactions
  const nodesWithOpacity = useMemo(() => {
    const isInteracting = isSelecting || selectedNodeIds.size > 0 || isZooming;
    return nodes.map(node => ({
      ...node,
      style: {
        ...node.style,
        opacity: isDragging && dropZone === 'canvas' && isOverDropZone ? 0.5 : 1,
        // Remove transitions during any interaction to prevent glitches
        transition: isInteracting ? 'none' : 'opacity 0.2s ease-out',
        // Optimize rendering during interactions
        willChange: isInteracting ? 'transform' : 'auto',
      }
    }));
  }, [nodes, isDragging, dropZone, isOverDropZone, isSelecting, selectedNodeIds.size, isZooming]);

  // Right-click handler
  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({ visible: true, x: event.clientX, y: event.clientY });
  };

  // Hide menu on click elsewhere
  const handleCloseContextMenu = () => setContextMenu({ ...contextMenu, visible: false });

  return (
    <CanvasDropZone onDrop={handleCanvasDrop}>
      <div 
        style={{ 
          width: '100%', 
          height: '100%', 
          position: 'relative',
          zIndex: 10,
          backgroundColor: '#fafbfc',
          overflow: 'hidden',
          contain: isZooming ? 'layout style paint' : 'none',
          isolation: 'isolate', // force new stacking context
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onContextMenu={handleContextMenu}
        onClick={handleCloseContextMenu}
      >
        {/* React Flow Canvas */}
        <ReactFlow
          nodes={nodesWithOpacity}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          defaultViewport={{ x: initialViewport.x, y: initialViewport.y, zoom: initialViewport.zoom }}
          fitView={false}
          selectionMode={SelectionMode.Partial}
          multiSelectionKeyCode={null}
          selectionKeyCode={null}
          deleteKeyCode="Delete"
          panOnDrag={[1, 2]}
          panOnScroll={true}
          zoomOnScroll={false}
          zoomOnPinch={true}
          zoomOnDoubleClick={false}
          preventScrolling={false}
          proOptions={{ hideAttribution: true }}
          style={{
            backgroundColor: '#fafbfc',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Background
            variant={BackgroundVariant.Lines}
            gap={60}
            size={1}
            color="#f3f4f6"
            style={{
              backgroundColor: '#fafbfc',
              opacity: 1,
              willChange: 'auto',
            }}
            patternClassName="space-canvas-grid"
          />
        </ReactFlow>

        {/* Selection Box Overlay */}
        {selectionBox && (
          <div
            style={{
              position: 'absolute',
              left: selectionBox.x,
              top: selectionBox.y,
              width: selectionBox.width,
              height: selectionBox.height,
              border: '0.5px solid rgba(255, 255, 255, 0.9)',
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
              pointerEvents: 'none',
              zIndex: 1000,
              borderRadius: '0px',
            }}
          />
        )}
        {/* Context Menu */}
        <SpaceCanvasContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          visible={contextMenu.visible}
          onClose={handleCloseContextMenu}
        />
      </div>
    </CanvasDropZone>
  );
};

const SpaceCanvas: React.FC<SpaceCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <SpaceCanvasInner {...props} />
    </ReactFlowProvider>
  );
};

export default SpaceCanvas; 