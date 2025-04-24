import React from 'react';

export interface StatCardProps {
  count: number;
  label: string;
  isLoading?: boolean;
}

/**
 * A reusable card component for displaying statistics
 * @param count - The numeric value to display
 * @param label - The label text for the statistic
 * @param isLoading - Indicates whether the component is in a loading state
 */
export const StatCard: React.FC<StatCardProps> = ({ count, label, isLoading }) => (
  <div role="article" className="bg-white p-6 rounded-lg shadow-md">
    <div className="text-4xl font-bold text-blue-600">
      {isLoading ? '...' : count}
    </div>
    <div className="text-gray-600 mt-2">{label}</div>
  </div>
); 