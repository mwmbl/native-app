import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Tab {
  id: string;
  url: string;
  title: string;
  canGoBack: boolean;
  canGoForward: boolean;
}

interface TabsContextType {
  tabs: Tab[];
  activeTabId: string | null;
  activeTab: Tab | null;
  createTab: (url: string, title: string) => string;
  closeTab: (tabId: string) => void;
  switchTab: (tabId: string) => void;
  updateTab: (tabId: string, updates: Partial<Tab>) => void;
  closeAllTabs: () => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export function TabsProvider({ children }: { children: ReactNode }) {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  const createTab = (url: string, title: string): string => {
    const newTab: Tab = {
      id: Date.now().toString(),
      url,
      title,
      canGoBack: false,
      canGoForward: false,
    };

    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
    return newTab.id;
  };

  const closeTab = (tabId: string) => {
    setTabs((prev) => {
      const filtered = prev.filter((tab) => tab.id !== tabId);
      
      // If closing active tab, switch to another tab
      if (tabId === activeTabId) {
        const currentIndex = prev.findIndex((tab) => tab.id === tabId);
        if (filtered.length > 0) {
          // Switch to the previous tab, or the next one if it was the first
          const newActiveTab = filtered[Math.max(0, currentIndex - 1)];
          setActiveTabId(newActiveTab.id);
        } else {
          setActiveTabId(null);
        }
      }
      
      return filtered;
    });
  };

  const switchTab = (tabId: string) => {
    setActiveTabId(tabId);
  };

  const updateTab = (tabId: string, updates: Partial<Tab>) => {
    setTabs((prev) =>
      prev.map((tab) => (tab.id === tabId ? { ...tab, ...updates } : tab))
    );
  };

  const closeAllTabs = () => {
    setTabs([]);
    setActiveTabId(null);
  };

  const activeTab = tabs.find((tab) => tab.id === activeTabId) || null;

  return (
    <TabsContext.Provider
      value={{
        tabs,
        activeTabId,
        activeTab,
        createTab,
        closeTab,
        switchTab,
        updateTab,
        closeAllTabs,
      }}
    >
      {children}
    </TabsContext.Provider>
  );
}

export function useTabs() {
  const context = useContext(TabsContext);
  if (context === undefined) {
    throw new Error('useTabs must be used within a TabsProvider');
  }
  return context;
}

