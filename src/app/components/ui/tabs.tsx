'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  defaultTabId?: string;
  onChange?: (tabId: string) => void;
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
}

export function Tabs({
  items,
  defaultTabId,
  onChange,
  className,
  variant = 'default',
  size = 'md',
}: TabsProps) {
  // Use the first non-disabled tab as default if not specified
  const firstEnabledTabId = items.find(item => !item.disabled)?.id;
  const [activeTabId, setActiveTabId] = useState(defaultTabId || firstEnabledTabId || items[0]?.id);

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTabId(tabId);
    onChange?.(tabId);
  };

  // Get the active tab content
  const activeTab = items.find(item => item.id === activeTabId);

  // Style variants for the tabs
  const tabVariants = {
    default: 'border-b border-gray-200',
    pills: 'space-x-2',
    underline: 'border-b border-gray-200',
  };

  const tabItemVariants = {
    default: (isActive: boolean) =>
      cn(
        'px-4 py-2 font-medium text-sm focus:outline-none',
        isActive
          ? 'border-b-2 border-primary-600 text-primary-600'
          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent'
      ),
    pills: (isActive: boolean) =>
      cn(
        'px-4 py-2 rounded-full font-medium text-sm focus:outline-none',
        isActive
          ? 'bg-primary-600 text-white'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
      ),
    underline: (isActive: boolean) =>
      cn(
        'px-4 py-2 font-medium text-sm focus:outline-none',
        isActive
          ? 'border-b-2 border-primary-600 text-primary-600'
          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
      ),
  };

  const tabSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Tab navigation */}
      <div className={cn('flex', tabVariants[variant])}>
        {items.map(tab => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && handleTabChange(tab.id)}
            className={cn(
              tabItemVariants[variant](activeTabId === tab.id),
              tabSizes[size],
              tab.disabled && 'opacity-50 cursor-not-allowed'
            )}
            disabled={tab.disabled}
            role="tab"
            aria-selected={activeTabId === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            data-testid={`tab-${tab.id}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-4" role="tabpanel" id={`tabpanel-${activeTabId}`}>
        {activeTab?.content}
      </div>
    </div>
  );
} 