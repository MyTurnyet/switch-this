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
export const StatCard: React.FC<StatCardProps> = ({ count, label, isLoading = false }) => (
  <div 
    role="article"
    data-testid="stat-card"
    className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
  >
    <div className="text-5xl font-bold text-indigo-600 mb-2">
      {isLoading ? (
        <div className="animate-pulse" data-testid="loading-pulse">...</div>
      ) : (
        <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
          {count}
        </span>
      )}
    </div>
    <div className="text-gray-600 text-lg font-medium">{label}</div>
  </div>
); 