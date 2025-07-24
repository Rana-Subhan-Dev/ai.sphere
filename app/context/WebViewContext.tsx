'use client';

import React, { createContext, useContext, ReactNode } from 'react';

interface WebViewTab {
  id: string;
  url: string;
  title: string;
  favicon?: string;
}

interface WebViewContextType {
  openWebView: (url: string) => void;
  goBack: () => void;
  goForward: () => void;
  refresh: () => void;
  newTab: () => void;
  closeTab: (tabId: string) => void;
  switchTab: (tabId: string) => void;
  tabs: WebViewTab[];
  activeTabId: string | null;
  tabCount: number;
}

const WebViewContext = createContext<WebViewContextType | undefined>(undefined);

interface WebViewProviderProps {
  children: ReactNode;
  onWebViewOpen: (url: string) => void;
  onWebViewBack?: () => void;
  onWebViewForward?: () => void;
  onWebViewRefresh?: () => void;
  onWebViewNewTab?: () => void;
  onTabClose?: (tabId: string) => void;
  onTabSwitch?: (tabId: string) => void;
  tabs?: WebViewTab[];
  activeTabId?: string | null;
}

export const WebViewProvider: React.FC<WebViewProviderProps> = ({ 
  children, 
  onWebViewOpen, 
  onWebViewBack,
  onWebViewForward,
  onWebViewRefresh,
  onWebViewNewTab,
  onTabClose,
  onTabSwitch,
  tabs = [],
  activeTabId = null
}) => {
  const openWebView = (url: string) => {
    onWebViewOpen(url);
  };

  const goBack = () => {
    onWebViewBack?.();
  };

  const goForward = () => {
    onWebViewForward?.();
  };

  const refresh = () => {
    onWebViewRefresh?.();
  };

  const newTab = () => {
    onWebViewNewTab?.();
  };

  const closeTab = (tabId: string) => {
    onTabClose?.(tabId);
  };

  const switchTab = (tabId: string) => {
    onTabSwitch?.(tabId);
  };

  return (
    <WebViewContext.Provider value={{ 
      openWebView, 
      goBack, 
      goForward, 
      refresh, 
      newTab,
      closeTab,
      switchTab,
      tabs,
      activeTabId,
      tabCount: tabs.length
    }}>
      {children}
    </WebViewContext.Provider>
  );
};

export const useWebView = () => {
  const context = useContext(WebViewContext);
  if (context === undefined) {
    throw new Error('useWebView must be used within a WebViewProvider');
  }
  return context;
};

export type { WebViewTab }; 