import React from 'react';

interface StatCardProps {
  count: number;
  label: string;
}

/**
 * A reusable card component for displaying statistics
 * @param count - The numeric value to display
 * @param label - The label text for the statistic
 */
export const StatCard: React.FC<StatCardProps> = ({ count, label }) => (
  <div role="article" className="bg-white p-6 rounded-lg shadow-md">
    <div className="text-4xl font-bold text-blue-600">{count}</div>
    <div className="text-gray-600 mt-2">{label}</div>
  </div>
); 